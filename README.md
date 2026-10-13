# Turnia — Sistema de turnos

Aplicación web de gestión de filas para atención al cliente, construida con Next.js 15, TypeScript, Tailwind CSS 4 y App Router.

## Requisitos

- Node.js 20.9 o superior
- npm

## Instalación

```bash
git clone https://github.com/YGRivera/sistema-turnos-codex.git
cd sistema-turnos-codex
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Funcionalidades

- Emisión de turnos consecutivos desde **Tomar turno**.
- Panel de operador con selección de módulo, turno activo y llamado de la siguiente persona.
- Pantalla pública con turno actual, módulo y los cuatro últimos llamados.
- Estado compartido entre dispositivos mediante Neon Postgres; las pantallas consultan el estado nuevo cada dos segundos.
- Diseño adaptable a móvil y escritorio, en español y con tema oscuro.

## Scripts

- `npm run dev`: servidor local.
- `npm run build`: compilación de producción.
- `npm start`: sirve la compilación.
- `npm run typecheck`: comprobación de TypeScript.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel, elige **Add New → Project** e importa el repositorio.
3. Vercel detecta Next.js automáticamente. Antes de desplegar, conecta una base de datos Neon desde **Project → Storage → Create Database → Neon**.
4. Acepta los términos del proveedor, crea la base y comprueba que `DATABASE_URL` quede conectado al proyecto en los entornos Production, Preview y Development.
5. Pulsa **Deploy**. La tabla de estado se crea automáticamente en la primera petición.

También puedes ejecutar `vercel` desde la terminal con Vercel CLI instalada y autenticada.

## Almacenamiento local

Para desarrollo local, copia `.env.example` como `.env.local` y configura `DATABASE_URL` con una cadena de conexión Neon. La aplicación requiere esa variable para compartir el estado entre dispositivos. La pantalla consulta cambios cada dos segundos.

