# Lúmina — tienda estática

Interfaz de e-commerce hecha con HTML, CSS y JavaScript nativos. No necesita Next.js ni dependencias de npm para funcionar.

## Ejecutar localmente

Con Python 3 instalado, desde la raíz del proyecto:

```bash
python3 -m http.server 5500
```

Abre <http://localhost:5500> en el navegador. También se puede iniciar con `npm start`.

## Estructura

- `index.html`: contenido y estructura de la tienda.
- `css/styles.css`: estilos y diseño adaptable a móviles.
- `js/app.js`: búsqueda, menú, favoritos y carrito con persistencia local.
- `prisma/schema.prisma`: esquema reservado para la futura integración con una API y PostgreSQL.

Las imágenes se cargan desde Unsplash. El carrito y los favoritos se guardan en el almacenamiento local del navegador; pagos y suscripciones todavía no están conectados a un backend.