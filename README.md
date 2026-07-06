# ATiempo · Backend

**Proyecto Fin de Máster (UNIR) — Full Stack Developer**
Plataforma de compraventa de artículos de segunda mano (relojes), con roles de **usuario**, **moderador** y **administrador**, inspirada en Vinted/Wallapop.

Este repositorio contiene la **API REST** del proyecto, construida con **Node.js + Express** y **MySQL**, sin ORM (uso directo de SQL mediante `mysql2`). Trabaja junto al [frontend en Angular](https://github.com/xenixui/proyecto-final-frontend) 

---

## ¿Qué resuelve este backend?

Expone la lógica de negocio y el acceso a datos necesarios para que el frontend implemente los tres perfiles de la aplicación:

- **Autenticación y sesión**: registro, login e identificación por rol mediante JWT.
- **Artículos**: alta, edición, baja y consulta, con ciclo de vida completo (`Borrador`, `Publicado`, `En revisión`, `Retirado`, `Vendido`) y subida de imágenes a Cloudinary.
- **Búsqueda y catálogo**: filtrado de artículos por categoría, marca, modelo, estilo, precio y estado; endpoints de catálogo (marcas, modelos, estilos).
- **Mensajería interna**: chat entre comprador y vendedor asociado a un artículo, sin exponer datos de contacto, con notificaciones vía Server-Sent Events (SSE).
- **Reportes y moderación**: reporte de artículos y usuarios, cambio de estado a "En revisión", y acciones del moderador (activar/retirar) con notificación al usuario afectado e historial de moderación.
- **Perfiles y valoraciones**: perfil público de usuario (artículos publicados, valoraciones recibidas).
- **Administración**: gestión de usuarios y roles, gestión de categorías/catálogo y estadísticas globales de la plataforma.

---

## Stack técnico

- **Node.js** + **Express 5**
- **MySQL** (compatible con TiDB Cloud) vía `mysql2`, sin ORM
- **JWT** (`jsonwebtoken`) para autenticación
- **bcrypt** para hash de contraseñas
- **yup** para validación de esquemas
- **multer** + **Cloudinary** para subida e imágenes de artículos
- **Biome** para lint y formato
