# Estructura de Carpetas de Cursos

Esta carpeta contiene todos los recursos multimedia para los cursos de la academia.

## Estructura:

```
cursos/
  plataforma-especifica/
    modulo-1/           ← Imágenes del módulo 1
    modulo-2/           ← Imágenes del módulo 2
    indicadores/        ← Imágenes de indicadores
  otro-curso/           ← Agregar nuevos cursos siguiendo este patrón
    modulo-1/
    modulo-2/
```

## Cómo agregar contenido:

1. **Imágenes**: Sube directamente a la carpeta del módulo correspondiente
   - Formato recomendado: JPG, PNG
   - Nombres descriptivos: `indicador-rsi.png`, `configuracion-paso-1.jpg`

2. **Videos**: Usa servicios externos y guarda las URLs en la base de datos
   - YouTube (privado/no listado)
   - Vimeo
   - Cloudflare Stream

3. **Nuevos cursos**: Crea una carpeta con el slug del curso y sus módulos

## Ejemplo de nombres de archivos:
- `leccion-1-introduccion.jpg`
- `indicador-macd-configuracion.png`
- `estrategia-paso-1.jpg`
- `plataforma-vista-general.png`
