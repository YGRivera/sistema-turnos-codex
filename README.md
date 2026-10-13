# Turnia — Sistema de turnos

Aplicación de atención al cliente construida con Next.js 15, TypeScript, Tailwind CSS 4 y App Router.

## Instalación

Requisitos: Node.js 20.9 o superior y npm.

```bash
git clone https://github.com/YGRivera/sistema-turnos-codex.git
cd sistema-turnos-codex
npm install
npm run dev
```

Abre http://localhost:3000.

## Funcionalidades

- Emisión de turnos consecutivos.
- Panel de operador con selección de módulo y llamado del siguiente cliente.
- Pantalla pública con turno actual y últimos cuatro llamados.
- Persistencia local y sincronización entre pestañas del mismo navegador.
- Diseño adaptable, en español y con tema oscuro.

## Despliegue en Vercel

Importa este repositorio desde Vercel; Next.js se detecta automáticamente.

Los turnos se guardan en el navegador y no se comparten entre dispositivos. Para operación multiusuario hace falta conectar una base de datos y un canal de eventos en tiempo real.
