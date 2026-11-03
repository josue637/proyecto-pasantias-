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
- `js/app.js`: búsqueda y filtros, menú, favoritos, carrito y reseñas guardadas en el navegador.
- `prisma/schema.prisma`: esquema reservado para la futura integración con una API y PostgreSQL.

## Catálogo y medios

- Busca por nombre, categoría, color, tamaño y descripción; filtra por categoría, color, tamaño y rango de precio.
- Las imágenes usan `srcset`, carga diferida y negociación de formato/calidad de Unsplash. El video tiene una portada y solo solicita el MP4 cuando la persona pulsa reproducir.
- Las reseñas, favoritos y carrito se guardan localmente en el navegador. No se comparten entre dispositivos ni sustituyen un backend de pedidos y reseñas.
- El enlace flotante de WhatsApp abre una conversación para elegir destinatario. Para abrir directamente el chat de la tienda, configura su número internacional en el enlace `wa.me` de `index.html`.

El diseño y la carga diferida reducen solicitudes al entrar, pero el tiempo de carga real depende de la conexión, el alojamiento y la respuesta de los servicios externos. Mídelo en el dominio publicado con Lighthouse en móvil; este proyecto estático por sí solo no puede garantizar menos de tres segundos en todas las redes.