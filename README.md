# 🐾 Pawcadi — "Comida que muerde"

Tienda online de una colección de **6 juguetes de látex con sonido para perros**.
Mercado: **España**. Sitio estático (HTML + CSS + JavaScript, sin dependencias),
publicado gratis en GitHub Pages.

| | |
|---|---|
| **Web en vivo** | https://pawcadi.github.io |
| **Tienda Shopify** | `pawcadi.myshopify.com` (procesa el pago) |
| **Estado** | 🟡 **Pre-lanzamiento** — todavía no se puede comprar |

---

## 🗂️ Estructura

```
index.html          La página entera
css/styles.css      Estilos
js/main.js          Catálogo, cesta y checkout  ← aquí se configura todo
assets/images/toys/ Fotos de los 6 juguetes
robots.txt          
sitemap.xml
```

---

## 🧸 La colección

| Nombre | Producto | SKU fábrica | Tamaño | Precio |
|---|---|---|---|---|
| Croqui | Croissant | ETL1404 | 11 cm | 10,95 € |
| Quesín | Queso | ETL1405 | 6,8 cm | 10,95 € |
| Chispas | Galleta | ETL1406 | 6,8 cm | 10,95 € |
| Rollito | Brazo de reina | ETL1407 | 7,2 cm | 10,95 € |
| Zanahorio | Zanahoria | ETL1388 | 21,5 cm | 13,95 € |
| Calabazo | Calabaza | ETL1385 | 22 cm | 13,95 € |

**Packs:** Merienda (4 peq.) 38,95 € · Huerta (2 gr.) 24,95 € · Colección completa 62,95 €
**Envío:** 3,95 € · gratis desde 25 € *(debe coincidir con la política de envíos de Shopify)*

---

## ✏️ Cómo editar

Casi todo se cambia en **`js/main.js`**, en las listas `TOYS` y `PACKS` de arriba
(nombre, precio, tamaño, descripción, foto). Los textos largos —titulares, FAQ,
pie— están en `index.html`.

Los colores de marca están en las variables del principio de `css/styles.css`.

> ⚠️ Si cambias un precio o el umbral de envío gratis, cámbialo **también** en
> Shopify y en las políticas: si no coinciden, el cliente ve una cosa y paga otra.
> También hay precios en el bloque de datos estructurados (JSON-LD) de `index.html`.

---

## 💳 Activar la venta real

El checkout usa **cart permalinks de Shopify** (no hace falta ningún token de API).
Hoy el botón muestra un aviso de pre-lanzamiento porque faltan los IDs de variante.

Para activarlo:

1. **Crea en Shopify los 9 productos**: los 6 juguetes **y los 3 packs**.
   > Los packs tienen que ser productos propios con su precio con descuento. Si se
   > mandaran como juguetes sueltos, Shopify cobraría la suma sin descuento.
2. En cada producto, abre la variante y copia el número del final de la URL
   (`.../variants/**44012345678901**`).
3. Pega cada número en `js/main.js`, en el campo `variantId` correspondiente
   (los 6 de `TOYS` y los 3 de `PACKS`).
4. En `index.html`, cambia `"OutOfStock"` por `"InStock"` en el bloque JSON-LD.
5. Guarda, sube los cambios y listo: el botón lleva al checkout real de Shopify.

---

## 📋 Pendiente antes de vender

- [ ] **Datos del vendedor** en el pie (nombre/razón social, NIF, domicilio y
      correo). Lo exige la LSSI-CE. Hay un `TODO` marcado en `index.html`.
- [ ] Rellenar `[INSERTAR DIRECCIÓN DE DEVOLUCIÓN]` en la política de devoluciones
      de Shopify.
- [ ] Sustituir las fotos: las actuales son **miniaturas de baja resolución**
      sacadas del Excel del proveedor.
- [ ] Enlaces reales de Instagram/TikTok en el pie (hay un `TODO`).
- [ ] Si añades píxel de Meta/TikTok o Google Analytics → hará falta **banner de
      cookies** con consentimiento previo.

---

## 🚀 Publicar cambios

```bash
git add -A
git commit -m "Lo que has cambiado"
git push pages main     # repo principal → pawcadi.github.io
git push origin main    # repo espejo
```

La web se actualiza sola en menos de un minuto.

Para verla en local:

```bash
python3 -m http.server 8000    # → http://localhost:8000
```
