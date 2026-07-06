# 🎓 Proyecto Final de Máster · Backend

<div align="center">

**Repositorio:** [`xenixui/proyecto-final-backend`](https://github.com/xenixui/proyecto-final-backend)

API backend del proyecto final, encargada de autenticación, lógica de negocio y acceso a base de datos.

</div>

---

## 📌 Descripción

Este repositorio implementa el **backend** del Proyecto Final de Máster.
Provee una **API REST** para gestionar autenticación de usuarios y funcionalidades principales de la aplicación, incluyendo recuperación de contraseña por correo.

Este backend está pensado para trabajar junto con el frontend oficial:

➡️ **Frontend:** [`FrancoRivadeneyraVigo/proyecto-final-frontend`](https://github.com/FrancoRivadeneyraVigo/proyecto-final-frontend)

---

## 🧱 Responsabilidades del backend

- Registro y login de usuarios
- Gestión de sesión basada en token JWT
- Consulta de usuario autenticado
- Cambio de contraseña autenticado
- Flujo de recuperación de contraseña por email
- Persistencia en base de datos MySQL

---

## 🛠️ Requisitos previos

- **Node.js** (LTS recomendado)
- **npm**
- **MySQL**
- Cuenta de correo para envío de emails (o proveedor SMTP)

---

## 🚀 Instalación y ejecución

### 1) Clonar el repositorio

```bash
git clone https://github.com/xenixui/proyecto-final-backend.git
cd proyecto-final-backend
```

### 2) Instalar dependencias

```bash
npm install
```

### 3) Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
DB_NAME=nombre_de_tu_base_de_datos
DB_USER=usuario_mysql
DB_PASSWORD=contraseña_mysql
DB_HOST=localhost
DB_PORT=3306
PORT=3000

# JWT para autenticación y recuperación
JWT_SECRET=tu_clave_jwt
JWT_RESET_SECRET=tu_clave_jwt_reset

# Configuración de correo para recuperación de contraseña
EMAIL_USER=correo_de_envio@dominio.com
EMAIL_PASS=contraseña_de_aplicacion
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **Importante:** No subas tu `.env` real al repositorio. Cada desarrollador debe configurar sus credenciales localmente.

### 4) Crear la base de datos

Prepara la base de datos MySQL y ejecuta el script SQL del proyecto para crear tablas y datos necesarios.

### 5) Iniciar servidor

```bash
node src/server.js
```

La API quedará disponible en el puerto configurado (`PORT`, por defecto `3000`).

---

## 🔐 Endpoints de autenticación

### Registro de usuario
`POST /api/auth/register`

Body:

```json
{
  "email": "usuario@dominio.com",
  "password": "contraseña",
  "username": "nombre_usuario"
}
```

### Login
`POST /api/auth/login`

Body:

```json
{
  "email": "usuario@dominio.com",
  "password": "contraseña"
}
```

### Obtener usuario autenticado
`GET /api/auth/me`

Header:

`Authorization: Bearer <token>`

### Cambiar contraseña (autenticado)
`PUT /api/auth/password`

Header:

`Authorization: Bearer <token>`

Body:

```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

### Solicitar recuperación de contraseña
`POST /api/auth/forgot-password`

Body:

```json
{
  "email": "usuario@dominio.com"
}
```

### Restablecer contraseña con token
`POST /api/auth/reset-password`

Body:

```json
{
  "token": "token_recibido_por_email",
  "newPassword": "nueva_contraseña"
}
```

### Logout
`POST /api/auth/logout`

Header:

`Authorization: Bearer <token>`

---

## ✉️ Flujo de recuperación de contraseña

1. El usuario solicita recuperación con su email.
2. El backend genera un token temporal y envía un enlace por correo.
3. El usuario abre el enlace y define nueva contraseña.
4. El backend valida token y actualiza contraseña de forma segura.

---

## ✅ Buenas prácticas

- Mantener secretos fuera del repositorio (`.env`).
- Usar contraseñas de aplicación para SMTP.
- Rotar claves JWT en entornos productivos.
- Validar y sanear toda entrada del cliente.
- Registrar errores y monitorear endpoints críticos.

---

## 📚 Contexto académico

Componente backend desarrollado para el **Proyecto Final de Máster**, aplicando conocimientos de:

- Diseño de APIs REST
- Seguridad en autenticación/autorización
- Integración con base de datos relacional
- Gestión de configuración por entornos
- Integración con frontend SPA

---

## 👤 Autoría

Proyecto académico mantenido por el grupo de trabajo del proyecto final.

---

## 📄 Licencia

Pendiente de definición. Se recomienda incluir una licencia explícita (por ejemplo, MIT).
