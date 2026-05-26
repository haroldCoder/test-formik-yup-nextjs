# Módulo de Subida de Archivos (Test Formik Yup Next.js)

Este proyecto es una aplicación web construida con **Next.js (App Router)** que implementa un módulo robusto para la subida de archivos. Se centra en proveer una arquitectura escalable, validaciones avanzadas, manejo de estado fluido y pruebas automatizadas en múltiples capas.

## 🚀 Cómo correr el proyecto

### Prerrequisitos
- Node.js (versión 18.x o superior recomendada)
- npm o yarn

### Instalación

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```

2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador. En la pantalla principal encontrarás un enlace directo (`Ir a la aplicación`) hacia la ruta de carga de archivos (`/upload`).

### Ejecutar Pruebas
El proyecto cuenta con un entorno de pruebas configurado con Jest y React Testing Library, abarcando todas las capas de la arquitectura.
- Para correr las pruebas una vez:
  ```bash
  npm run test
  ```
- Para correr las pruebas en modo interactivo (_watch_):
  ```bash
  npm run test:watch
  ```

---

## 🏗️ Decisiones Técnicas y Arquitectura

El desarrollo de este módulo se fundamenta en principios de diseño de software mantenible, utilizando **Clean Architecture** para separar claramente las responsabilidades y desacoplar la lógica de negocio de la UI.

### 1. Arquitectura por Capas
El código se encuentra fuertemente tipado e inteligentemente dividido dentro de `app/modules/upload/`:
* **Dominio (Domain)**: Entidades y reglas de negocio puras (`FileDescriptorEntity`, `SubmitDataEntity`). Aquí centralizamos reglas como el límite máximo de tamaño y transiciones de estado de un archivo (`uploading`, `done`, `error`, `canceled`).
* **Aplicación (Application)**: Casos de uso (`UploadFilesUseCase`, `SubmitDataUseCase`) que actúan como orquestadores. Reciben los repositorios inyectados, manteniéndose agnósticos sobre cómo se hace la petición HTTP realmente.
* **Infraestructura (Infrastructure)**: Implementaciones técnicas (ej. `UploadApiRepository`). Encargada de comunicarse de manera directa con las APIs (`fetch` a `/api/upload` simulada).
* **Presentación (Presentation)**: Componentes React, hooks personalizados, validaciones visuales y esquemas.

### 2. Manejo de Formularios y Estado de UI
* **Formik y Yup**: Adoptados para la recolección estructurada de metadatos (título, descripción) y para aplicar esquemas de validación sólidos antes de permitir la subida (Submit) final del formulario.
* **Hooks Personalizados (`useUploadManager`, `useSubmitManager`)**: Separan la compleja lógica de subida de React. Nos permiten manejar cancelación nativa de peticiones (usando `AbortController`), control de progreso y retardo en los reintentos (`Retry`). También limitamos la concurrencia a máximo 3 cargas simultáneas para no saturar la red.

### 3. Experiencia de Usuario (UX) e Interfaz Visual
* **Tailwind CSS**: Usado para el prototipado de una interfaz moderna y estética tipo _Glassmorphism_ (vidrio esmerilado con desenfoque de fondo y bordes sutiles).
* **Drag & Drop (Arrastrar y Soltar)**: La zona de selección de archivos provee eventos DOM completos que permiten soltar archivos directamente desde el SO, mejorando radicalmente la UX.
* **Validación Visual de Duplicados**: Si se agrega un archivo idéntico (mismo nombre y tamaño) a la cola, el sistema lo detecta al vuelo y la interfaz aplica automáticamente un degradado oscuro en su tarjeta respectiva, notificando también mediante un _toast_.
* **Manejo Dinámico de Errores**: Contamos con simulaciones de errores de red (20% de fallo aleatorio). Cuando ocurren, informamos al usuario a través de componentes _Toast_ de la librería `react-hot-toast`, permitiéndole dar clic al botón de reinicio para reintentar la subida del archivo individual.

### 4. Calidad de Código y Testing
* Se integró **Jest** para comprobar cada una de las capas. Se priorizó que las capas de Dominio, Aplicación, Infraestructura (mockeando Fetch) y Presentación fuesen testeables de manera completamente aislada, asegurando así un comportamiento sólido y libre de regresiones.

# 🧪 Checklist Faltante — Módulo Upload (Next.js + Formik + Clean Architecture)

## Reglas de negocio obligatorias
  - se necesita que todo el modulo use todas las reglas de negocio impuestas
  - crear regla de negocio que valide los tipos de archivos permitidos

## Infrastructure
  - Seria bueno la implementacion de mappers, para convertir los datos de la API a entidades y viceversa, de esta manera una arquitectura mas limpia y escalable.

## Presentacion
  - Desglosar mas la vista de upload-screen, en componentes para una mejor organizacion
  - Mirar la posibiliadad de desglosar el hook de uploads
  - Cubrir mensajes de error y success en la UI
  - Mirar la posibilidad de guardar los archivos enviados a un storage local
  - Cancelacion global de todo el proceso de subida
  - implementar tanstack query, para las peticiones
  - retry de todas las uploads fallidos
  - Cubrir con un mejor accesibilidad toda la aplicacion, desde los inputs, botones, hasta el drag and drop

## API 
  - Mejorar los dos endpoints de la API, para que sean mas eficientes, y retornen los datos que el usuario envie.



