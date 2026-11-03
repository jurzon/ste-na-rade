/* „Ste na rade“ — prototyp: úvod, scény č. 010, 001, 012, 013 a záverečný recept.
   Bez knižníc, bez cookies, bez sledovania. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const pokojne = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Záznam hry pre záverečný plagát. Len v pamäti, nikam sa neposiela.
  const zaznam = { peciatky: [], listky: [], mince: [], pruhKliky: 0, pustil: 0 };

  /* ---------- zvuk (WebAudio, spustí sa až po kliknutí) ---------- */
  let ac = null, zvukZap = true;
  const audio = () => (ac ??= new (window.AudioContext || window.webkitAudioContext)());
  function zvoncek() {
    if (!zvukZap) return;
    const a = audio(), t = a.currentTime;
    [1318, 1976, 2637].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18 / (i + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.7);
    });
  }
  function tlac(dlzka = 0.09) { // krátky šum termotlačiarne
    if (!zvukZap) return;
    const a = audio(), n = Math.floor(a.sampleRate * dlzka);
    const buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(i / 38));
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = 0.8; g.gain.value = 0.07;
    s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start();
  }
  function skrab() {
    if (!zvukZap || Math.random() > 0.35) return;
    tlac(0.03);
  }
  $("#zvuk").addEventListener("click", (e) => {
    zvukZap = !zvukZap;
    e.currentTarget.textContent = zvukZap ? "zvuk: zap." : "zvuk: vyp.";
    e.currentTarget.setAttribute("aria-pressed", String(zvukZap));
  });

  /* ---------- len fakty ---------- */
  $("#len-fakty").addEventListener("click", () => $("#fakty").showModal());

  /* ---------- tlač riadkov ---------- */
  const cakaj = (ms) => new Promise((r) => setTimeout(r, pokojne ? 0 : ms));
  async function vytlac(riadky, krok = 230) {
    for (const el of riadky) {
      el.classList.add("on");
      tlac();
      if (!pokojne) el.scrollIntoView({ block: "end", behavior: "smooth" });
      await cakaj(krok);
    }
  }

  /* ---------- scéna 0 → 1 ---------- */
  function gong() { // vyvolávací systém: dvojtón
    if (!zvukZap) return;
    const a = audio(), t = a.currentTime;
    [[784, 0], [622, 0.38]].forEach(([f, d]) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.22, t + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 1.3);
      o.connect(g).connect(a.destination); o.start(t + d); o.stop(t + d + 1.4);
    });
  }
  // regály za sklom: škatuľky liekov v tlmených farbách
  (function naplnRegaly() {
    const farby = ["#2f7fc1", "#d2453b", "#1fa45a", "#e2a33a", "#7a5aa8", "#3aa3a0", "#c9568b", "#5f6b75"];
    let sem = 11; const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
    for (let p = 0; p < 3; p++) {
      const pol = document.createElement("div"); pol.className = "polica";
      for (let k = 0; k < 34; k++) {
        const sk = document.createElement("div"); sk.className = "skatulka";
        sk.style.width = `${10 + rnd() * 18}px`; sk.style.height = `${40 + rnd() * 50}%`;
        sk.style.setProperty("--f", farby[Math.floor(rnd() * farby.length)]);
        pol.append(sk);
      }
      $("#regaly").append(pol);
    }
  })();

  $("#zvoncek").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    const uvod = $("#uvod");
    // automat vytlačí poradový lístok
    uvod.classList.add("listok-von");
    for (let i = 0; i < 5; i++) { tlac(0.06); await cakaj(200); }
    await cakaj(300);
    // displej vyvolá číslo
    gong();
    $("#displej-cislo").textContent = "A\u00a0001";
    $("#displej-okienko").textContent = "→ okienko 1";
    $(".displej").classList.add("blika");
    uvod.classList.add("na-rade");
    $("#ste-na-rade").textContent = "Ste na rade.";
    await cakaj(1900);
    uvod.classList.add("odchod");
    await cakaj(900);
    $("#uvod").hidden = true;
    document.body.classList.remove("na-uvode");
    $("#pult").hidden = false;
    window.scrollTo(0, 0);
    await cakaj(300);
    const pas = $("#pas");
    const pred = [...pas.querySelectorAll(".r")].filter((r) => !r.classList.contains("po-odkryti"));
    await vytlac(pred);
    await new Promise((r) => setTimeout(r, 400)); // počkať na koniec rozbalenia riadku
    pripravStieranie();
  });

  /* ---------- stieracia vrstva ---------- */
  let odkryte = false;
  function pripravStieranie() {
    const box = $("#stieracie"), cv = $("#vrstva"), ctx = cv.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const r = box.getBoundingClientRect();
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    ctx.scale(dpr, dpr);
    const w = r.width, h = r.height;

    // vyblednutý termopapier: sivá plocha so zrnom a šrafovaním
    ctx.fillStyle = "#cfc9bd"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < w * h / 18; i++) {
      ctx.fillStyle = `rgba(60,55,48,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    }
    ctx.strokeStyle = "rgba(90,84,74,.18)"; ctx.lineWidth = 1;
    for (let x = -h; x < w; x += 7) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
    ctx.fillStyle = "#6f695e"; ctx.textAlign = "center";
    ctx.font = "600 12px ui-monospace, Consolas, monospace";
    ctx.fillText("A KTO ZAPLATIL ZVYŠOK?", w / 2, h / 2 - 6);
    ctx.font = "11px ui-monospace, Consolas, monospace";
    ctx.fillText("zotrite prstom alebo myšou", w / 2, h / 2 + 14);

    ctx.globalCompositeOperation = "destination-out";
    let kreslim = false, posl = null, pocet = 0;
    const bod = (e) => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const tah = (p) => {
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 34;
      ctx.beginPath(); ctx.moveTo((posl || p).x, (posl || p).y); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, 17, 0, Math.PI * 2); ctx.fill();
      posl = p; skrab();
      if (++pocet % 8 === 0 && podiel() > 0.5) odkry();
    };
    function podiel() { // podiel zotretej plochy (vzorkovanie)
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let pr = 0, vs = 0;
      for (let i = 3; i < d.length; i += 4 * 24) { vs++; if (d[i] < 40) pr++; }
      return pr / vs;
    }
    cv.addEventListener("pointerdown", (e) => { kreslim = true; posl = null; cv.setPointerCapture(e.pointerId); tah(bod(e)); });
    cv.addEventListener("pointermove", (e) => { if (kreslim) tah(bod(e)); });
    const stop = () => { kreslim = false; posl = null; };
    cv.addEventListener("pointerup", stop); cv.addEventListener("pointercancel", stop);
    $("#odkryt").addEventListener("click", odkry);
  }

  async function odkry() {
    if (odkryte) return;
    odkryte = true;
    $("#stieracie").classList.add("hotovo");
    await cakaj(900);
    await vytlac([...document.querySelectorAll(".po-odkryti")], 420);
    await cakaj(600);
    await chvilaTicha({
      pas: $("#pas"), dokaz: $("#dokaz1"),
      veta: "Najväčšie číslo dostalo najmenšie písmo.",
      peciatka: "NEVIDNO", podpis: "úhrada poisťovne",
    });
    const volba = await opytaj("Ako by mohla vyzerať lepšia účtenka?", [
      { text: "Napísať na ňu veľkým písmom, koľko zaplatila poisťovňa.", odpoved: "Presne tak. Stačia tri riadky:" },
      { text: "Raz ročne poslať poistencovi prehľad, čo za neho poisťovňa zaplatila.", odpoved: "Aj to pomôže, ale až o rok. Pri okienku stačia tri riadky:" },
      { text: "Nechať ju tak. Pacienta zaujíma len to, čo platí on.", odpoved: "Možno. Skúsme mu to aspoň ukázať:" },
    ]);
    napisOdozvu($("#odozva1"), volba);
    // odtrhnúť starú účtenku a vytlačiť správnu
    $("#pas").classList.add("odtrhnuta");
    tlac(0.32);
    await cakaj(450);
    const nova = $("#pas2");
    nova.hidden = false;
    $("#stol").classList.add("druha");
    window.scrollTo({ top: 0, behavior: pokojne ? "auto" : "smooth" });
    await cakaj(700);
    await vytlac([...nova.querySelectorAll(".r")], 300);
  }

  /* ---------- prechod na ďalšiu scénu ---------- */
  async function dalsiZakaznik(stary, novy) {
    zvoncek();
    stary.classList.add("prec");
    await cakaj(700);
    stary.hidden = true;
    novy.hidden = false;
    window.scrollTo({ top: 0, behavior: "auto" });
    await cakaj(300);
  }
  const tlacRiadkyBez = (pas, ...triedy) =>
    [...pas.querySelectorAll(".r")].filter((r) => !triedy.some((t) => r.classList.contains(t)));

  /* ---------- scéna 2: 1 cent za 5 centov (č. 001) ---------- */
  const eur = (c) => (c / 100).toFixed(2).replace(".", ",");
  function cink() {
    if (!zvukZap) return;
    const a = audio(), t = a.currentTime;
    [3150, 4720].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "triangle"; o.frequency.value = f + Math.random() * 120;
      g.gain.setValueAtTime(0.0001, t + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.12, t + i * 0.06 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.35);
      o.connect(g).connect(a.destination); o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.4);
    });
  }

  $("#na-scenu2").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await dalsiZakaznik($("#stol"), $("#stol2"));
    await vytlac(tlacRiadkyBez($("#pas3"), "po-minci", "po-platbe", "po-vynimke"));
    const platba = $("#platba");
    platba.hidden = false;
    if (!pokojne) platba.scrollIntoView({ block: "end", behavior: "smooth" });
  });

  let vMiske = 0, zaplatene = false;
  const POTREBNE = 5; // pokladňa chce 0,05 € v hotovosti
  document.querySelectorAll("#platba .minca").forEach((m) =>
    m.addEventListener("click", async () => {
      if (zaplatene) return;
      const c = Number(m.dataset.c), prva = vMiske === 0;
      vMiske += c;
      zaznam.mince.push(c);
      const kopia = m.cloneNode(true);
      kopia.removeAttribute("aria-label"); kopia.tabIndex = -1;
      $("#v-miske").append(kopia);
      $("#suma-misky").textContent = `${eur(vMiske)} €`;
      cink();
      if (prva) {
        await cakaj(350);
        await vytlac([...document.querySelectorAll("#pas3 .po-minci")], 300);
        if (!pokojne) $("#platba").scrollIntoView({ block: "end", behavior: "smooth" });
      }
      if (vMiske < POTREBNE) {
        const chyba = POTREBNE - vMiske;
        $("#pokyn").textContent = `Pokladňa chce 0,05 €. Chýba ešte ${chyba} ${chyba === 1 ? "cent" : chyba < 5 ? "centy" : "centov"}.`;
        return;
      }
      zaplatene = true;
      document.querySelectorAll("#platba .mince .minca").forEach((x) => (x.disabled = true));
      $("#pokyn").textContent = "Ďakujeme. Liek stál 1 cent.";
      $("#prijate").textContent = eur(vMiske);
      $("#vratene").textContent = eur(vMiske - POTREBNE);
      await cakaj(900);
      $("#platba").classList.add("prec");
      await cakaj(500);
      $("#platba").hidden = true;
      await vytlac([...document.querySelectorAll("#pas3 .po-platbe")], 380);
    })
  );

  $("#vynimka").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    e.currentTarget.closest(".r").classList.remove("on"); // tlačidlo zmizne z pásu
    const riadky = [...document.querySelectorAll("#pas3 .po-vynimke")];
    await vytlac(riadky.slice(0, 2), 250);
    await kresliBodky();
    await vytlac(riadky.slice(2), 420);
    await cakaj(600);
    await chvilaTicha({
      pas: $("#pas3"), dokaz: $("#dokaz2"),
      veta: "Takmer štyri z piatich doplatkov sa v hotovosti nedajú zaplatiť presne.",
      peciatka: "NESEDÍ", podpis: "1 992 doplatkov",
    });
    const volba = await opytaj("Čo s doplatkom, ktorý sa nedá zaplatiť?", [
      { text: "Zaokrúhliť ho raz, už v zozname kategorizovaných liekov.", odpoved: "Presne tak. Raz, v zozname:" },
      { text: "Platiť len kartou, tá to zaplatí na cent.", odpoved: "Kartou to sedí. Nie každý však platí kartou. Preto:" },
      { text: "Nechať zaokrúhľovanie na pokladnici, ako dnes.", odpoved: "Tak je to dnes a 79 % doplatkov v hotovosti nesedí. Preto:" },
    ]);
    napisOdozvu($("#odozva2"), volba);
    $("#pas3").classList.add("odtrhnuta");
    tlac(0.32);
    await cakaj(450);
    const nova = $("#pas4");
    nova.hidden = false;
    $("#stol2").classList.add("druha");
    window.scrollTo({ top: 0, behavior: pokojne ? "auto" : "smooth" });
    await cakaj(700);
    await vytlac([...nova.querySelectorAll(".r")], 300);
  });

  // 2 510 liekov s doplatkom: 1 992 plných (nekončí na 0/5 centov), 518 prázdnych
  async function kresliBodky() {
    const SPOLU = 2510, PLNE = 1992, STLPCE = 50;
    const cv = $("#bodky"), ctx = cv.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = cv.parentElement.getBoundingClientRect().width;
    const krok = w / STLPCE, riadky = Math.ceil(SPOLU / STLPCE);
    cv.style.height = `${riadky * krok}px`;
    cv.width = Math.round(w * dpr); cv.height = Math.round(riadky * krok * dpr);
    ctx.scale(dpr, dpr);
    const r = krok * 0.34;
    ctx.fillStyle = ctx.strokeStyle = "#1b1a18"; ctx.lineWidth = Math.max(0.8, krok * 0.1);
    for (let rad = 0; rad < riadky; rad++) {
      for (let s = 0; s < STLPCE; s++) {
        const i = rad * STLPCE + s;
        if (i >= SPOLU) break;
        const x = s * krok + krok / 2, y = rad * krok + krok / 2;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        i < PLNE ? ctx.fill() : ctx.stroke();
      }
      if (rad % 3 === 0) { tlac(0.03); if (!pokojne) cv.scrollIntoView({ block: "end" }); await cakaj(45); }
    }
  }
  /* ---------- medziobrazovka: „Ako by to mohlo byť lepšie?“ ----------
     moznosti: [{ text, odpoved }] — vráti vybranú možnosť. */
  function opytaj(otazka, moznosti) {
    return new Promise(async (hotovo) => {
      const m = $("#medzi"), box = $("#listky");
      $("#medzi-otazka").textContent = otazka;
      box.replaceChildren();
      const rot = ["-3deg", "2deg", "-1deg", "3deg"];
      const listky = moznosti.map((mo, i) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "listok"; b.textContent = mo.text;
        b.style.setProperty("--rot", rot[i % rot.length]);
        box.append(b);
        return b;
      });
      listky.forEach((b, i) => b.addEventListener("click", async () => {
        listky.forEach((x) => (x.disabled = true));
        zaznam.listky.push({ i, text: moznosti[i].text });
        listky.forEach((x) => x !== b && x.classList.add("iny"));
        // lístok vletí do štrbiny tlačiarne
        const ciel = $(".strbina").getBoundingClientRect(), r = b.getBoundingClientRect();
        const dx = ciel.left + ciel.width / 2 - (r.left + r.width / 2);
        const dy = ciel.top + ciel.height / 2 - (r.top + r.height / 2);
        b.classList.add("vhadzuje");
        b.style.transform = `translate(${dx}px, ${dy}px) scale(.12) rotate(0deg)`;
        b.style.opacity = "0.15";
        await cakaj(750);
        $(".tlaciaren").classList.add("hlta"); tlac(0.25);
        m.classList.add("odchod");
        await cakaj(800);
        m.hidden = true; m.className = "medzi";
        $(".tlaciaren").classList.remove("hlta");
        hotovo(moznosti[i]);
      }, { once: true }));

      // kliknutie je pripojené vopred; lístky sú klikateľné, až keď sú vidieť (.on)
      m.hidden = false;
      await cakaj(30);
      m.classList.add("on");
      await cakaj(1700);              // otáznik sa dopíše
      m.classList.add("otazka-on");
      await cakaj(500);
      for (const b of listky) { b.classList.add("on"); tlac(0.02); await cakaj(160); }
      listky[0].focus({ preventScroll: true });
    });
  }
  function napisOdozvu(el, volba) {
    el.innerHTML = "";
    const v = document.createElement("div"); v.className = "vas"; v.textContent = `Váš lístok: „${volba.text}“`;
    const o = document.createElement("div"); o.className = "odp"; o.textContent = volba.odpoved;
    el.append(v, o);
  }
  /* ---------- chvíľa ticha: reflektor, krúžok perom, veta, pečiatka ----------
     Problém sa zastaví a návštevník ho sám opečiatkuje. Pečiatka ostane na doklade. */
  function buch() {
    if (!zvukZap) return;
    const a = audio(), t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.3);
    tlac(0.05);
  }
  function relativne(el, pas) {
    const a = el.getBoundingClientRect(), b = pas.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  }
  async function chvilaTicha({ pas, dokaz, veta, peciatka, podpis }) {
    // 1. dôkaz do stredu obrazovky, stránka sa nehýbe
    dokaz.scrollIntoView({ block: "center", behavior: pokojne ? "auto" : "smooth" });
    await cakaj(700);
    document.body.style.overflow = "hidden";
    pas.classList.add("ticho");

    // 2. reflektor: všetko okrem dôkazu potemnie
    const r = dokaz.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const rx = Math.max(110, r.width * 0.9), ry = Math.max(70, r.height * 2.2);
    const ref = $("#reflektor");
    ref.style.background = `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, rgba(0,0,0,0) 55%, rgba(0,0,0,.78) 100%)`;
    ref.hidden = false; await cakaj(30); ref.classList.add("on");
    await cakaj(900);

    // 3. krúžok perom okolo dôkazu
    const p = relativne(dokaz, pas), pad = 10;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "kruzok");
    const W2 = p.w + pad * 4, H2 = p.h + pad * 2.4;
    Object.assign(svg.style, { left: `${p.x - pad * 2}px`, top: `${p.y - pad * 1.2}px`, width: `${W2}px`, height: `${H2}px` });
    svg.setAttribute("viewBox", `0 0 ${W2} ${H2}`);
    const el = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    el.setAttribute("cx", W2 / 2); el.setAttribute("cy", H2 / 2);
    el.setAttribute("rx", W2 / 2 - 2); el.setAttribute("ry", H2 / 2 - 2);
    el.setAttribute("pathLength", "1"); el.setAttribute("transform", `rotate(-3 ${W2 / 2} ${H2 / 2})`);
    svg.append(el); pas.append(svg);
    await cakaj(1100);

    // 4. veta perom pod (alebo nad) dôkazom
    const v = $("#ticho-veta");
    v.textContent = veta;
    v.hidden = false;
    await cakaj(30); v.classList.add("on");
    await cakaj(1400);

    // 5. pečiatka: návštevník klikne na doklad (alebo na tlačidlo)
    const ov = $("#ticho-ovladanie");
    ov.hidden = false; await cakaj(30); ov.classList.add("on");
    pas.classList.add("na-peciatku");
    await new Promise((hotovo) => {
      const poloz = (x, y) => {
        pas.removeEventListener("click", naKlik);
        $("#peciatkuj").removeEventListener("click", naTlacidlo);
        const st = document.createElement("div");
        st.className = "peciatka";
        st.innerHTML = `${peciatka}<small>${podpis}</small>`;
        const rot = -4 - Math.random() * 9;
        st.style.setProperty("--rot", `${rot}deg`);
        const rr = pas.getBoundingClientRect();
        zaznam.peciatky.push({ text: peciatka, podpis, rot, x: x / rr.width, y: y / rr.height });
        st.style.left = `${x}px`; st.style.top = `${y}px`;
        pas.append(st);
        setTimeout(() => {           // buch: pečiatka dopadne a rozsvieti sa
          buch(); pas.classList.add("otras");
          $("#reflektor").classList.remove("on"); $("#ticho-veta").classList.remove("on");
        }, 240);
        setTimeout(() => pas.classList.remove("otras"), 560);
        hotovo();
      };
      const b = () => pas.getBoundingClientRect();
      const naKlik = (e) => {
        const r2 = b();
        const x = Math.min(Math.max(e.clientX - r2.left, 90), r2.width - 90);
        poloz(x, e.clientY - r2.top);
      };
      const naTlacidlo = () => { const q = relativne(dokaz, pas); poloz(b().width / 2, q.y + q.h + 46); };
      pas.addEventListener("click", naKlik);
      $("#peciatkuj").addEventListener("click", naTlacidlo);
    });
    pas.classList.remove("na-peciatku");
    ov.classList.remove("on");
    await cakaj(1600);              // nechať pečiatku chvíľu pôsobiť

    // 6. svetlo späť
    ref.classList.remove("on"); v.classList.remove("on");
    await cakaj(900);
    ref.hidden = true; v.hidden = true; ov.hidden = true;
    pas.classList.remove("ticho");
    document.body.style.overflow = "";
  }
  /* ---------- scéna 3: Tá istá tableta, dve ceny (č. 012) ---------- */
  $("#na-scenu3").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await dalsiZakaznik($("#stol2"), $("#stol3"));
    await vytlac(tlacRiadkyBez($("#pas5"), "po-hranici", "po-pruhu"));
    const hr = $("#hranica");
    hr.hidden = false;
    if (!pokojne) hr.scrollIntoView({ block: "end", behavior: "smooth" });
    pripravHranicu();
  });

  function pripravHranicu() {
    const trat = $("#trat"), tab = $("#tableta"), hr = $("#hranica");
    const OKRAJ = 10, SK = 1.32, DE = 1.99;
    let x = OKRAJ, prekrocena = false, hotovo = false, posun = 0;
    const max = () => trat.clientWidth - tab.offsetWidth - OKRAJ;
    const podiel = () => (x - OKRAJ) / (max() - OKRAJ);
    function nastav(nx) {
      x = Math.min(Math.max(nx, OKRAJ), max());
      tab.style.left = `${x}px`;
      const p = podiel();
      const cena = p < 0.44 ? SK : p > 0.56 ? DE : SK + ((p - 0.44) / 0.12) * (DE - SK);
      $("#cena-tab").textContent = `${cena.toFixed(2).replace(".", ",")}\u00a0€`;
      hr.classList.toggle("za", p > 0.5);
      if (p > 0.5 && !prekrocena) { prekrocena = true; cink(); }
      if (p < 0.5) prekrocena = false;
    }
    async function skonci() {
      if (hotovo || podiel() <= 0.56) return;
      hotovo = true;
      tab.disabled = true;
      nastav(max());
      $("#hranica-pokyn").textContent = "Tá istá tableta. Iná cena.";
      await cakaj(1200);
      hr.classList.add("prec");
      await cakaj(500);
      hr.hidden = true;
      await vytlac([...document.querySelectorAll("#pas5 .po-hranici")], 380);
      cakajNaPruh();
    }
    tab.addEventListener("pointerdown", (e) => {
      if (hotovo) return;
      tab.setPointerCapture(e.pointerId);
      posun = e.clientX - trat.getBoundingClientRect().left - x;
    });
    tab.addEventListener("pointermove", (e) => {
      if (hotovo || !tab.hasPointerCapture(e.pointerId)) return;
      nastav(e.clientX - trat.getBoundingClientRect().left - posun);
    });
    tab.addEventListener("pointerup", skonci);
    tab.addEventListener("keydown", (e) => {
      if (hotovo) return;
      if (e.key === "ArrowRight") { e.preventDefault(); nastav(x + max() * 0.12); skonci(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); nastav(x - max() * 0.12); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nastav(max()); skonci(); }
    });
  }

  function cakajNaPruh() {
    const pruh = $("#pruh");
    let pokusy = 0, pokracuje = false;
    pruh.addEventListener("click", async () => {
      pokusy++;
      zaznam.pruhKliky++;
      pruh.classList.remove("trasie"); void pruh.offsetWidth; pruh.classList.add("trasie");
      tlac(0.04);
      $("#pruh-pokyn").textContent = pokusy === 1 ? "nedá sa odkryť" : "začiernené";
      if (pokracuje) return;
      pokracuje = true;
      await cakaj(900);
      await vytlac([...document.querySelectorAll("#pas5 .po-pruhu")], 420);
      await cakaj(600);
      await chvilaTicha({
        pas: $("#pas5"), dokaz: pruh,
        veta: "Tá istá tableta. Tri ceny. Jednu nesmieme poznať.",
        peciatka: "TAJNÉ", podpis: "zľava pri obličkách",
      });
      const volba = await opytaj("Ako by sa dala cena lieku vyjednať lepšie?", [
        { text: "Vyjednávať ceny spoločne za celú EÚ.", odpoved: "Presne tak. 450 miliónov ľudí má inú silu ako 5 miliónov:" },
        { text: "Nech si každý štát dohodne vlastnú tajnú zľavu.", odpoved: "Tak je to dnes a verejné cenníky prestávajú niečo znamenať. Preto:" },
        { text: "Bohatšie štáty nech platia viac, chudobnejšie menej.", odpoved: "Prečo by bohatší platil viac za to isté balenie? Preto:" },
      ]);
      napisOdozvu($("#odozva3"), volba);
      $("#pas5").classList.add("odtrhnuta");
      tlac(0.32);
      await cakaj(450);
      const nova = $("#pas6");
      nova.hidden = false;
      $("#stol3").classList.add("druha");
      window.scrollTo({ top: 0, behavior: pokojne ? "auto" : "smooth" });
      await cakaj(700);
      await vytlac([...nova.querySelectorAll(".r")], 300);
    });
  }
  /* ---------- scéna 4: Liek v boxe (č. 013) ---------- */
  $("#na-scenu4").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await dalsiZakaznik($("#stol3"), $("#stol4"));
    await vytlac(tlacRiadkyBez($("#pas7"), "po-lete"));
    const leto = $("#leto");
    leto.hidden = false;
    if (!pokojne) leto.scrollIntoView({ block: "end", behavior: "smooth" });
    pripravLeto();
  });

  // Leto 2026 (SHMÚ): 56 dní nad 30 °C v Hurbanove, maximum 42,2 °C 6. 8. 2026.
  // Stúpanie teplomera je ilustrácia; overené sú len koncové čísla.
  function pripravLeto() {
    const leto = $("#leto"), btn = $("#podrzte"), TRVANIE = 6500;
    let t = 0, drzi = false, posl = 0, pustilSkor = false, hotovo = false;
    const ease = (x) => x * x * (3 - 2 * x);
    function kresli() {
      const teplota = 18 + (42.2 - 18) * ease(t);
      leto.style.setProperty("--t", t.toFixed(3));
      btn.style.setProperty("--t", t.toFixed(3));
      $("#rtut").style.height = `calc(${(teplota / 45) * 100}% - 12px)`;
      $("#leto-teplota").textContent = `${teplota.toFixed(1).replace(".", ",")}\u00a0°C`;
      const dni = Math.round(56 * t);
      $("#leto-dni").textContent = `${dni} ${dni === 1 ? "deň" : dni >= 2 && dni <= 4 ? "dni" : "dní"}`;
      $("#leto-mesiac").textContent = t >= 1 ? "6. august" : t < 0.34 ? "jún" : t < 0.67 ? "júl" : "august";
      leto.classList.toggle("nad25", teplota > 25);
      leto.classList.toggle("horuco", teplota > 30 && !pokojne);
    }
    function krok(cas) {
      if (!drzi || hotovo) return;
      const dt = posl ? cas - posl : 16; posl = cas;
      t = Math.min(1, t + (pokojne ? 1 : dt / TRVANIE));
      kresli();
      if (Math.random() < 0.08) tlac(0.015);
      if (t >= 1) return skonci();
      requestAnimationFrame(krok);
    }
    const zacni = (e) => {
      if (hotovo || drzi) return;
      e && e.preventDefault();
      drzi = true; posl = 0; btn.classList.add("drzi");
      $("#leto-pokyn").textContent = pustilSkor ? "Liek v boxe pustiť nemôže." : "Leto ubieha…";
      requestAnimationFrame(krok);
    };
    const pusti = () => {
      if (!drzi || hotovo) return;
      drzi = false; btn.classList.remove("drzi");
      if (t > 0.03 && t < 1) {
        pustilSkor = true;
        zaznam.pustil++;
        $("#leto-pokyn").textContent = "Vy ste mohli pustiť. Liek v boxe nie. Držte ďalej.";
      }
    };
    async function skonci() {
      hotovo = true; drzi = false;
      btn.disabled = true; btn.classList.remove("drzi");
      cink();
      $("#leto-pokyn").textContent = "6. augusta 2026: 42,2 °C v tieni. Nový rekord.";
      await cakaj(1800);
      leto.classList.add("prec");
      await cakaj(500);
      leto.hidden = true;
      await vytlac([...document.querySelectorAll("#pas7 .po-lete")], 380);
      await cakaj(600);
      await chvilaTicha({
        pas: $("#pas7"), dokaz: $("#dokaz4"),
        veta: "V lekárni sa stráži každý stupeň. Za jej dverami už nikto.",
        peciatka: "NEMERANÉ", podpis: "výdajný box",
      });
      const volba = await opytaj("Ako by mohla byť preprava liekov bezpečnejšia?", [
        { text: "Lieky do výdajných boxov neposielať a doplniť to do vyhlášky.", odpoved: "Presne tak. Rovnaký liek, rovnaké pravidlá:" },
        { text: "Zakázať predaj liekov cez internet.", odpoved: "Predaj liekov bez predpisu na diaľku štát zakázať nemôže. Upraviť môže prepravu:" },
        { text: "Nechať to na zákazníkovi, nech si box vyberie hneď.", odpoved: "Liek však v boxe môže čakať aj dva dni a teplotu nemeria nikto. Preto:" },
      ]);
      napisOdozvu($("#odozva4"), volba);
      $("#pas7").classList.add("odtrhnuta");
      tlac(0.32);
      await cakaj(450);
      const nova = $("#pas8");
      nova.hidden = false;
      $("#stol4").classList.add("druha");
      window.scrollTo({ top: 0, behavior: pokojne ? "auto" : "smooth" });
      await cakaj(700);
      await vytlac([...nova.querySelectorAll(".r")], 300);
    }
    btn.addEventListener("pointerdown", (e) => { btn.setPointerCapture(e.pointerId); zacni(e); });
    btn.addEventListener("pointerup", pusti);
    btn.addEventListener("pointercancel", pusti);
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    btn.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) zacni(e); });
    btn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") pusti(); });
    kresli();
  }
  /* ---------- záver: váš recept (generatívny plagát 1080×1350) ---------- */
  $("#na-recept").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await dalsiZakaznik($("#stol4"), $("#stol5"));
    try { await document.fonts.load("700 60px Caveat"); } catch (_) { /* záložné písmo */ }
    kresliPlagat();
    await vytlac([...document.querySelectorAll("#pas9 .r")], 320);
  });
  $("#stiahni").addEventListener("click", () => {
    $("#plagat").toBlob((b) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "ste-na-rade-vas-recept.png";
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  });
  $("#znova").addEventListener("click", () => location.reload());

  function kresliPlagat() {
    const cv = $("#plagat"), g = cv.getContext("2d"), W = 1080, H = 1350;
    // náhodnosť odvodená zo záznamu: rovnaká hra = rovnaký obrázok
    let sem = 7 + zaznam.peciatky.reduce((s, p) => s + Math.round((p.rot + 20) * 97 + p.x * 1000 + p.y * 1000), 0)
              + zaznam.mince.reduce((s, c) => s * 3 + c, 0) + zaznam.pustil * 131 + zaznam.pruhKliky * 17;
    const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
    const PAPIER = "#f4f1ea", TLAC = "#1b1a18", TLMENE = "#8a857b", PERO = "#1f3d9e",
          PEC = "#5b3a9a", CERV = "#c8322a", TEPLO = "#e08a3c";
    const MONO = 'ui-monospace, "Cascadia Mono", Consolas, monospace', RUKA = "Caveat, cursive";

    // papier so zrnom
    g.fillStyle = PAPIER; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(60,55,48,${rnd() * 0.07})`;
      g.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
    }

    // hlavička receptu
    g.fillStyle = TLAC; g.font = `700 26px ${MONO}`; g.textBaseline = "alphabetic";
    g.fillText("V Á Š   R E C E P T", 80, 104);
    g.fillStyle = TLMENE; g.font = `20px ${MONO}`;
    g.fillText("Ste na rade · lieková politika z prvej línie", 80, 140);
    g.fillStyle = PERO; g.font = `700 120px ${RUKA}`;
    g.save(); g.translate(860, 150); g.rotate(-0.08); g.fillText("Rp.", 0, 0); g.restore();
    g.strokeStyle = TLAC; g.lineWidth = 2; g.setLineDash([6, 6]);
    g.beginPath(); g.moveTo(80, 180); g.lineTo(W - 80, 180); g.stroke(); g.setLineDash([]);

    // --- umelecká plocha 80..1000 × 210..770 ---
    const X0 = 80, Y0 = 210, AW = W - 160, AH = 560;
    // 2 510 bodiek (1 992 plných) ako tichý podklad
    const st = 50, kr = AW / st;
    for (let i = 0; i < 2510; i++) {
      const x = X0 + (i % st) * kr + kr / 2, y = Y0 + 40 + Math.floor(i / st) * kr * 0.95;
      if (y > Y0 + AH) break;
      g.beginPath(); g.arc(x, y, kr * 0.28, 0, Math.PI * 2);
      if (i < 1992) { g.fillStyle = "rgba(27,26,24,.10)"; g.fill(); }
      else { g.strokeStyle = "rgba(27,26,24,.16)"; g.lineWidth = 1.2; g.stroke(); }
    }
    // teplomer: výška = 42,2 °C, zlomy = koľkokrát návštevník pustil
    const tx = X0 + AW * (0.08 + rnd() * 0.06), tb = Y0 + AH - 30, tv = (AH - 90) * (42.2 / 45);
    g.lineCap = "round"; g.strokeStyle = TEPLO; g.lineWidth = 22;
    const zlomy = Math.min(zaznam.pustil, 6);
    const usek = tv / (zlomy + 1);
    for (let k = 0; k <= zlomy; k++) {
      g.beginPath(); g.moveTo(tx, tb - k * usek - (k ? 10 : 0)); g.lineTo(tx, tb - (k + 1) * usek + 10); g.stroke();
    }
    g.fillStyle = TEPLO; g.beginPath(); g.arc(tx, tb + 18, 26, 0, Math.PI * 2); g.fill();
    g.strokeStyle = PERO; g.lineWidth = 3; g.setLineDash([10, 8]);
    const y25 = tb - (AH - 90) * (25 / 45);
    g.beginPath(); g.moveTo(tx - 50, y25); g.lineTo(tx + 50, y25); g.stroke(); g.setLineDash([]);
    g.fillStyle = PERO; g.font = `30px ${RUKA}`; g.fillText("25 °C", tx + 58, y25 + 9);

    // mince, ktorými sa platilo (oblúk)
    const mince = zaznam.mince.length ? zaznam.mince : [1, 2, 2];
    mince.forEach((c, k) => {
      const uh = Math.PI * (1.1 + (k / Math.max(1, mince.length - 1 || 1)) * 0.8);
      const r = 18 + (c === 10 ? 20 : c * 3);
      const cx = X0 + AW * 0.62 + Math.cos(uh) * 150, cy = Y0 + AH * 0.86 + Math.sin(uh) * 120;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = c === 10 ? "rgba(201,160,67,.85)" : "rgba(184,105,58,.85)"; g.fill();
      g.strokeStyle = "rgba(60,30,10,.5)"; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#3b2210"; g.font = `700 ${Math.round(r * 0.8)}px ${MONO}`; g.textAlign = "center";
      g.fillText(String(c), cx, cy + r * 0.28); g.textAlign = "start";
    });

    // čierny pruh (začiernená zľava); hrúbka podľa počtu pokusov
    const by = Y0 + 70 + rnd() * 120, bh = 22 + Math.min(zaznam.pruhKliky, 5) * 6;
    g.fillStyle = "#0b0b0b"; g.fillRect(X0 + AW * 0.42, by, AW * 0.5, bh);

    // pečiatky presne tak, ako ich návštevník položil
    const pec = zaznam.peciatky.length ? zaznam.peciatky
      : ["NEVIDNO", "NESEDÍ", "TAJNÉ", "NEMERANÉ"].map((t2) => ({ text: t2, podpis: "", rot: -8, x: rnd(), y: rnd() }));
    const sloty = [[0.36, 0.30], [0.80, 0.42], [0.42, 0.66], [0.80, 0.80]];
    pec.forEach((p, k) => {
      const [sx, sy] = sloty[k % 4];
      const cx = X0 + AW * (sx + (p.x - 0.5) * 0.18), cy = Y0 + AH * (sy + (p.y - 0.5) * 0.14);
      g.save(); g.translate(cx, cy); g.rotate((p.rot * Math.PI) / 180);
      g.font = `900 54px ${MONO}`; const sirka = g.measureText(p.text).width + 60;
      g.globalAlpha = 0.85; g.strokeStyle = PEC; g.fillStyle = PEC;
      g.lineWidth = 5; g.strokeRect(-sirka / 2, -46, sirka, 92);
      g.lineWidth = 2; g.strokeRect(-sirka / 2 + 9, -37, sirka - 18, 74);
      g.textAlign = "center"; g.fillText(p.text, 0, 8);
      g.font = `700 16px ${MONO}`; g.fillText((p.podpis || "").toUpperCase(), 0, 30);
      // opotrebovaný atrament
      g.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 260; i++) { g.globalAlpha = rnd() * 0.5; g.fillRect(-sirka / 2 + rnd() * sirka, -46 + rnd() * 92, 2 + rnd() * 3, 2 + rnd() * 3); }
      g.restore();
      // destination-out vyrezal aj papier: vrátiť pod pečiatku papier (multiply efekt)
    });
    // doplniť papier za vyrezané body
    g.save(); g.globalCompositeOperation = "destination-over"; g.fillStyle = PAPIER; g.fillRect(0, 0, W, H); g.restore();

    // --- predpis: štyri návrhy ---
    const navrhy = [
      "Účtenka: hodnota liekov · úhrada poisťovne · doplatok",
      "Doplatky po 5 centoch, pod 0,10 € nula",
      "Ceny liekov vyjednávať spoločne za celú EÚ",
      "Lieky do výdajných boxov neposielať",
    ];
    g.strokeStyle = TLAC; g.lineWidth = 2; g.setLineDash([3, 6]);
    g.beginPath(); g.moveTo(80, 800); g.lineTo(W - 80, 800); g.stroke(); g.setLineDash([]);
    let zhody = 0;
    navrhy.forEach((n, k) => {
      const y = 868 + k * 78;
      const l = zaznam.listky[k], zhoda = l && l.i === 0;
      if (zhoda) zhody++;
      g.fillStyle = TLAC; g.font = `700 24px ${MONO}`; g.fillText("Rp.", 80, y);
      let px = 26; g.font = `${px}px ${MONO}`;
      while (g.measureText(n).width > W - 150 - 190 && px > 16) g.font = `${--px}px ${MONO}`;
      g.fillStyle = TLAC; g.fillText(n, 150, y);
      g.fillStyle = l ? PERO : TLMENE; g.font = `700 52px ${RUKA}`;
      g.fillText(!l ? "–" : zhoda ? "✓" : "?", W - 130, y + 6);
    });
    // podpis perom
    g.fillStyle = PERO; g.font = `700 50px ${RUKA}`;
    g.save(); g.translate(80, 1230); g.rotate(-0.025);
    g.fillText(zaznam.listky.length ? `Zhodli ste sa v ${zhody} zo ${navrhy.length}.` : "Ste na rade.", 0, 0);
    g.restore();
    g.fillStyle = CERV; g.font = `700 22px ${MONO}`; g.fillText("NÁVRHY PODĽA PRÍSPEVKOV Č. 10, 1, 12 A 13", 80, 1290);
    g.fillStyle = TLMENE; g.font = `20px ${MONO}`;
    const dnes = new Date();
    g.fillText(`x.com/jurzon · ${dnes.getDate()}. ${dnes.getMonth() + 1}. ${dnes.getFullYear()}`, 80, 1322);
  }
})();
