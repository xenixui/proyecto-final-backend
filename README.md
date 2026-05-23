# Proyecto final: Plataforma de compraventa de segunda mano

| Asignatura           | Datos del alumno | Fecha |
| -------------------- | ---------------- | ----- |
| Full Stack Developer | Apellidos:       |       |
|                      | Nombre:          |       |

---

## Objetivos

El proyecto consiste en el desarrollo de una aplicación web que permita a los usuarios publicar, buscar y adquirir artículos de segunda mano, siguiendo un modelo similar al de plataformas como Vinted o Wallapop.

La aplicación deberá gestionar el ciclo de vida completo de un artículo, desde su publicación hasta su venta, incluyendo un sistema de moderación que garantice la calidad y seguridad de los contenidos. La plataforma contará además con un sistema de mensajería interna entre usuarios para facilitar el contacto entre comprador y vendedor sin necesidad de exponer datos personales.

Los tres perfiles que intervienen en la aplicación son el usuario, que actúa como comprador y/o vendedor; el moderador, encargado de supervisar los contenidos y gestionar las incidencias; y el administrador, responsable de la gestión global de la plataforma, sus categorías y sus usuarios.

> **Nota**: El alumno deberá definir el nombre, logotipo y estilo visual de la plataforma como parte del proyecto, dotando a la aplicación de una identidad de marca propia.

---

## Perfiles

### Usuario

Es el perfil principal de la plataforma. Puede actuar como vendedor, como comprador o como ambos a la vez. Sus funcionalidades son las siguientes:

- Registro e inicio de sesión con sus datos personales.
- Gestión de su perfil público: foto, nombre de usuario, valoraciones recibidas y artículos publicados.
- Publicación de artículos indicando título, descripción, precio, categoría, estado de conservación y fotografías.
- Edición y eliminación de sus propios artículos.
- Marcado de un artículo como vendido una vez cerrada la transacción.
- Búsqueda y filtrado de artículos por categoría, precio, estado y localización.
- Acceso al sistema de mensajería interna para contactar con el vendedor de un artículo.
- Posibilidad de reportar artículos o usuarios por contenido inapropiado.

### Moderador

Es el responsable de mantener la calidad y seguridad de los contenidos publicados en la plataforma. Sus funcionalidades son:

- Acceso al listado de artículos reportados por los usuarios, con detalle del motivo del reporte.
- Revisión del detalle de cada artículo reportado para decidir si se mantiene activo o se retira.
- Envío de una notificación al usuario afectado explicando la decisión tomada.
- Gestión de incidencias entre usuarios derivadas de la mensajería interna.
- Acceso al historial de acciones de moderación realizadas.

### Administrador

Es el perfil con mayor nivel de acceso dentro de la plataforma. Sus funcionalidades son:

- Gestión completa de usuarios: consulta, edición, bloqueo y eliminación de cuentas.
- Asignación y modificación de roles a los usuarios registrados.
- Gestión del catálogo de categorías: creación, edición y eliminación.
- Acceso a un panel con estadísticas globales de la plataforma: artículos publicados, usuarios activos, reportes gestionados y artículos vendidos.
- Realización de cualquier acción disponible para el perfil de moderador.

---

## Requisitos Mínimos

Estos son los requisitos mínimos que debe cumplir el proyecto:

- Formulario de registro e inicio de sesión con validación, que muestre la vista correspondiente según el perfil del usuario autenticado.
- Página principal con los siguientes datos, dependiendo del perfil del usuario:
  - **Usuario**: listado de sus artículos publicados y acceso directo a la creación de nuevos artículos. Acceso al buscador general de la plataforma con filtros por categoría, precio y estado de conservación.
  - **Moderador**: panel de reportes pendientes de revisión con acceso al detalle de cada uno. Historial de acciones de moderación ya realizadas.
  - **Administrador**: panel de gestión de usuarios y roles, gestión de categorías y acceso a las estadísticas globales de la plataforma.
- Los artículos solo pueden ser creados y editados por el usuario propietario.
- Cuando un usuario reporta un artículo, este pasa al estado "En revisión" y queda visible para el moderador.
- El moderador puede marcar el artículo como "Activo" de nuevo o retirarlo de la plataforma, notificando en ambos casos al usuario afectado.
- El sistema de mensajería interna debe permitir el intercambio de mensajes entre el comprador y el vendedor de un artículo concreto, sin exponer datos de contacto personales.
- El ciclo de vida de un artículo debe reflejarse correctamente en la interfaz: **Borrador**, **Publicado**, **En revisión**, **Retirado** y **Vendido**.

---

## Deseables

- Sistema de valoraciones entre usuarios al finalizar una transacción.
- Funcionalidad de lista de favoritos para guardar artículos de interés.
- Sistema de notificaciones en tiempo real para nuevos mensajes y cambios de estado de los artículos.
- Inclusión de un mapa interactivo en el detalle del artículo para indicar la localización aproximada del vendedor.

---

## Pautas de Elaboración

Para realizar este proyecto deberás usar las herramientas descritas durante el máster.

- Como framework de FrontEnd usaréis **Angular**.
- La base de datos será **MySQL**, dado el carácter relacional de los datos manejados en la plataforma: usuarios, artículos, categorías, mensajes y reportes.
- Y como backend la aplicación la realizaremos en **Node con Express**.

Estas herramientas no son una elección, es obligatorio usarlas como parte del proceso de aprendizaje del máster. El uso de Javascript, HTML y CSS también es obligatorio por la necesidad intrínseca de usarlo tanto en los frameworks como en las librerías.

---

*© Universidad Internacional de La Rioja (UNIR)*