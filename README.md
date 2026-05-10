# SSH Port Forwarding Manager

Aplicación web para gestionar túneles SSH de redirección de puertos (Local, Remote y Dynamic/SOCKS).

## Stack

- **Next.js 16** + TypeScript + Tailwind CSS + shadcn/ui
- **Prisma** + SQLite para persistencia
- **Socket.io** + ssh2 para gestión real de túneles
- **Zustand** para estado del cliente
- **Framer Motion** para animaciones

## Instalación rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos
npx prisma db push

# 3. Instalar dependencias del servicio de túneles
cd mini-services/tunnel-service
npm install
cd ../..

# 4. Iniciar el servicio de túneles (en otra terminal)
cd mini-services/tunnel-service
npm run dev

# 5. Iniciar la app (en otra terminal)
npm run dev

# 6. Abrir http://localhost:3000
```

## Estructura del proyecto

```
├── src/
│   ├── app/              # Páginas y API routes (Next.js App Router)
│   │   ├── api/tunnels/  # CRUD + start/stop de túneles
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           # Componentes shadcn/ui
│   │   ├── tunnel-manager.tsx
│   │   ├── tunnel-form.tsx
│   │   ├── tunnel-list.tsx
│   │   ├── tunnel-diagrams.tsx
│   │   ├── tunnel-explanations.tsx
│   │   ├── export-import-panel.tsx
│   │   └── language-selector.tsx
│   ├── lib/
│   │   ├── i18n.ts       # Sistema de traducciones
│   │   ├── tunnel-store.ts # Estado Zustand
│   │   ├── db.ts         # Cliente Prisma
│   │   └── utils.ts
│   └── hooks/
├── prisma/
│   └── schema.prisma
├── mini-services/
│   └── tunnel-service/   # Servicio Socket.io + ssh2 (puerto 3003)
└── package.json
```

## Idiomas

La app soporta Español e Inglés con un selector en la esquina superior derecha.

## Funcionalidades

- Local Forwarding (-L): Accede a servicios remotos desde tu equipo
- Remote Forwarding (-R): Expone servicios locales a internet
- Dynamic Forwarding (-D): Proxy SOCKS5 para todo el tráfico
- Diagramas animados de cada tipo de redirección
- Explicaciones educativas con comandos y casos de uso
- Exportar/Importar configuraciones como JSON
- Bilingüe ES/EN
