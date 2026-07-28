/* =====================================================================
   Pawcadi — "Comida que muerde"
   Colección de juguetes de látex con sonido para perros (mercado: España)
   - Catálogo de 6 productos + packs
   - Cesta multi-producto con localStorage
   - Checkout con cart permalinks de Shopify (sin token de API)
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Deben coincidir con la política de envíos publicada en Shopify
  // (pawcadi.myshopify.com/policies/shipping-policy): 3,95 € y gratis desde 25 €.
  const SHIPPING = 3.95;
  const FREE_SHIP = 25;
  const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  const money = (n) => eur.format(n);

  /* =================================================================
     CATÁLOGO
     `sku` es la referencia de fábrica (EETOYS) — útil al crear los
     productos en Shopify.
     `variantId` se rellena con el ID numérico de variante de Shopify
     cuando el producto exista allí. Vacío = checkout en modo demo.
     ================================================================= */
  const TOYS = [
    { id: "croqui", name: "Croqui", real: "Croissant", sku: "ETL1404",
      emoji: "🥐", size: "11 cm", weight: "39 g", price: 10.95, tier: "merienda",
      img: "assets/images/toys/croissant.png", variantId: "",
      blurb: "Se levanta tarde y cruje. El clásico de la casa." },
    { id: "quesin", name: "Quesín", real: "Queso", sku: "ETL1405",
      emoji: "🧀", size: "6,8 cm", weight: "29 g", price: 10.95, tier: "merienda",
      img: "assets/images/toys/queso.png", variantId: "",
      blurb: "Pequeño, pecoso y con más agujeros que excusas." },
    { id: "chispas", name: "Chispas", real: "Galleta", sku: "ETL1406",
      emoji: "🍪", size: "6,8 cm", weight: "23 g", price: 10.95, tier: "merienda",
      img: "assets/images/toys/galleta.png", variantId: "",
      blurb: "La más ligera de la banda. Y la que más rueda." },
    { id: "rollito", name: "Rollito", real: "Brazo de reina", sku: "ETL1407",
      emoji: "🍥", size: "7,2 cm", weight: "27 g", price: 10.95, tier: "merienda",
      img: "assets/images/toys/rollito.png", variantId: "",
      blurb: "Va enrollado por la vida y siempre sonríe." },
    { id: "zanahorio", name: "Zanahorio", real: "Zanahoria", sku: "ETL1388",
      emoji: "🥕", size: "21,5 cm", weight: "74 g", price: 13.95, tier: "huerta",
      img: "assets/images/toys/zanahoria.png", variantId: "",
      blurb: "Largo, naranja y sorprendentemente saltarín." },
    { id: "calabazo", name: "Calabazo", real: "Calabaza", sku: "ETL1385",
      emoji: "🎃", size: "22 cm", weight: "88 g", price: 13.95, tier: "huerta",
      img: "assets/images/toys/calabaza.png", variantId: "",
      blurb: "El grandullón del grupo. Aguanta lo que le eches." },
  ];

  /* Los packs son PRODUCTOS PROPIOS en Shopify, con su propio precio con
     descuento. Ojo: NO se pueden mandar al checkout como sus juguetes sueltos,
     porque entonces Shopify cobraría la suma sin descuento (p. ej. 43,80 €
     en vez de 38,95 €). Por eso cada pack lleva su propio variantId. */
  const PACKS = [
    { id: "pack-merienda", name: "Pack Merienda", price: 38.95, variantId: "",
      members: ["croqui", "quesin", "chispas", "rollito"],
      desc: "Los cuatro pequeños: Croqui, Quesín, Chispas y Rollito.",
      img: "assets/images/toys/croissant.png" },
    { id: "pack-huerta", name: "Pack Huerta", price: 24.95, variantId: "",
      members: ["zanahorio", "calabazo"],
      desc: "Los dos grandes: Zanahorio y Calabazo.",
      img: "assets/images/toys/zanahoria.png" },
    { id: "pack-completo", name: "La colección completa", price: 62.95, variantId: "",
      members: ["croqui", "quesin", "chispas", "rollito", "zanahorio", "calabazo"],
      desc: "Los seis personajes. La familia al completo.",
      img: "assets/images/toys/galleta.png", featured: true },
  ];

  const SHOPIFY_DOMAIN = "pawcadi.myshopify.com";
  const toyById = (id) => TOYS.find((t) => t.id === id);
  const packById = (id) => PACKS.find((p) => p.id === id);
  // Sólo hay checkout real cuando TODO lo vendible tiene su variante en Shopify.
  // Con `some` bastaba una a medias y el checkout se comía líneas sin avisar.
  const shopifyReady = () =>
    TOYS.every((t) => t.variantId) && PACKS.every((p) => p.variantId);

  /* ---- Cesta ----------------------------------------------------- */
  const CART_KEY = "pawcadi_cart_v2";
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      // El `kind` tiene que casar con el `id`: si no, lineOf() daría null y
      // la cesta se quedaría rota para siempre en ese navegador.
      return raw.filter(
        (i) => i && i.qty > 0 &&
          (i.kind === "pack" ? packById(i.id) : toyById(i.id))
      );
    } catch (e) { return []; }
  }
  function saveCart() {
    // El modo privado de Safari puede lanzar al escribir: no debe romper el "Añadir".
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  const lineOf = (item) => {
    const p = item.kind === "pack" ? packById(item.id) : toyById(item.id);
    if (!p) return null;
    return {
      name: p.name,
      sub: item.kind === "pack" ? p.desc : `${p.real} · ${p.size}`,
      price: p.price,
      img: p.img,
      variantId: p.variantId,
    };
  };

  /* ---- Pintar catálogo ------------------------------------------- */
  function renderToys() {
    $("#toyGrid").innerHTML = TOYS.map((t) => `
      <article class="toy-card">
        <div class="toy-media">
          <span class="toy-tag ${t.tier === "huerta" ? "is-huerta" : ""}">${t.tier === "huerta" ? "Huerta" : "Merienda"}</span>
          <img src="${t.img}" alt="${t.name}, ${t.real.toLowerCase()} de látex con carita"
               loading="lazy" decoding="async" width="400" height="300"
               onerror="this.onerror=null;this.src='assets/placeholder.svg'">
        </div>
        <div class="toy-body">
          <h3>${t.emoji} ${t.name}</h3>
          <p class="toy-real">${t.real}</p>
          <p class="toy-blurb">${t.blurb}</p>
          <p class="toy-specs">${t.size} · ${t.weight}</p>
          <div class="toy-foot">
            <span class="toy-price">${money(t.price)}</span>
            <button class="btn btn-primary btn-sm" data-add-toy="${t.id}">Añadir</button>
          </div>
        </div>
      </article>`).join("");
  }

  function renderPacks() {
    $("#packGrid").innerHTML = PACKS.map((p) => {
      const full = p.members.reduce((n, id) => n + toyById(id).price, 0);
      const save = full - p.price;
      return `
      <article class="pack-card${p.featured ? " is-featured" : ""}">
        ${p.featured ? '<span class="pack-badge">Más completo</span>' : ""}
        <h3>${p.name}</h3>
        <p class="pack-desc">${p.desc}</p>
        <div class="pack-thumbs">
          ${p.members.map((id) => `<img src="${toyById(id).img}" alt="" onerror="this.style.display='none'">`).join("")}
        </div>
        <div class="pack-price">
          <span class="now">${money(p.price)}</span>
          <span class="was">${money(full)}</span>
        </div>
        <p class="pack-save">Ahorras ${money(save)}</p>
        <button class="btn ${p.featured ? "btn-primary" : "btn-ghost"} btn-block" data-add-pack="${p.id}">Añadir el pack</button>
      </article>`;
    }).join("");
  }

  /* ---- Añadir a la cesta ----------------------------------------- */
  function addItem(id, kind) {
    const key = kind + ":" + id;
    const found = cart.find((i) => i.key === key);
    if (found) found.qty++;
    else cart.push({ key, id, kind, qty: 1 });
    saveCart();
    renderCart();
    openCart();
  }

  document.addEventListener("click", (e) => {
    const toyBtn = e.target.closest("[data-add-toy]");
    if (toyBtn) return addItem(toyBtn.dataset.addToy, "toy");
    const packBtn = e.target.closest("[data-add-pack]");
    if (packBtn) return addItem(packBtn.dataset.addPack, "pack");
  });

  /* ---- Pintar cesta ---------------------------------------------- */
  const cartBody = $("#cartBody");
  function renderCart() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const total = cart.reduce((n, i) => {
      const l = lineOf(i); return l ? n + l.price * i.qty : n;
    }, 0);
    $("#cartCount").textContent = count;

    if (cart.length === 0) {
      cartBody.innerHTML =
        '<div class="cart-empty"><div class="big">🐾</div>' +
        "<p>Tu cesta está vacía.</p>" +
        '<a href="#coleccion" class="btn btn-ghost" id="emptyShop">Ver la colección</a></div>';
      const es = $("#emptyShop");
      if (es) es.addEventListener("click", closeCart);
    } else {
      cartBody.innerHTML = cart.map((item, idx) => {
        const l = lineOf(item);
        return `
        <div class="cart-item">
          <div class="ci-img"><img src="${l.img}" alt="" onerror="this.onerror=null;this.src='assets/placeholder.svg'"></div>
          <div>
            <h4>${l.name}</h4>
            <div class="ci-meta">${l.sub}</div>
            <div class="ci-qty">
              <button data-dec="${idx}" aria-label="Quitar uno">−</button>
              <span>${item.qty}</span>
              <button data-inc="${idx}" aria-label="Añadir uno">+</button>
            </div>
            <button class="ci-remove" data-remove="${idx}">Quitar</button>
          </div>
          <div class="ci-price">${money(l.price * item.qty)}</div>
        </div>`;
      }).join("");
    }

    $("#cartTotal").textContent = money(total);
    const note = $("#shipNote");
    if (total > 0 && total >= FREE_SHIP) note.textContent = "🎉 ¡Envío GRATIS conseguido!";
    else note.textContent = `Te faltan ${money(FREE_SHIP - total)} para el envío gratis.`;
  }

  cartBody.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.inc !== undefined) cart[+b.dataset.inc].qty++;
    else if (b.dataset.dec !== undefined) {
      const i = +b.dataset.dec;
      if (--cart[i].qty <= 0) cart.splice(i, 1);
    } else if (b.dataset.remove !== undefined) cart.splice(+b.dataset.remove, 1);
    else return;
    saveCart();
    renderCart();
  });

  /* ---- Cajón de la cesta ----------------------------------------- */
  const drawer = $("#drawer"), overlay = $("#overlay");
  function openCart() { drawer.classList.add("is-open"); overlay.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeCart() { drawer.classList.remove("is-open"); overlay.classList.remove("is-open"); document.body.style.overflow = ""; }
  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  /* ---- Checkout (cart permalink de Shopify) ---------------------- */
  const checkoutBtn = $("#checkoutBtn");
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) { alert("Tu cesta está vacía — ¡elige a alguno de la banda! 🐾"); return; }

    if (!shopifyReady()) {
      alert(
        listaAbierta
          ? "🐾 La colección está en PRE-LANZAMIENTO.\n\nTodavía no se puede comprar: " +
            "déjanos tu correo y te avisamos el día que salga, con un 10% de descuento."
          : "🐾 La colección está en PRE-LANZAMIENTO.\n\nTodavía no se puede comprar. " +
            "¡Estamos a punto de recibir la primera hornada, vuelve en unos días!"
      );
      closeCart();
      if (listaAbierta) goToNewsletter();
      return;
    }

    // Cada línea de la cesta va con SU variante (los packs tienen la suya, con
    // el precio con descuento). Si alguna no se puede mapear, no seguimos:
    // antes que cobrar de más o perder líneas, mejor parar.
    const qtyByVariant = {};
    for (const item of cart) {
      const l = lineOf(item);
      if (!l || !l.variantId) {
        alert("Estamos teniendo un problema con la cesta. Escríbenos y te ayudamos. 🐾");
        return;
      }
      qtyByVariant[l.variantId] = (qtyByVariant[l.variantId] || 0) + item.qty;
    }
    const parts = Object.entries(qtyByVariant).map(([vid, q]) => `${vid}:${q}`);

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "…";
    window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${parts.join(",")}`;
  });

  /* ---- Acordeón de preguntas ------------------------------------- */
  $$(".faq-item").forEach((item) => {
    const q = $(".faq-q", item), a = $(".faq-a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      $$(".faq-item").forEach((o) => { o.classList.remove("is-open"); $(".faq-a", o).style.maxHeight = null; });
      if (!open) { item.classList.add("is-open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---- Menú móvil ------------------------------------------------ */
  const header = $(".site-header"), navToggle = $("#navToggle");
  navToggle.addEventListener("click", () => {
    navToggle.setAttribute("aria-expanded", header.classList.toggle("nav-open"));
  });
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

  /* ---- Lista de espera ------------------------------------------- */
  /* IMPORTANTE: sin uno de estos dos rellenos, el formulario NO se muestra.
     Se probó mandar los correos al endpoint /contact de Shopify y NO funciona
     desde otro dominio (devuelve 400/403), así que se quitó: un formulario que
     dice "¡Hecho!" mientras descarta el correo es peor que no tener formulario.

     Opción A (recomendada) — servicio gratuito de formularios:
       date de alta en https://formspree.io (gratis, sin tarjeta) y pega aquí
       la URL que te dan, del tipo https://formspree.io/f/abcdwxyz
     Opción B — sin registrarte en nada: pon un correo y el botón abrirá el
       gestor de correo del visitante con el mensaje ya escrito. */
  const FORM_ENDPOINT = "";   // ← Opción A
  const CONTACT_EMAIL = "";   // ← Opción B

  function goToNewsletter() {
    const sec = $("#avisame");
    if (!sec) return;
    sec.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = $("#newsletter input");
    if (input) setTimeout(() => input.focus(), 400);
  }

  const newsletter = $("#newsletter");
  const newsletterMsg = $("#newsletterMsg");

  const listaAbierta = Boolean(FORM_ENDPOINT || CONTACT_EMAIL);

  if (!listaAbierta) {
    // Sin sitio donde guardar los correos: el formulario ya viene oculto del HTML.
    // Aquí sólo quitamos de la web la promesa del 10% por apuntarse.
    const anuncio = $(".announce");
    if (anuncio) {
      anuncio.innerHTML =
        "🐾 <b>Pre-lanzamiento</b> — la primera hornada llega pronto";
    }
    const ctaLead = $("#avisame .cta-band p");
    if (ctaLead) {
      ctaLead.textContent =
        "La primera hornada es corta y está en camino. En unos días abrimos la lista de espera.";
    }
  } else {
    newsletter.hidden = false;
    newsletterMsg.hidden = true;
    newsletterMsg.textContent = "";

    newsletter.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", newsletter);
      const btn = $("button", newsletter);
      const email = (input.value || "").trim();
      if (!email) return;

      // Opción B: abrir el gestor de correo del visitante.
      if (!FORM_ENDPOINT) {
        const asunto = encodeURIComponent("Avisadme del lanzamiento");
        const cuerpo = encodeURIComponent(
          `Hola, quiero que me aviséis cuando salga la colección.\n\nMi correo: ${email}`
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${asunto}&body=${cuerpo}`;
        newsletterMsg.textContent = "Se abrirá tu correo para que nos envíes el mensaje.";
        newsletterMsg.hidden = false;
        return;
      }

      // Opción A: servicio de formularios. Aquí SÍ leemos la respuesta, así que
      // sólo decimos "hecho" cuando de verdad se ha guardado.
      btn.disabled = true;
      const prev = btn.textContent;
      btn.textContent = "Enviando…";
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, origen: "pre-lanzamiento Pawcadi" }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("respuesta " + r.status);
          newsletter.reset();
          newsletterMsg.textContent = "¡Hecho! 🐶 Te avisamos en cuanto salga la colección.";
        })
        .catch(() => {
          newsletterMsg.textContent =
            "No hemos podido apuntarte. Inténtalo de nuevo en un momento, por favor.";
        })
        .finally(() => {
          newsletterMsg.hidden = false;
          btn.disabled = false;
          btn.textContent = prev;
        });
    });
  }

  /* Al volver "atrás" desde Shopify, el navegador restaura la página del caché
     y el botón se quedaba deshabilitado con "…". */
  window.addEventListener("pageshow", () => {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Finalizar compra";
  });

  /* ---- Init ------------------------------------------------------ */
  $("#year").textContent = new Date().getFullYear();
  renderToys();
  renderPacks();
  renderCart();
})();
