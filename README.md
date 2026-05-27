# Proyecto Final Backend

## Pasos para ejecutar el proyecto

1. **Descargar el proyecto**
   - Clona o descarga este repositorio en tu máquina local.

2. **Instalar dependencias**
   - Ejecuta en la terminal:
     ```
     npm install
     ```


3. **Crear el archivo `.env`**
    - En la raíz del proyecto, crea un archivo llamado `.env` con el siguiente contenido (ajusta los valores según tu entorno):
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

    - **IMPORTANTE:**
       - Cada desarrollador debe crear su propio archivo `.env` y configurar su cuenta de correo para poder enviar emails de recuperación de contraseña.
       - No subas nunca el archivo `.env` real al repositorio.
       - Puedes usar una contraseña de aplicación de Gmail o un proveedor profesional (SendGrid, Mailgun, etc.).
       - El correo configurado en `EMAIL_USER` será el remitente de los emails de recuperación.

---

## Flujo de recuperación de contraseña

1. El usuario solicita recuperar su contraseña introduciendo su email.
2. El backend envía un email con un enlace de recuperación (si el email existe).
3. El usuario recibe el enlace, accede y puede establecer una nueva contraseña.
4. El backend valida el token y actualiza la contraseña de forma segura.

---

4. **Crear la base de datos**
   - Utiliza el archivo `script_db.sql` que se encuentra en OneDrive para crear la base de datos y las tablas necesarias en tu servidor MySQL.

5. **Arrancar el backend**
   - Ejecuta el siguiente comando:
     ```
     node src/server.js
     ```
   - El backend estará disponible en el puerto definido en el archivo `.env` (por defecto 3000).

---

Si tienes dudas, revisa el código fuente o contacta al responsable del proyecto.
