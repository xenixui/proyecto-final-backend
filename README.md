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
     ```

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
