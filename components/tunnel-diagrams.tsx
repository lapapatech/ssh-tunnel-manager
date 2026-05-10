'use client'

import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'

// Animated data packet component
function DataPacket({ x1, y1, x2, y2, delay = 0, color = '#3b82f6' }: { x1: number; y1: number; x2: number; y2: number; delay?: number; color?: string }) {
  return (
    <motion.circle
      r="4"
      fill={color}
      opacity={0.9}
      initial={{ cx: x1, cy: y1, opacity: 0 }}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0, 0.9, 0.9, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// Animated dashed tunnel line
function TunnelLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray="8 4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1, strokeDashoffset: [0, -24] }}
        transition={{
          pathLength: { duration: 1, ease: 'easeInOut' },
          strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: 'linear' },
        }}
      />
      {/* Glow effect */}
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#10b981"
        strokeWidth="8"
        strokeDasharray="8 4"
        strokeLinecap="round"
        opacity={0.15}
        animate={{ strokeDashoffset: [0, -24] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </>
  )
}

// Computer icon as SVG path
function ComputerIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-22" y="-18" width="44" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
      <rect x="-18" y="-14" width="36" height="22" rx="1" fill="currentColor" className="text-muted" opacity={0.3} />
      <line x1="-8" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="2" className="text-foreground" />
      <line x1="0" y1="12" x2="0" y2="16" stroke="currentColor" strokeWidth="2" className="text-foreground" />
    </g>
  )
}

// Server icon
function ServerIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-20" y="-24" width="40" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
      <rect x="-20" y="-6" width="40" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
      <rect x="-20" y="12" width="40" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
      <circle cx="12" cy="-16" r="2.5" fill="#10b981" />
      <circle cx="12" cy="2" r="2.5" fill="#10b981" />
      <circle cx="12" cy="20" r="2.5" fill="#10b981" />
      <line x1="-12" y1="-16" x2="4" y2="-16" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
      <line x1="-12" y1="2" x2="4" y2="2" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
      <line x1="-12" y1="20" x2="4" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
    </g>
  )
}

// Firewall icon
function FirewallIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-14" y="-20" width="28" height="40" rx="2" fill="none" stroke="#f97316" strokeWidth="2" />
      <rect x="-10" y="-16" width="8" height="8" rx="1" fill="#f97316" opacity={0.3} />
      <rect x="2" y="-16" width="8" height="8" rx="1" fill="#f97316" opacity={0.3} />
      <rect x="-10" y="-4" width="8" height="8" rx="1" fill="#f97316" opacity={0.3} />
      <rect x="2" y="-4" width="8" height="8" rx="1" fill="#f97316" opacity={0.3} />
      <rect x="-10" y="8" width="8" height="8" rx="1" fill="#f97316" opacity={0.3} />
      <rect x="2" y="8" width="8" height="8" rx="1" fill="#f97316" opacity={0.3} />
      {/* Flame on top */}
      <path d="M0 -28 C-4 -24 -6 -20 -4 -16 C-2 -20 0 -22 0 -22 C0 -22 2 -20 4 -16 C6 -20 4 -24 0 -28Z" fill="#f97316" opacity={0.8} />
    </g>
  )
}

// Internet cloud
function CloudIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d="M-30 8 C-30 8 -34 8 -34 2 C-34 -4 -28 -8 -22 -8 C-20 -14 -12 -18 -4 -18 C8 -18 18 -10 18 -2 C24 -2 28 4 28 10 C28 16 22 18 16 18 L-22 18 C-28 18 -34 14 -34 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-foreground"
      />
      <path
        d="M-30 8 C-30 8 -34 8 -34 2 C-34 -4 -28 -8 -22 -8 C-20 -14 -12 -18 -4 -18 C8 -18 18 -10 18 -2 C24 -2 28 4 28 10 C28 16 22 18 16 18 L-22 18 C-28 18 -34 14 -34 8Z"
        fill="currentColor"
        className="text-muted"
        opacity={0.15}
      />
    </g>
  )
}

// === LOCAL PORT FORWARDING DIAGRAM ===
export function LocalForwardingDiagram() {
  const { t } = useTranslation()

  return (
    <svg viewBox="0 0 800 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="localGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
          <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
        </linearGradient>
      </defs>

      {/* Background tunnel area */}
      <rect x="160" y="80" width="480" height="140" rx="12" fill="url(#localGrad)" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />

      {/* Labels */}
      <text x="100" y="50" textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
        {t('diagrams').yourComputer}
      </text>
      <text x="400" y="70" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="11">
        {t('diagrams').sshTunnelEncrypted}
      </text>
      <text x="700" y="50" textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
        {t('diagrams').remoteServer}
      </text>

      {/* Your Computer */}
      <ComputerIcon x={100} y={150} />

      {/* Local App Icon */}
      <g transform="translate(100, 105)">
        <rect x="-16" y="-10" width="32" height="20" rx="3" fill="#3b82f6" opacity={0.15} stroke="#3b82f6" strokeWidth="1.5" />
        <text x="0" y="3" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="600">APP</text>
      </g>

      {/* Firewall */}
      <FirewallIcon x={400} y={150} />
      <text x="400" y="200" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">
        {t('diagrams').firewall}
      </text>

      {/* Server */}
      <ServerIcon x={700} y={150} />

      {/* Service Icon */}
      <g transform="translate(700, 105)">
        <rect x="-20" y="-10" width="40" height="20" rx="3" fill="#8b5cf6" opacity={0.15} stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="0" y="3" textAnchor="middle" fill="#8b5cf6" fontSize="8" fontWeight="600">SERVICE</text>
      </g>

      {/* Tunnel lines */}
      <TunnelLine x1={130} y1={150} x2={370} y2={150} />
      <TunnelLine x1={430} y1={150} x2={670} y2={150} />

      {/* Data packets - left to right (local → remote) */}
      <DataPacket x1={140} y1={150} x2={360} y2={150} delay={0} color="#3b82f6" />
      <DataPacket x1={140} y1={150} x2={360} y2={150} delay={0.7} color="#3b82f6" />
      <DataPacket x1={440} y1={150} x2={660} y2={150} delay={1} color="#8b5cf6" />
      <DataPacket x1={440} y1={150} x2={660} y2={150} delay={1.7} color="#8b5cf6" />

      {/* Port labels */}
      <g>
        <rect x="50" y="195" width="100" height="22" rx="4" fill="#10b981" opacity={0.12} />
        <text x="100" y="210" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize="10" fontWeight="600">
          localhost:PORT
        </text>
      </g>
      <g>
        <rect x="650" y="195" width="100" height="22" rx="4" fill="#10b981" opacity={0.12} />
        <text x="700" y="210" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize="10" fontWeight="600">
          remote:PORT
        </text>
      </g>

      {/* Flow arrow labels */}
      <text x="250" y="240" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        App → localhost:PORT
      </text>
      <text x="550" y="240" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        SSH → remote:PORT
      </text>

      {/* Direction arrow */}
      <motion.g
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points="770,146 780,150 770,154" fill="#10b981" opacity={0.6} />
      </motion.g>
    </svg>
  )
}

// === REMOTE PORT FORWARDING DIAGRAM ===
export function RemoteForwardingDiagram() {
  const { t } = useTranslation()

  return (
    <svg viewBox="0 0 800 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="remoteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.1} />
          <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
        </linearGradient>
      </defs>

      {/* Background tunnel area */}
      <rect x="160" y="80" width="480" height="140" rx="12" fill="url(#remoteGrad)" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />

      {/* Labels */}
      <text x="100" y="50" textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
        {t('diagrams').yourComputer}
      </text>
      <text x="400" y="70" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="11">
        {t('diagrams').sshTunnelEncrypted}
      </text>
      <text x="700" y="50" textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
        {t('diagrams').remoteServer}
      </text>

      {/* Your Computer */}
      <ComputerIcon x={100} y={150} />

      {/* Local Service Icon */}
      <g transform="translate(100, 105)">
        <rect x="-22" y="-10" width="44" height="20" rx="3" fill="#8b5cf6" opacity={0.15} stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="0" y="3" textAnchor="middle" fill="#8b5cf6" fontSize="7" fontWeight="600">SERVICE</text>
      </g>

      {/* Firewall */}
      <FirewallIcon x={400} y={150} />
      <text x="400" y="200" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">
        {t('diagrams').firewall}
      </text>

      {/* Server */}
      <ServerIcon x={700} y={150} />

      {/* Remote Clients Icon */}
      <g transform="translate(700, 105)">
        <rect x="-22" y="-10" width="44" height="20" rx="3" fill="#3b82f6" opacity={0.15} stroke="#3b82f6" strokeWidth="1.5" />
        <text x="0" y="3" textAnchor="middle" fill="#3b82f6" fontSize="7" fontWeight="600">CLIENTS</text>
      </g>

      {/* Tunnel lines */}
      <TunnelLine x1={130} y1={150} x2={370} y2={150} />
      <TunnelLine x1={430} y1={150} x2={670} y2={150} />

      {/* Data packets - right to left (remote → local) */}
      <DataPacket x1={660} y1={150} x2={440} y2={150} delay={0} color="#3b82f6" />
      <DataPacket x1={660} y1={150} x2={440} y2={150} delay={0.7} color="#3b82f6" />
      <DataPacket x1={360} y1={150} x2={140} y2={150} delay={1} color="#8b5cf6" />
      <DataPacket x1={360} y1={150} x2={140} y2={150} delay={1.7} color="#8b5cf6" />

      {/* Port labels */}
      <g>
        <rect x="50" y="195" width="100" height="22" rx="4" fill="#8b5cf6" opacity={0.12} />
        <text x="100" y="210" textAnchor="middle" className="fill-violet-600 dark:fill-violet-400" fontSize="10" fontWeight="600">
          localhost:PORT
        </text>
      </g>
      <g>
        <rect x="650" y="195" width="100" height="22" rx="4" fill="#3b82f6" opacity={0.12} />
        <text x="700" y="210" textAnchor="middle" className="fill-blue-600 dark:fill-blue-400" fontSize="10" fontWeight="600">
          remote:PORT
        </text>
      </g>

      {/* Flow labels */}
      <text x="250" y="240" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        SSH → localhost:PORT
      </text>
      <text x="550" y="240" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        Clients → remote:PORT
      </text>

      {/* Direction arrow (pointing left - reverse flow) */}
      <motion.g
        animate={{ x: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points="30,146 20,150 30,154" fill="#10b981" opacity={0.6} />
      </motion.g>
    </svg>
  )
}

// === DYNAMIC (SOCKS) PORT FORWARDING DIAGRAM ===
export function DynamicForwardingDiagram() {
  const { t } = useTranslation()

  return (
    <svg viewBox="0 0 800 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dynamicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.1} />
          <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
        </linearGradient>
      </defs>

      {/* Background tunnel area */}
      <rect x="140" y="80" width="400" height="140" rx="12" fill="url(#dynamicGrad)" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />

      {/* Labels */}
      <text x="80" y="50" textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
        {t('diagrams').yourComputer}
      </text>
      <text x="340" y="70" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="11">
        {t('diagrams').sshTunnelSocks}
      </text>
      <text x="570" y="50" textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
        {t('diagrams').remoteServer}
      </text>
      <text x="710" y="50" textAnchor="middle" className="text-sm font-semibold fill-foreground" fontSize="14">
        {t('diagrams').internet}
      </text>

      {/* Your Computer */}
      <ComputerIcon x={80} y={150} />

      {/* Browser/Apps Icons */}
      <g transform="translate(80, 100)">
        <rect x="-26" y="-10" width="52" height="20" rx="3" fill="#06b6d4" opacity={0.15} stroke="#06b6d4" strokeWidth="1.5" />
        <text x="0" y="3" textAnchor="middle" fill="#06b6d4" fontSize="7" fontWeight="600">BROWSER</text>
      </g>

      {/* SOCKS Proxy badge */}
      <g transform="translate(200, 100)">
        <rect x="-32" y="-12" width="64" height="24" rx="6" fill="#10b981" opacity={0.15} stroke="#10b981" strokeWidth="1.5" />
        <text x="0" y="3" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="700">SOCKS5</text>
      </g>

      {/* Server */}
      <ServerIcon x={570} y={150} />

      {/* Internet Cloud */}
      <CloudIcon x={710} y={150} />

      {/* Tunnel lines */}
      <TunnelLine x1={110} y1={150} x2={530} y2={150} />

      {/* Line from server to internet */}
      <motion.line
        x1={595}
        y1={150}
        x2={670}
        y2={150}
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="6 3"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -18] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Data packets through tunnel */}
      <DataPacket x1={120} y1={150} x2={520} y2={150} delay={0} color="#06b6d4" />
      <DataPacket x1={120} y1={150} x2={520} y2={150} delay={0.5} color="#06b6d4" />
      <DataPacket x1={120} y1={150} x2={520} y2={150} delay={1.0} color="#10b981" />
      <DataPacket x1={120} y1={150} x2={520} y2={150} delay={1.5} color="#10b981" />

      {/* Data packets from server to internet */}
      <DataPacket x1={600} y1={150} x2={670} y2={150} delay={0.8} color="#f59e0b" />
      <DataPacket x1={600} y1={150} x2={670} y2={150} delay={1.6} color="#f59e0b" />

      {/* Multiple destination labels in internet */}
      <text x="710" y="125" textAnchor="middle" className="fill-muted-foreground" fontSize="9">
        {t('diagrams').anyDestination}
      </text>
      <g transform="translate(710, 180)">
        <rect x="-28" y="-8" width="56" height="16" rx="3" fill="#f59e0b" opacity={0.12} />
        <text x="0" y="3" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="600">ANY HOST</text>
      </g>

      {/* Port label */}
      <g>
        <rect x="28" y="195" width="104" height="22" rx="4" fill="#10b981" opacity={0.12} />
        <text x="80" y="210" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize="10" fontWeight="600">
          SOCKS :PORT
        </text>
      </g>

      {/* Flow label */}
      <text x="320" y="240" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        {t('diagrams').flowDynamic}
      </text>

      {/* Direction arrow */}
      <motion.g
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points="640,146 650,150 640,154" fill="#f59e0b" opacity={0.6} />
      </motion.g>
    </svg>
  )
}
