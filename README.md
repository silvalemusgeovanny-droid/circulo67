# MaterialQ Beta

MaterialQ es una beta web para inteligencia de compras de materia prima. La app ayuda a capturar una solicitud de compra, buscar proveedores, comparar opciones, preparar un reporte, enviar el resultado por correo y proteger el historial del cliente con PIN.

El proyecto esta pensado para empresas o clientes que necesitan evaluar proveedores con trazabilidad, fuentes y control humano antes de contactar o comprar.

## Estado actual

- App web visible en Vercel.
- Backend Node.js con rutas API.
- Integracion con Exa para busqueda de fuentes web.
- Integracion con Composio + Gmail para enviar correos.
- Flujo de historial protegido por PIN enviado al correo del cliente.
- Bot de Telegram con motor de respuestas y analisis basico.
- Soporte local y despliegue en Vercel.
- Notion preparado, pero opcional y pendiente de configurar con credenciales.

## Funciones implementadas

- Captura de datos de compra: producto, cantidad, fecha de entrega, ubicacion, distancia, correo destino y requisitos adicionales.
- Analisis de proveedores con calidad, precio, stock y riesgo.
- Busqueda de fuentes reales con Exa cuando la API esta configurada.
- Candidatos preliminares cuando Exa no responde.
- Recomendacion principal y opciones descartadas.
- Seleccion de proveedor para contacto.
- Deteccion de sitio web, correo, telefono, WhatsApp o redes cuando aparecen en las fuentes.
- Botones para contactar o abrir fuentes del proveedor.
- Descarga o impresion de PDF desde el navegador.
- Envio del reporte al correo ingresado por el cliente.
- Historial por correo protegido con PIN.
- Motor de respuestas para bot de Telegram.

## Arquitectura

```text
index.html
app.js
styles.css
server.js
api/index.js
src/
  agent/
    materialq-agent.js
    telegram-agent.js
  integrations/
    exa.js
    composio.js
    notion.js
scripts/
  telegram-composio-poller.md
vercel.json
package.json
```

## Rutas principales

```text
GET  /api/health
POST /api/analyze
POST /api/actions/prepare
POST /api/actions/send-email
POST /api/history/request-pin
POST /api/history/verify-pin
POST /api/history
POST /api/telegram/answer
```

## Integraciones

### Exa

Exa se usa para buscar fuentes reales de proveedores, evidencia publica, stock, certificaciones, precios o informacion comercial.

Variable necesaria:

```env
EXA_API_KEY=your_exa_key_here
```

Si Exa no esta configurado o falla, la app muestra candidatos preliminares y advierte que falta fuente real.

### Composio + Gmail

Composio se usa para ejecutar herramientas de Gmail desde el backend.

Se usa para enviar reportes al correo del cliente y enviar PIN de acceso al historial.

Variables necesarias:

```env
COMPOSIO_API_KEY=your_composio_project_api_key
COMPOSIO_USER_ID=default
```

La cuenta de Gmail debe estar conectada en Composio para el mismo `COMPOSIO_USER_ID`.

### Notion

Notion esta preparado para guardar historial persistente de analisis, decisiones y proveedores evaluados.

Variables opcionales:

```env
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id
```

Si Notion no esta configurado, la app sigue funcionando, pero el historial persistente queda pendiente de una base de datos o Notion.

## Variables de entorno

Crea un archivo local `.env` basado en `.env.example`:

```env
EXA_API_KEY=
COMPOSIO_API_KEY=
COMPOSIO_USER_ID=default
NOTION_TOKEN=
NOTION_DATABASE_ID=
```

No subas `.env` a GitHub. Las claves reales deben vivir solo en `.env` local y en Vercel Environment Variables.

## Ejecucion local

Instalar dependencias:

```bash
npm install
```

Ejecutar servidor:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Probar salud del backend:

```text
http://localhost:3000/api/health
```

## Despliegue en Vercel

El proyecto incluye `api/index.js` y `vercel.json` para que Vercel ejecute el backend como funcion serverless y sirva la app desde el mismo dominio.

Pasos:

1. Subir el repo a GitHub.
2. Importar el repo desde Vercel.
3. Configurar variables en el proyecto correcto:

```env
EXA_API_KEY
COMPOSIO_API_KEY
COMPOSIO_USER_ID
```

4. Marcar las variables para `Production` y `Preview`.
5. Hacer `Redeploy`.
6. Probar:

```text
https://your-domain.vercel.app/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "service": "MaterialQ",
  "integrations": {
    "exa": {
      "configured": true
    },
    "composio": {
      "configured": true
    }
  }
}
```

## GitHub

Repositorio usado:

```text
https://github.com/silvalemusgeovanny-droid/circulo67
```

Se hizo commit y push del proyecto con la estructura lista para Vercel.

## Seguridad

- `.env` esta ignorado por Git.
- Las API keys no deben subirse a GitHub.
- Las variables sensibles en Vercel deben agregarse como `Sensitive`.
- El historial no se muestra solo por ingresar un correo.
- El acceso al historial requiere PIN.
- El PIN expira despues de 10 minutos.
- La sesion de historial expira despues de 30 minutos.
- El envio de correos ocurre desde el backend, no desde el navegador.

Nota de produccion: actualmente los PIN y sesiones se guardan en memoria del servidor. En Vercel serverless esto puede reiniciarse. Para produccion conviene mover ese estado a Notion, Supabase, Vercel KV, Neon, Redis o una base de datos.

## Limitaciones actuales

- Si Exa falla, se muestran proveedores preliminares sin datos reales.
- Notion todavia no esta configurado en produccion.
- El historial persistente necesita una base de datos o Notion para ser robusto.
- El bot de Telegram tiene motor de respuesta, pero falta dejar conectado el webhook o proceso permanente.
- El envio de PDF como archivo adjunto no esta implementado; actualmente el reporte se envia como contenido de correo y el PDF se descarga o imprime desde el navegador.

## Proximos pasos recomendados

- Configurar Notion o una base de datos para historial persistente.
- Guardar PIN y sesiones fuera de memoria.
- Mejorar extraccion de contactos de proveedores.
- Adjuntar PDF real al correo.
- Conectar webhook real de Telegram.
- Agregar logs visibles para diagnosticar Exa y Composio en produccion.
- Crear pagina interna de administracion para consultas y clientes.

## Pruebas utiles

Analisis:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"product\":\"acero\",\"quantity\":\"500 kg\",\"deliveryDate\":\"2026-09-15\",\"location\":\"Guadalajara\",\"distance\":\"300 km\",\"email\":\"cliente@example.com\"}"
```

Solicitar PIN:

```bash
curl -X POST http://localhost:3000/api/history/request-pin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"cliente@example.com\"}"
```

Verificar PIN:

```bash
curl -X POST http://localhost:3000/api/history/verify-pin \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"cliente@example.com\",\"pin\":\"123456\"}"
```

Pregunta al bot:

```bash
curl -X POST http://localhost:3000/api/telegram/answer \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"que datos necesitas para analizar una compra\"}"
```
