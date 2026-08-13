"# nini_pijamas

Tienda ecommerce para pijamas femeninas con arquitectura separada `frontend` / `backend`.

## Estructura

- `frontend/`: Next.js App Router, Tailwind CSS, UI, carrito, checkout, login, admin UI.
- `backend/`: Node.js con Express, Prisma, PostgreSQL, autenticación, roles, pedidos, WhatsApp y pagos mock.

## Requisitos

- Node.js 18+
- PostgreSQL

## Instalación

1. Copia `.env.example` a `.env` en la raíz y completa las variables.
2. Ejecuta `npm install` en la raíz para instalar dependencias en ambos paquetes.
3. Ejecuta `npm run prisma:generate`.
4. Ejecuta `npm run migrate`.
5. Ejecuta `npm run seed`.

## Scripts

- `npm run dev` - Inicia frontend y backend juntos.
- `npm run dev:frontend` - Inicia solo el frontend.
- `npm run dev:backend` - Inicia solo el backend.
- `npm run build` - Compila frontend y backend.
- `npm run lint` - Revisa frontend y backend.
- `npm run typecheck` - Ejecuta TypeScript en frontend y backend.
- `npm run prisma:generate` - Genera cliente Prisma.
- `npm run migrate` - Aplica migraciones de Prisma.
- `npm run seed` - Crea datos demo.

## Usuarios demo

- Admin: `admin@ninipijamas.ec` / `Admin2026!`
- Cliente 1: `cliente@ninipijamas.ec` / `Cliente2026!`
- Cliente 2: `cliente2@ninipijamas.ec` / `Cliente2026!`

## URLs principales

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`

## Páginas públicas principales

- `/` - Inicio
- `/catalogo` - Catálogo
- `/ofertas` - Ofertas
- `/nuevos` - Nuevos ingresos
- `/product/[slug]` - Producto detalle
- `/carrito` - Carrito
- `/checkout` - Checkout
- `/contacto` - Contacto
- `/mi-cuenta` - Mi cuenta
- `/login` - Login
- `/admin` - Panel admin

## Imágenes y branding

- El logo está listo en `frontend/public/logo.svg`.
- El catálogo usa imágenes placeholder suaves en `frontend/public/product-1.svg`, `product-2.svg` y `product-3.svg`.
- Estas imágenes se pueden reemplazar fácilmente con fotos reales de pijamas.

## Pagos

- Modo transferencia bancaria mock con datos desde `.env`.
- Pasarela de pago preparada para integraciones futuras con Kushki o Stripe.
- No se genera cobro real en local.

## WhatsApp Cloud API

- Variables: `WHATSAPP_CLOUD_ACCESS_TOKEN`, `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_CLOUD_API_VERSION`.
- Si faltan credenciales en desarrollo, el backend simula el envío.
- En producción, sin credenciales el envío falla con error.

## Qué falta para producción

- Credenciales reales de WhatsApp Cloud API.
- Integración real de pasarela de pagos y webhooks.
- Certificados HTTPS y dominio.
- Validación de imágenes y carga en CDN.
- Auditoría de seguridad y respaldo de base de datos.
" 
