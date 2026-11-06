# Pago Móvil para Venezuela

Esta integración prepara un flujo de reporte manual de Pago Móvil. No es una
integración C2P bancaria: el cliente reporta la operación y una persona verifica
el abono antes de cambiar el estado del pedido a `PAID`.

## Requisitos para activar el checkout

1. Crear una base de datos PostgreSQL y configurar `DATABASE_URL`.
2. Copiar `.env.example` a `.env.local` y configurar los precios de venta
   reales en USD en `PRODUCT_USD_PRICES_JSON`, con una entrada para cada ID de
   producto:

   ```text
   PRODUCT_USD_PRICES_JSON={"audifonos-pulse":"PRECIO","smartwatch-active":"PRECIO","powerbank-compact":"PRECIO","camara-smart-home":"PRECIO"}
   ```

   Sustituye `PRECIO` por importes reales con hasta dos decimales. No se deben
   reutilizar los precios de muestra en CLP.
3. Configurar los datos públicos receptores de Pago Móvil:
   `PAYMENT_MOBILE_BANK`, `PAYMENT_MOBILE_PHONE`, `PAYMENT_MOBILE_ID` y
   `PAYMENT_MOBILE_OWNER`.
4. Configurar `SHIPPING_USD` y `TAX_RATE` según la política real de entrega y
   los impuestos aplicables; establecer `CHECKOUT_FEES_CONFIRMED=true` solo
   después de revisar esos valores. Aunque el costo sea cero, debe confirmarse
   explícitamente.
5. Generar y guardar de forma privada una clave de cifrado de 32 bytes en
   `PAYMENT_DATA_ENCRYPTION_KEY`, por ejemplo con
   `openssl rand -base64 32`; una clave aleatoria independiente para firmar las
   cotizaciones (`BCV_QUOTE_SIGNING_KEY`); y un token aleatorio largo para
   `ADMIN_PAYMENT_REVIEW_TOKEN`.
6. Configurar SMTP con `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
   `SMTP_FROM` y el buzón de revisión `PAYMENT_REVIEW_EMAIL`.
7. Generar el cliente y aplicar las migraciones:

   ```sh
   npm run db:generate
   npm run db:migrate
   ```

La migración inicial crea el esquema completo de `prisma/schema.prisma`. Si la
base de datos ya tiene tablas, primero hay que establecer su línea base de
migraciones; no ejecutes esta migración inicial sin revisar ese caso.

El catálogo usa precios USD preparados por variable de entorno, no precios
cargados desde la tabla `Product`. Revisa y actualiza también el correo y la
ubicación de ejemplo del storefront antes de publicar.

## Flujo y verificación

- `GET /api/payment-config` expone precios y los datos receptores configurados.
- `GET /api/exchange-rate` consulta la página oficial del BCV. Si no está
  disponible o su HTML cambia, el endpoint devuelve error. La cotización
  devuelta lleva firma del servidor y vence en 15 minutos; el checkout no crea
  pedidos con una tasa inventada o alterada por el navegador.
- `POST /api/checkout` valida productos, cantidades, correo, cédula/RIF,
  teléfono venezolano y referencia. El servidor calcula los importes desde su
  configuración; nunca confía en un total enviado por el navegador.
- El pedido se guarda en USD con la tasa consultada y el equivalente VES, en
  estado `PENDING_VERIFICATION`. Los datos personales y la referencia se cifran
  antes de persistirse. La huella de la referencia evita reportarla dos veces.
- Una persona revisora puede consultar el reporte por `orderNumber` en
  `/api/admin/orders/<orderNumber>` y marcarlo pagado con `POST` a la misma ruta.
  Ambas solicitudes requieren `Authorization: Bearer <ADMIN_PAYMENT_REVIEW_TOKEN>`.
- Al verificarlo, el servidor intenta cambiar el estado a `PAID` y envía el
  correo de confirmación por SMTP. No se cambia el estado automáticamente al
  registrar una referencia.

El acceso a la ruta de administración es una API de preparación; úsala solo
desde un entorno confiable y nunca expongas el token en el navegador. Configura
HTTPS en el hosting antes de recibir datos personales.

El impuesto se calcula sobre subtotal más envío usando `TAX_RATE`, y
`SHIPPING_USD` es un monto fijo por pedido. El comercio debe confirmar estos
valores según sus reglas de despacho y obligaciones fiscales. El checkout no
reserva inventario y se debe verificar la disponibilidad antes de aprobar el
pago.

## Alcance no incluido

El flujo no se conecta a un banco o procesador C2P, ni valida automáticamente
abonos. Zelle, Binance Pay y Zinli tampoco forman parte de esta integración.
Para esos métodos se necesitan proveedores/cuentas y flujos independientes.
La tasa BCV se extrae de su página pública porque no hay una API oficial
configurada en este proyecto; hay que vigilar cambios del sitio y confirmar la
tasa mostrada antes de operar.
