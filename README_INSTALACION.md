# README de Instalación - Trading Academy

Este documento explica cómo preparar y ejecutar el proyecto **Trading Academy** en tu propia computadora.

## 1) Requisitos previos

- **Node.js 18 o superior**
- **npm** (se instala con Node.js)
- **PostgreSQL** (servidor local o remoto)
- Conexión a internet para instalar dependencias

> Recomendado: usar Node.js 18 LTS o 20 LTS.

## 2) Instalar dependencias del proyecto

Ubícate en la carpeta del proyecto y ejecuta:

```bash
npm install
```

## 3) Configurar variables de entorno (.env)

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Edita `.env` y coloca tus valores reales.

Variables esperadas:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ABACUSAI_API_KEY`
- `WEB_APP_ID`
- `NOTIF_ID_VERIFICACIN_DE_EMAIL`
- `NEXT_DIST_DIR` (opcional)
- `NEXT_OUTPUT_MODE` (opcional)

## 4) Crear la base de datos PostgreSQL

Asegúrate de que PostgreSQL esté activo y luego crea una base de datos para el proyecto.

Ejemplo con `psql`:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE trading_academy;"
```

Después, en `.env`, ajusta `DATABASE_URL` a tu configuración. Ejemplo:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/trading_academy"
```

## 5) Sincronizar Prisma (obligatorio)

Ejecuta estos comandos en este orden:

```bash
npx prisma generate
npx prisma db push
```

Esto genera el cliente Prisma y crea/actualiza las tablas en tu base de datos.

## 6) Iniciar el servidor de desarrollo

```bash
npm run dev
```

Si todo está bien, abre en tu navegador:

- `http://localhost:3000`

## 7) Credenciales de acceso

- **Administrador**
  - Correo: `admin@tradingacademy.com`
  - Contraseña: `Admin12345`

- **Usuario cliente**
  - Correo: `usuario@tradingacademy.com`
  - Contraseña: `Cliente12345`

## 8) Solución de problemas comunes

### Error: `DATABASE_URL` no definida o inválida
- Verifica que exista el archivo `.env`.
- Confirma que `DATABASE_URL` tenga formato correcto.
- Revisa que PostgreSQL esté encendido.

### Error de conexión a PostgreSQL
- Comprueba host, puerto, usuario y contraseña.
- Verifica que la base de datos exista.
- Prueba conexión manual con `psql`.

### Error al ejecutar Prisma
- Vuelve a ejecutar:
  ```bash
  npx prisma generate
  npx prisma db push
  ```
- Si persiste, elimina `node_modules` y reinstala dependencias con `npm install`.

### Puerto 3000 ocupado
- Next.js puede cambiar automáticamente a 3001.
- Cierra el proceso que usa el 3000 o ejecuta en otro puerto.

### Cambios en variables `.env` no reflejados
- Detén el servidor (`Ctrl + C`) y vuelve a iniciar con `npm run dev`.

## 9) Puertos y URLs

- Aplicación web (desarrollo): `http://localhost:3000`
- Si 3000 está ocupado: `http://localhost:3001`

---

Listo. Con estos pasos el proyecto queda funcionando en entorno local.
