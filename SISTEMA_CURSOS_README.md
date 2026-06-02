# 📚 Sistema de Cursos - Trading Academy A Otro Nivel

## ✅ Estructura Implementada

### 1. **Base de Datos (schema.prisma)**
Se agregaron las siguientes tablas:

- **Course**: Información del curso (título, descripción, precio, slug)
- **CourseModule**: Módulos dentro de cada curso
- **CourseLesson**: Lecciones individuales dentro de cada módulo
- **CourseResource**: Recursos multimedia (imágenes, videos, PDFs, links)
- **UserCourseAccess**: Control de acceso de usuarios a cursos
- **UserProgress**: Seguimiento del progreso del estudiante

### 2. **Estructura de Carpetas**
```
public/
  images/
    cursos/
      plataforma-especifica/    ← Curso de ejemplo
        modulo-1/               ← Sube imágenes aquí
        modulo-2/               ← Sube imágenes aquí
        indicadores/            ← Sube imágenes aquí
      [nuevo-curso]/            ← Crea nuevos cursos aquí
        modulo-1/
        modulo-2/
```

### 3. **Página del Curso**
**Ubicación:** `app/dashboard/curso/[courseId]/page.tsx`

**Características:**
- ✅ Verificación de acceso (solo usuarios que han pagado)
- ✅ Listado de módulos y lecciones
- ✅ Visualización de recursos (imágenes, videos, PDFs)
- ✅ Sistema de progreso (marcar lecciones como completadas)
- ✅ Integración con chatbot para ayuda

### 4. **APIs Creadas**

#### `/api/courses` (GET, POST)
- GET: Lista todos los cursos publicados
- POST: Crear nuevo curso (solo admin)

#### `/api/courses/[courseId]/access` (GET)
- Verifica si el usuario tiene acceso al curso
- Devuelve el contenido completo del curso con progreso

#### `/api/courses/progress` (GET, POST)
- POST: Marcar lección como completada
- GET: Obtener progreso del usuario en un curso

### 5. **Chatbot Actualizado**
El chatbot ahora actúa como maestro:
- ✅ Información actualizada de cursos y precios
- ✅ Información sobre bots (Forex, Cripto, Índices)
- ✅ Puede guiar al estudiante en lecciones
- ✅ Responde preguntas sobre contenido del curso

---

## 🎯 Cómo Usar el Sistema

### **Para Agregar un Nuevo Curso:**

#### 1. Crear el curso en la base de datos:
```sql
INSERT INTO "Course" (id, slug, title, description, price, "isPublished")
VALUES (gen_random_uuid(), 'plataforma-especifica', 'Curso de Plataforma Específica', 'Aprende a usar la plataforma con indicadores específicos', 199.99, true);
```

#### 2. Crear módulos:
```sql
INSERT INTO "CourseModule" (id, "courseId", title, description, "order")
VALUES (gen_random_uuid(), '[course-id]', 'Módulo 1: Introducción', 'Introducción a la plataforma', 1);
```

#### 3. Crear lecciones:
```sql
INSERT INTO "CourseLesson" (id, "moduleId", title, description, content, "order")
VALUES (gen_random_uuid(), '[module-id]', 'Lección 1: Configuración Inicial', 'Aprende a configurar la plataforma', 'Contenido de la lección...', 1);
```

#### 4. Agregar recursos (imágenes/videos):
```sql
INSERT INTO "CourseResource" (id, "lessonId", type, title, url, "order")
VALUES 
  (gen_random_uuid(), '[lesson-id]', 'image', 'Pantalla de configuración', '/images/cursos/plataforma-especifica/modulo-1/configuracion.png', 1),
  (gen_random_uuid(), '[lesson-id]', 'video', 'Tutorial en video', 'https://youtube.com/embed/xxxxx', 2);
```

#### 5. Dar acceso a un usuario:
```sql
INSERT INTO "UserCourseAccess" ("userId", "courseId", "grantedAt", "paymentInfo")
VALUES ('[user-id]', '[course-id]', NOW(), 'Pago mediante PayPal - TX123456');
```

---

## 📁 Agregar Contenido (Imágenes/Videos)

### **Imágenes:**
1. Sube las imágenes a: `public/images/cursos/[slug-del-curso]/[modulo]/`
2. En la base de datos, usa la ruta: `/images/cursos/[slug-del-curso]/[modulo]/nombre-archivo.jpg`

**Ejemplo:**
```
Archivo físico: public/images/cursos/plataforma-especifica/modulo-1/indicador-rsi.png
URL en DB: /images/cursos/plataforma-especifica/modulo-1/indicador-rsi.png
```

### **Videos:**
Usa servicios externos:
- **YouTube:** `https://youtube.com/embed/VIDEO_ID`
- **Vimeo:** `https://player.vimeo.com/video/VIDEO_ID`
- O sube a Cloudflare Stream

---

## 🚀 Próximos Pasos

### **Para correr las migraciones:**
```bash
npx prisma migrate dev --name add_course_system
npx prisma generate
```

### **Para acceder a un curso:**
URL: `http://localhost:3000/dashboard/curso/[courseId]`

### **Para crear cursos (admin):**
Puedes usar un script o crear una interfaz admin en:
`app/dashboard/admin/cursos/page.tsx`

---

## 💡 Consejos

1. **Organiza bien las carpetas**: Usa nombres descriptivos para módulos e imágenes
2. **Videos**: Usa YouTube no listado para proteger contenido
3. **Progreso**: Anima a los estudiantes a marcar lecciones completadas
4. **Chatbot**: Los estudiantes pueden preguntar al bot sobre cualquier lección

---

## 🔒 Sistema de Protección

La página del curso verifica:
1. ¿El usuario está autenticado?
2. ¿Tiene un registro en `UserCourseAccess`?
3. ¿El acceso no ha expirado?

Si NO cumple → Redirige o muestra mensaje de acceso denegado
Si SÍ cumple → Muestra todo el contenido del curso

---

**¡El sistema está listo para que empieces a cargar contenido!** 🎓
