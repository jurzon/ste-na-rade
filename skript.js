/* „Ste na rade“: úvod, scény č. 010, 001, 012, 013 a záverečný recept.
   Bez knižníc, bez cookies, bez sledovania. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const pokojne = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Záznam hry pre záverečný plagát. Len v pamäti, nikam sa neposiela.
  // listky sú podľa scény (0–3): pri vstupe odkazom na scénu sa predošlé vynechajú.
  const zaznam = { scena: 0, peciatky: [], listky: [], mince: [], pruhKliky: 0, pustil: 0 };

  /* ---------- zvuk (WebAudio, spustí sa až po kliknutí) ---------- */
  let ac = null, zvukZap = true, gesto = false;
  ["pointerdown", "keydown"].forEach((u) => addEventListener(u, () => { gesto = true; }, { capture: true, once: true }));
  const audio = () => {
    ac ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    return ac;
  };
  function zvoncek() {
    if (!zvukZap || !gesto) return;
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
    if (!zvukZap || !gesto) return;
    const a = audio(), n = Math.floor(a.sampleRate * dlzka);
    const buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(i / 38));
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = 0.8; g.gain.value = 0.07;
    s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start();
  }
  $("#zvuk").addEventListener("click", (e) => {
    zvukZap = !zvukZap;
    $("#zvuk-text").textContent = zvukZap ? "zvuk zapnutý" : "zvuk vypnutý";
    e.currentTarget.setAttribute("aria-pressed", String(zvukZap));
  });


  /* ---------- mobil: zdroje zbalené, ťuknutím sa rozbalia ---------- */
  if (matchMedia("(max-width: 600px)").matches) {
    document.querySelectorAll(".zdroj").forEach((z) => {
      const d = document.createElement("details"), s = document.createElement("summary");
      s.textContent = "Zdroj";
      d.append(s, document.createElement("br"), z.textContent.replace(/^Zdroj:\s*/, ""));
      z.replaceChildren(d);
    });
  }

  /* ---------- „i“: nenápadné poznámky sa ukážu až na ťuknutie ---------- */
  document.querySelectorAll(".info[aria-controls]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation(); // na doklade by klik inak položil pečiatku
    const pozn = document.getElementById(b.getAttribute("aria-controls")), zobraz = pozn.hidden;
    pozn.hidden = !zobraz;
    b.setAttribute("aria-expanded", String(zobraz));
  }));

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
    if (!zvukZap || !gesto) return;
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
  // regály za sklom: lieky po 1–3 kusoch vedľa seba (ako v lekárni), cenovky na hrane police
  (function naplnRegaly() {
    const farby = ["#2f7fc1", "#d2453b", "#1fa45a", "#e2a33a", "#7a5aa8", "#3aa3a0", "#c9568b", "#5f6b75"];
    let sem = 11; const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
    const vzory = [ // potlač krabičky: pás hore, pás vľavo, pastelová, pás v strede
      (f) => `linear-gradient(${f} 0 24%, #fbfaf6 24%)`,
      (f) => `linear-gradient(90deg, ${f} 0 20%, #fbfaf6 20%)`,
      (f) => `linear-gradient(color-mix(in srgb, ${f} 28%, #fff) 0 78%, ${f} 78%)`,
      (f) => `linear-gradient(#fbfaf6 0 40%, ${f} 40% 62%, #fbfaf6 62%)`,
    ];
    for (let p = 0; p < 3; p++) {
      const pol = document.createElement("div"); pol.className = "polica";
      let x = 4;
      while (x < 1400) { // nadbytok: polica má overflow hidden
        const f = farby[Math.floor(rnd() * farby.length)];
        const flasa = rnd() < 0.18;
        const w = flasa ? 14 + rnd() * 8 : 28 + rnd() * 30;
        const h = flasa ? 38 + rnd() * 24 : 36 + rnd() * 46;
        const bg = flasa ? (rnd() < 0.5 ? "linear-gradient(90deg, #6b4220, #9a6634 45%, #6b4220)" : "#f3f1ec")
                         : vzory[Math.floor(rnd() * vzory.length)](f);
        const kusov = 1 + Math.floor(rnd() * 3);
        const cen = document.createElement("span");
        cen.className = "cenovka" + (rnd() < 0.1 ? " akcia" : "");
        cen.textContent = (1.2 + rnd() * 24).toFixed(2).replace(".", ",");
        cen.style.left = `${x}px`;
        pol.append(cen);
        for (let k = 0; k < kusov; k++) {
          const sk = document.createElement("div");
          sk.className = flasa ? "skatulka flasa" : "skatulka";
          sk.style.width = `${w}px`; sk.style.height = `${h}%`;
          sk.style.setProperty("--f", f); sk.style.background = bg;
          pol.append(sk);
          x += w + 2;
        }
        const m = 5 + rnd() * 6; pol.lastChild.style.marginRight = `${m}px`; x += m;
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
    // poradie scén: tableta → účtenka → 1 cent → box → recept
    $("#stol").hidden = true;
    $("#stol3").hidden = false;
    window.scrollTo(0, 0);
    await cakaj(300);
    await spustScenu3();
  });

  async function spustScenu1() {
    zaznam.scena = 0;
    const pas = $("#pas");
    const pred = [...pas.querySelectorAll(".r")].filter((r) => !r.classList.contains("po-odkryti") && !r.classList.contains("po-hre"));
    await vytlac(pred);
    await new Promise((r) => setTimeout(r, 400)); // počkať na koniec rozbalenia riadku
    pripravHru();
  }

  /* ---------- hra: ktorý liek je drahší? ---------- */
  // Na účtenke vyzerá drahší ten s doplatkom 1,76 €. V skutočnosti stojí 4,73 €
  // a ten „za 0,00 €“ takmer 2 000 €.
  let uhadnute = false;
  function pripravHru() {
    const lieky = [...document.querySelectorAll("#pas .liek")];
    $("#pas").classList.add("hadaj");
    $("#hra").classList.add("aktivna");
    lieky.forEach((b) => {
      b.disabled = false;
      b.addEventListener("click", () => vyberLiek(+b.dataset.liek, lieky));
    });
    // bez automatického zamerania: rámik na prvom lieku by napovedal odpoveď
  }

  async function vyberLiek(i, lieky) {
    if (uhadnute) return;
    uhadnute = true;
    zaznam.hadal = i;
    lieky.forEach((b) => (b.disabled = true));
    lieky[i].classList.add("zvoleny");
    $("#pas").classList.remove("hadaj");
    $("#hra").classList.remove("aktivna");
    await cakaj(500);
    // perom sa dopíše skutočná cena pri každom lieku
    await vytlac([...document.querySelectorAll("#pas .po-hre")], 650);
    await cakaj(500);
    const odp = $("#hra-odpoved");
    odp.textContent = i === 1 ? "Áno. A zaplatili ste zaň 0,00 €."
                              : "Nie. Drahší je ten za 0,00 €.\nStojí vyše 400-krát viac.";
    odp.classList.add("on");
    await cakaj(1600);
    $("#hra").classList.add("hotovo");
    await cakaj(1300);
    await vytlac([...document.querySelectorAll(".po-odkryti")], 420);
    await cakaj(600);
    await chvilaTicha({
      pas: $("#pas"), dokaz: $("#dokaz1"),
      veta: "Na dnešných účtenkách dostáva najväčšie číslo najmenšie písmo. Chyba.",
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
    if (!zvukZap || !gesto) return;
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
    await spustScenu2();
  });
  async function spustScenu2() {
    zaznam.scena = 1;
    await vytlac(tlacRiadkyBez($("#pas3"), "po-minci", "po-platbe", "po-vynimke"));
    const platba = $("#platba");
    platba.hidden = false;
    if (!pokojne) platba.scrollIntoView({ block: "end", behavior: "smooth" });
  }

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
        $("#pokyn").textContent = `Pokladňa chce 0,05 €. Chýba ešte ${chyba} ${chyba === 1 ? "cent" : chyba < 5 ? "centy" : "centov"}.`;
        return;
      }
      zaplatene = true;
      document.querySelectorAll("#platba .mince .minca").forEach((x) => (x.disabled = true));
      $("#pokyn").textContent = "Ďakujeme. Doplatok bol 1 cent.";
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
      peciatka: "NESEDÍ", podpis: "1 944 doplatkov",
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

  // 2 455 liekov s doplatkom: 1 944 plných (nekončí na 0/5 centov), 511 prázdnych
  async function kresliBodky() {
    const SPOLU = 2455, PLNE = 1944, STLPCE = 50;
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
        zaznam.listky[zaznam.scena] = { i, text: moznosti[i].text };
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
    if (!zvukZap || !gesto) return;
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
    await cakaj(2200); // čas pozrieť si doklad, kým okolie stmavne
    document.body.style.overflow = "hidden";
    pas.classList.add("ticho");

    // 2. reflektor: všetko okrem dôkazu potemnie
    const r = dokaz.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const rx = Math.max(110, r.width * 0.9), ry = Math.max(70, r.height * 2.2);
    const ref = $("#reflektor");
    ref.style.background = `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, rgba(0,0,0,0) 50%, rgba(0,0,0,.5) 100%)`; // okolie ostáva čitateľné
    ref.hidden = false; await cakaj(30); ref.classList.add("on");
    await cakaj(1400);

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
    v.textContent = veta.replace(/([.?!]) /g, "$1\n"); // každá veta na novom riadku
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
  /* ---------- 1 cent → box; scéna 3: Tá istá tableta, dve ceny (č. 012), hrá sa hneď po úvode ---------- */
  $("#na-scenu3").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await dalsiZakaznik($("#stol2"), $("#stol4")); // po 1 cente ide box (tableta je na začiatku)
    await spustScenu4();
  });
  async function spustScenu3() {
    zaznam.scena = 2;
    await vytlac(tlacRiadkyBez($("#pas5"), "po-hranici", "po-pruhu")); // hlavička „Praktický reexport“
    const hr = $("#hranica");
    hr.hidden = false;
    if (!pokojne) hr.scrollIntoView({ block: "end", behavior: "smooth" });
    pripravHranicu();
  }

  /* hranica: návštevník vyberie množstvo (tableta, balenie, dodávka) a prevezie ho.
     Ceny bez DPH vrátane prirážok: SK 90 tbl 124,88 € s 5 % DPH, DE 100 tbl 236,43 € s 19 % DPH. */
  const SK_TBL = 124.88 / 1.05 / 90, DE_TBL = 236.43 / 1.19 / 100;
  const eurSk = (v) => `${v.toLocaleString("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  const NAKLADY = {
    tableta: { tbl: 1, co: "tabletu", polozka: "1 tableta", hotovo: "Tá istá tableta. Iná cena.", html: "" },
    balenie: { tbl: 90, co: "balenie", polozka: "1 balenie (90 tbl)", hotovo: "To isté balenie. Iná cena.",
      html: `<svg viewBox="0 0 76 50" aria-hidden="true"><path d="M60 6 L72 1 L72 39 L60 46 Z" fill="#cfd3d8"/><path d="M4 6 L16 1 L72 1 L60 6 Z" fill="#eef0f2"/>
        <rect x="4" y="6" width="56" height="40" fill="#fbfbf8" stroke="#c9ccd1"/><rect x="4" y="6" width="56" height="11" fill="#3a6fb8"/>
        <rect x="4" y="38" width="56" height="3" fill="#e2a33a"/><text x="32" y="31" text-anchor="middle" font-size="8" font-weight="700" fill="#1b1a18" font-family="ui-monospace, monospace">90 tbl</text></svg>` },
    dodavka: { tbl: 9000, co: "dodávku", polozka: "100 balení (9 000 tbl)", hotovo: "Tie isté lieky. Iná cena.",
      html: `<svg viewBox="0 0 124 66" aria-hidden="true"><rect x="2" y="8" width="84" height="42" rx="4" fill="#f3f1ec" stroke="#b9b3a8" stroke-width="1.5"/>
        <path d="M88 20 H108 Q118 22 120 34 V50 H88 Z" fill="#e4e0d8" stroke="#b9b3a8" stroke-width="1.5"/><path d="M93 24 H107 Q113 26 114 34 H93 Z" fill="#9fc3d9"/>
        <g fill="#fbfbf8" stroke="#a9a49a"><rect x="10" y="16" width="20" height="14"/><rect x="34" y="16" width="20" height="14"/><rect x="58" y="16" width="20" height="14"/></g>
        <g fill="#3a6fb8"><rect x="10" y="16" width="20" height="4"/><rect x="34" y="16" width="20" height="4"/><rect x="58" y="16" width="20" height="4"/></g>
        <text x="44" y="44" text-anchor="middle" font-size="9" font-weight="800" fill="#1b1a18" font-family="ui-monospace, monospace">100 × 90 tbl</text>
        <g class="koleso"><circle cx="24" cy="54" r="9" fill="#222"/><circle cx="24" cy="54" r="3.5" fill="#999"/><path d="M24 46 V62 M16 54 H32" stroke="#555" stroke-width="1.5"/></g>
        <g class="koleso"><circle cx="102" cy="54" r="9" fill="#222"/><circle cx="102" cy="54" r="3.5" fill="#999"/><path d="M102 46 V62 M94 54 H110" stroke="#555" stroke-width="1.5"/></g></svg>` },
  };

  // účtenka po prevoze: množstvo a sumy podľa toho, čo návštevník previezol
  function naplnUctenku(n) {
    const sk = SK_TBL * n.tbl, de = DE_TBL * n.tbl;
    $("#tab-polozka").textContent = n.polozka;
    $("#tab-polozka2").textContent = `Jardiance 10 mg · ${n.polozka}`;
    $("#tab-sk").textContent = eurSk(sk);
    $("#tab-de").textContent = eurSk(de);
    $("#tab-roz").textContent = `+${eurSk(de - sk)}`;
    // veľké sumy: menšie písmo v troch veľkých riadkoch, aby sa zmestili
    ["#tab-sk-riadok", "#tab-de-riadok", "#tab-roz-riadok"].forEach((r) => $(r).classList.toggle("dlhe", sk >= 1000));
    $("#tab-otazka").textContent = `ale je ${eurSk(sk)} skutočná cena?`;
  }

  function pripravHranicu() {
    const trat = $("#trat"), nak = $("#naklad"), hr = $("#hranica");
    const OKRAJ = 10;
    let typ = null, x = OKRAJ, prekrocena = false, hotovo = true, posun = 0, uhol = 0, prevezene = "tableta";
    const max = () => trat.clientWidth - nak.offsetWidth - OKRAJ;
    const podiel = () => (x - OKRAJ) / Math.max(1, max() - OKRAJ);
    const tlacidla = [...hr.querySelectorAll(".mnozstvo")];

    function vyber(t) {
      typ = t; hotovo = false; prekrocena = false;
      const n = NAKLADY[t];
      tlacidla.forEach((b) => b.classList.toggle("zvolene", b.dataset.m === t));
      hr.querySelector(".mnozstva").classList.add("vybrane");
      // caka: jemne bliká a naznačí ťahanie
      nak.className = `naklad ${t} caka`; nak.innerHTML = n.html; nak.hidden = false; nak.disabled = false;
      nak.setAttribute("aria-label", `${n.co[0].toUpperCase()}${n.co.slice(1)}. Šípkou doprava ${t === "dodavka" ? "ju pošlete" : "ho posuniete"} do Nemecka.`);
      $("#cena-sk").textContent = eurSk(SK_TBL * n.tbl);
      $("#cena-de").textContent = "?";
      $("#rozdiel").classList.remove("on");
      $("#hranica-dalej").hidden = true;
      hr.classList.remove("za");
      $("#hranica-pokyn").textContent = t === "dodavka" ? "Pošlite dodávku cez hranicu." : `Potiahnite ${n.co} cez hranicu.`;
      uhol = 0;
      nastav(OKRAJ);
    }
    function nastav(nx) {
      const predtym = x;
      x = Math.min(Math.max(nx, OKRAJ), max());
      nak.style.left = `${x}px`;
      if (typ === "dodavka") { // kolesá sa točia podľa prejdenej dráhy
        uhol += (x - predtym) * 4;
        nak.querySelectorAll(".koleso").forEach((k) => (k.style.transform = `rotate(${uhol}deg)`));
      }
      const p = podiel();
      hr.classList.toggle("za", p > 0.5);
      if (p > 0.5 && !prekrocena) { prekrocena = true; cink(); }
      if (p < 0.5) prekrocena = false;
    }
    function nacitaj(el, ciel) { // rozdiel narastie od nuly
      if (pokojne) { el.textContent = `+${eurSk(ciel)}`; return; }
      const t0 = performance.now(), dlzka = 1100;
      const krok = (t) => {
        const q = Math.min(1, (t - t0) / dlzka), e = 1 - (1 - q) ** 3;
        el.textContent = `+${eurSk(ciel * e)}`;
        if (q < 1) requestAnimationFrame(krok);
      };
      requestAnimationFrame(krok);
    }
    async function skonci() {
      if (hotovo || podiel() <= 0.56) return;
      hotovo = true;
      nak.disabled = true;
      nak.classList.remove("caka");
      nastav(max());
      const n = NAKLADY[typ];
      $("#cena-de").textContent = eurSk(DE_TBL * n.tbl);
      $("#rozdiel-popis").textContent = `rozdiel za ${n.tbl === 1 ? "1 tabletu" : n.tbl === 90 ? "1 balenie" : "100 balení"}`;
      $("#rozdiel").classList.add("on");
      nacitaj($("#rozdiel-suma"), (DE_TBL - SK_TBL) * n.tbl);
      $("#hranica-pokyn").textContent = n.hotovo;
      zaznam.prevoz = Math.max(zaznam.prevoz || 0, n.tbl);
      prevezene = typ; // na účtenku ide naposledy prevezené množstvo
      await cakaj(1300);
      $("#hranica-dalej").hidden = false;
      $("#hranica-pokracuj").focus({ preventScroll: true });
      // na mobile tlačidlo vyskočí pod okraj obrazovky: dorolovať k nemu
      const dalej = $("#hranica-dalej").getBoundingClientRect();
      if (dalej.bottom > innerHeight) $("#hranica-dalej").scrollIntoView({ block: "end", behavior: pokojne ? "auto" : "smooth" });
    }
    tlacidla.forEach((b) => b.addEventListener("click", () => vyber(b.dataset.m)));
    nak.addEventListener("pointerdown", (e) => {
      if (hotovo) return;
      nak.classList.remove("caka");
      nak.setPointerCapture(e.pointerId);
      posun = e.clientX - trat.getBoundingClientRect().left - x;
    });
    nak.addEventListener("pointermove", (e) => {
      if (hotovo || !nak.hasPointerCapture(e.pointerId)) return;
      nastav(e.clientX - trat.getBoundingClientRect().left - posun);
      if (podiel() > 0.97) skonci(); // dorazil na koniec: netreba čakať na pustenie
    });
    nak.addEventListener("pointerup", skonci);
    nak.addEventListener("lostpointercapture", skonci);
    nak.addEventListener("keydown", (e) => {
      if (hotovo) return;
      nak.classList.remove("caka");
      if (e.key === "ArrowRight") { e.preventDefault(); nastav(x + max() * 0.12); skonci(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); nastav(x - max() * 0.12); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nastav(max()); skonci(); }
    });
    $("#hranica-pokracuj").addEventListener("click", async (e) => {
      e.currentTarget.disabled = true;
      tlacidla.forEach((b) => (b.disabled = true));
      hr.classList.add("prec");
      await cakaj(500);
      hr.hidden = true;
      naplnUctenku(NAKLADY[prevezene]);
      await vytlac([...document.querySelectorAll("#pas5 .po-hranici")], 300); // účtenka sa dotlačí
      await cakaj(350);
      pripravLos();
    }, { once: true });
  }

  /* žreb: strieborné pole sa zotiera prstom alebo myšou, pod ním je TAJNÉ */
  function pripravLos() {
    const box = $("#los"), cv = $("#los-vrstva"), ctx = cv.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const r = box.getBoundingClientRect(), w = r.width, h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);
    // strieborná vrstva ako na žrebe: kovový prechod, lesk a zrno
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#b9bcc0"); g.addColorStop(0.45, "#e6e8ea"); g.addColorStop(0.55, "#c4c7cb"); g.addColorStop(1, "#9ea2a7");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < w * h / 10; i++) {
      ctx.fillStyle = `rgba(${Math.random() < 0.5 ? "255,255,255" : "60,60,60"},${Math.random() * 0.18})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.fillStyle = "#5d6166"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "700 15px ui-monospace, Consolas, monospace";
    ctx.fillText("ZOTRITE", w / 2, h / 2);
    ctx.globalCompositeOperation = "destination-out";
    box.classList.add("pripraveny");

    let kreslim = false, posl = null, pocet = 0, odkryte = false;
    const bod = (e) => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const podiel = () => { // podiel zotretej plochy (vzorkovanie)
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let pr = 0, vs = 0;
      for (let i = 3; i < d.length; i += 4 * 16) { vs++; if (d[i] < 40) pr++; }
      return pr / vs;
    };
    const tah = (p) => {
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 30;
      ctx.beginPath(); ctx.moveTo((posl || p).x, (posl || p).y); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.fill();
      posl = p;
      if (Math.random() < 0.3) tlac(0.03);
      if (++pocet % 6 === 0 && podiel() > 0.55) odkry();
    };
    cv.addEventListener("pointerdown", (e) => {
      if (odkryte) return;
      kreslim = true; posl = null; zaznam.pruhKliky++; // pokusy sa kreslia na plagát
      cv.setPointerCapture(e.pointerId); tah(bod(e));
    });
    cv.addEventListener("pointermove", (e) => { if (kreslim && !odkryte) tah(bod(e)); });
    const stop = () => { kreslim = false; posl = null; };
    cv.addEventListener("pointerup", stop); cv.addEventListener("pointercancel", stop);
    $("#los-odkryt").addEventListener("click", () => { zaznam.pruhKliky++; odkry(); });

    async function odkry() {
      if (odkryte) return;
      odkryte = true;
      box.classList.add("hotovo");
      $("#los-pokyn").textContent = "skutočná cena je tajná";
      await cakaj(900);
      await vytlac([...document.querySelectorAll("#pas5 .po-pruhu")], 420);
      await cakaj(600);
      await chvilaTicha({
        pas: $("#pas5"), dokaz: box,
        veta: "Tá istá tableta. Tri ceny. Jednu nesmieme poznať.",
        peciatka: "NEPREHĽADNÉ", podpis: "zľava pri obličkách",
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
    }
  }
  /* ---------- po tablete: účtenka (tlačidlo #na-scenu4 je na návrhu tablety) ---------- */
  $("#na-scenu4").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    await dalsiZakaznik($("#stol3"), $("#stol")); // po tablete ide účtenka
    await spustScenu1();
  });
  /* ---------- scéna 4: Liek v boxe (č. 013) ---------- */
  async function spustScenu4() {
    zaznam.scena = 3;
    await vytlac(tlacRiadkyBez($("#pas7"), "po-lete"));
    const leto = $("#leto");
    leto.hidden = false;
    if (!pokojne) leto.scrollIntoView({ block: "end", behavior: "smooth" });
    pripravLeto();
  }

  // Leto 2026 (SHMÚ): 56 dní nad 30 °C v Hurbanove, maximum 42,2 °C 6. 8. 2026.
  // Stúpanie teplomera je ilustrácia; overené sú len koncové čísla.
  function pripravLeto() {
    const leto = $("#leto"), btn = $("#podrzte"), TRVANIE = 6500;
    let t = 0, drzi = false, posl = 0, pustilSkor = false, hotovo = false;
    const ease = (x) => x * x * (3 - 2 * x);
    function kresli() {
      // trend k rekordu 42,2 °C + vlny počasia, ktoré na konci doznejú (ilustrácia)
      const teplota = 18 + (42.2 - 18) * ease(t) + 3.2 * Math.sin(2 * Math.PI * 4.5 * t) * (1 - t);
      leto.style.setProperty("--t", t.toFixed(3));
      btn.style.setProperty("--t", t.toFixed(3));
      $("#rtut").style.height = `calc(${(teplota / 45) * 100}% - 12px)`;
      $("#leto-teplota").textContent = `${teplota.toFixed(1).replace(".", ",")}\u00a0°C`;
      const den = new Date(2026, 5, 1 + Math.round(66 * t)); // 1. jún + 66 dní = 6. august
      $("#leto-den").textContent = String(den.getDate());
      $("#leto-mesiac").textContent = ["jún", "júl", "august"][den.getMonth() - 5];
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
      hotovo = true; drzi = false; zaznam.leto = true;
      btn.disabled = true; btn.classList.remove("drzi");
      cink();
      $("#leto-pokyn").textContent = "6. augusta 2026: 42,2 °C v tieni. Nový rekord.";
      await cakaj(1800);
      leto.classList.add("prec");
      await cakaj(500);
      leto.hidden = true;
      await vytlac([...document.querySelectorAll("#pas7 .po-lete")], 380);
      await cakaj(600);
      await chvilaTicha({
        pas: $("#pas7"), dokaz: $("#dokaz4"),
        veta: "V lekárni sa stráži každý stupeň. V boxe ho nemeria nikto.",
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
  // bez #scény: „od začiatku“ znamená úvod aj po vstupe odkazom na scénu
  $("#znova").addEventListener("click", () => location.replace(location.pathname));

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

    // --- hlavička receptu ---
    g.fillStyle = TLAC; g.font = `700 26px ${MONO}`; g.textBaseline = "alphabetic";
    g.fillText("V Á Š   R E C E P T", 80, 104);
    g.fillStyle = TLMENE; g.font = `20px ${MONO}`;
    g.fillText("Ste na rade · lieková politika z prvej línie", 80, 140);
    g.fillStyle = PERO; g.font = `700 120px ${RUKA}`;
    g.save(); g.translate(860, 150); g.rotate(-0.08); g.fillText("Rp.", 0, 0); g.restore();
    const ciara = (y, d = [6, 6]) => { g.strokeStyle = TLAC; g.lineWidth = 2; g.setLineDash(d);
      g.beginPath(); g.moveTo(80, y); g.lineTo(W - 80, y); g.stroke(); g.setLineDash([]); };
    ciara(180);

    // --- pacient a diagnóza (podľa toho, ako návštevník hral) ---
    const dnes = new Date(), datum = `${dnes.getDate()}. ${dnes.getMonth() + 1}. ${dnes.getFullYear()}`;
    g.fillStyle = TLMENE; g.font = `20px ${MONO}`;
    g.fillText("Pacient:", 80, 228); g.fillText("Dátum:", 640, 228);
    g.fillStyle = TLAC; g.font = `700 24px ${MONO}`;
    g.fillText("A 001", 190, 228); g.fillText(datum, 730, 228);
    g.fillStyle = TLMENE; g.font = `20px ${MONO}`; g.fillText("Dg.:", 80, 290);
    g.fillStyle = PERO; g.font = `700 58px ${RUKA}`;
    g.save(); g.translate(150, 292); g.rotate(-0.02); g.fillText("Curiositas acuta", 0, 0); g.restore();
    g.fillStyle = TLMENE; g.font = `18px ${MONO}`; g.fillText("akútna zvedavosť, prognóza dobrá", 560, 290);
    const centy = (n) => `${n} ${n === 1 ? "cent" : n < 5 ? "centy" : "centov"}`;
    const priznaky = [];
    if (zaznam.prevoz) priznaky.push(zaznam.prevoz >= 9000 ? "sklon k reexportu (ťažký priebeh): cez hranicu celá dodávka"
      : zaznam.prevoz >= 90 ? "sklon k reexportu (ľahký priebeh): cez hranicu celé balenie"
      : "sklon k reexportu (len náznak): cez hranicu jedna tableta");
    if (zaznam.hadal !== undefined) priznaky.push(zaznam.hadal === 1 ? "ostrý zrak na ceny: drahší liek odhalený"
      : "dôvera v účtenky (prechodná): drahší bol ten za 0,00 €");
    if (zaznam.mince.length) {
      const suma = zaznam.mince.reduce((x, c) => x + c, 0);
      priznaky.push(suma > 5 ? `veľkorysosť pri pokladni: +${centy(suma - 5)} navyše`
        : zaznam.mince.length >= 3 ? `zbierka drobných: ${zaznam.mince.length} mince za doplatok 1 cent`
        : "presnosť pri pokladni: 5 centov za doplatok 1 cent");
    }
    if (zaznam.leto) priznaky.push(zaznam.pustil ? `netrpezlivosť v horúčave: pustili ste ${zaznam.pustil}×, liek v boxe ani raz`
      : "odolnosť voči teplu: vydržali ste 42,2 °C, liek v boxe musel tiež");
    if (!priznaky.length) priznaky.push("zatiaľ bez príznakov: hra sa len začala");
    g.font = `21px ${MONO}`;
    priznaky.slice(0, 4).forEach((p, k) => {
      const y = 338 + k * 34;
      g.fillStyle = PERO; g.font = `700 26px ${RUKA}`; g.fillText("~", 92, y + 2);
      g.fillStyle = TLAC; let px = 21; g.font = `${px}px ${MONO}`;
      while (g.measureText(p).width > W - 200 && px > 15) g.font = `${--px}px ${MONO}`;
      g.fillText(p, 120, y);
    });

    // --- umelecká plocha 80..1000 × 490..790 ---
    const X0 = 80, Y0 = 490, AW = W - 160, AH = 300;
    ciara(Y0 - 14, [3, 6]);
    // 2 455 bodiek (1 944 plných) ako tichý podklad
    const st = 60, kr = AW / st;
    for (let i = 0; i < 2455; i++) {
      const x = X0 + (i % st) * kr + kr / 2, y = Y0 + 14 + Math.floor(i / st) * kr * 0.9;
      if (y > Y0 + AH - 6) break;
      g.beginPath(); g.arc(x, y, kr * 0.26, 0, Math.PI * 2);
      if (i < 1944) { g.fillStyle = "rgba(27,26,24,.09)"; g.fill(); }
      else { g.strokeStyle = "rgba(27,26,24,.15)"; g.lineWidth = 1.1; g.stroke(); }
    }
    // teplomer: výška = 42,2 °C, zlomy = koľkokrát návštevník pustil
    const tx = X0 + AW * (0.06 + rnd() * 0.05), tb = Y0 + AH - 34, tv = (AH - 70) * (42.2 / 45);
    g.lineCap = "round"; g.strokeStyle = TEPLO; g.lineWidth = 18;
    const zlomy = Math.min(zaznam.pustil, 6), usek = tv / (zlomy + 1);
    for (let k = 0; k <= zlomy; k++) {
      g.beginPath(); g.moveTo(tx, tb - k * usek - (k ? 8 : 0)); g.lineTo(tx, tb - (k + 1) * usek + 8); g.stroke();
    }
    g.fillStyle = TEPLO; g.beginPath(); g.arc(tx, tb + 14, 21, 0, Math.PI * 2); g.fill();
    g.strokeStyle = PERO; g.lineWidth = 3; g.setLineDash([9, 7]);
    const y25 = tb - (AH - 70) * (25 / 45);
    g.beginPath(); g.moveTo(tx - 40, y25); g.lineTo(tx + 40, y25); g.stroke(); g.setLineDash([]);
    g.fillStyle = PERO; g.font = `26px ${RUKA}`; g.fillText("25 °C", tx + 46, y25 + 8);

    // mince, ktorými sa platilo (oblúk)
    const mince = zaznam.mince.length ? zaznam.mince : [1, 2, 2];
    mince.forEach((c, k) => {
      const uh = Math.PI * (1.1 + (k / Math.max(1, mince.length - 1 || 1)) * 0.8);
      const r = 15 + (c === 10 ? 17 : c * 2.5);
      const cx = X0 + AW * 0.55 + Math.cos(uh) * 70, cy = Y0 + AH * 0.62 + Math.sin(uh) * 40; // v strede medzi pečiatkami
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = c === 10 ? "rgba(201,160,67,.85)" : "rgba(184,105,58,.85)"; g.fill();
      g.strokeStyle = "rgba(60,30,10,.5)"; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#3b2210"; g.font = `700 ${Math.round(r * 0.8)}px ${MONO}`; g.textAlign = "center";
      g.fillText(String(c), cx, cy + r * 0.28); g.textAlign = "start";
    });

    // pečiatky presne tak, ako ich návštevník položil
    const pec = zaznam.peciatky.length ? zaznam.peciatky
      : ["NEPREHĽADNÉ", "NEVIDNO", "NESEDÍ", "NEMERANÉ"].map((t2) => ({ text: t2, podpis: "", rot: -8, x: rnd(), y: rnd() }));
    const sloty = [[0.34, 0.27], [0.76, 0.27], [0.34, 0.78], [0.76, 0.78]]; // štyri rohy plochy
    pec.forEach((p, k) => {
      const [sx, sy] = sloty[k % 4];
      const cx = X0 + AW * (sx + (p.x - 0.5) * 0.08), cy = Y0 + AH * (sy + (p.y - 0.5) * 0.08);
      g.save(); g.translate(cx, cy); g.rotate((p.rot * Math.PI) / 180);
      g.font = `900 44px ${MONO}`; const sirka = g.measureText(p.text).width + 50;
      g.globalAlpha = 0.85; g.strokeStyle = PEC; g.fillStyle = PEC;
      g.lineWidth = 4; g.strokeRect(-sirka / 2, -38, sirka, 76);
      g.lineWidth = 2; g.strokeRect(-sirka / 2 + 8, -30, sirka - 16, 60);
      g.textAlign = "center"; g.fillText(p.text, 0, 7);
      g.font = `700 14px ${MONO}`; g.fillText((p.podpis || "").toUpperCase(), 0, 25);
      g.globalCompositeOperation = "destination-out"; // opotrebovaný atrament
      for (let i = 0; i < 220; i++) { g.globalAlpha = rnd() * 0.5; g.fillRect(-sirka / 2 + rnd() * sirka, -38 + rnd() * 76, 2 + rnd() * 3, 2 + rnd() * 3); }
      g.restore();
    });
    // doplniť papier za body vyrezané z pečiatok
    g.save(); g.globalCompositeOperation = "destination-over"; g.fillStyle = PAPIER; g.fillRect(0, 0, W, H); g.restore();

    // --- predpis: štyri návrhy s dávkovaním (S. = signa) v poradí scén ---
    ciara(AH + Y0 + 14, [3, 6]);
    const predpis = [
      ["Jedna cena lieku pre celú EÚ", "raz, spoločne, za 450 miliónov ľudí"],
      ["Účtenka s hodnotou liekov", "pri každom výdaji, veľkým písmom"],
      ["Doplatky po 5 centoch", "zaokrúhliť raz, už v zozname"],
      ["Záznam teploty pri zásielke", "celé leto, aj vo výdajnom boxe"],
    ];
    predpis.forEach(([co, s], k) => {
      const y = 868 + k * 70;
      g.fillStyle = TLAC; g.font = `700 24px ${MONO}`; g.fillText("Rp.", 80, y);
      g.font = `24px ${MONO}`; g.fillText(co, 150, y);
      g.fillStyle = PERO; g.font = `30px ${RUKA}`; g.fillText(`S. ${s}`, 170, y + 32);
    });

    // --- záver: doplatok, platnosť, podpis a pečiatka lekárne ---
    g.fillStyle = TLAC; g.font = `700 26px ${MONO}`; g.fillText("Doplatok: 0,00 €", 80, 1180);
    g.fillStyle = TLMENE; g.font = `20px ${MONO}`; g.fillText("Platnosť: do zmeny pravidiel.", 80, 1214);
    g.fillStyle = PERO; g.font = `700 46px ${RUKA}`;
    g.save(); g.translate(620, 1206); g.rotate(-0.06); g.fillText("J. Z., lekárnik", 0, 0); g.restore();
    // okrúhla pečiatka lekárne so zeleným krížom
    g.save(); g.translate(930, 1180); g.rotate(-0.15); g.globalAlpha = 0.8;
    g.strokeStyle = PEC; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 64, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 54, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#1fa45a"; g.fillRect(-7, -26, 14, 40); g.fillRect(-20, -13, 40, 14);
    g.fillStyle = PEC; g.font = `700 13px ${MONO}`; g.textAlign = "center";
    g.fillText("STE NA RADE", 0, 34); g.fillText("LEKÁREŇ", 0, -32); g.textAlign = "start";
    g.restore();
    g.fillStyle = CERV; g.font = `700 22px ${MONO}`; g.fillText("NÁVRHY LEKÁRNIKA Z PRVEJ LÍNIE", 80, 1290);
    g.fillStyle = TLMENE; g.font = `20px ${MONO}`;
    g.fillText("jurzon.github.io/ste-na-rade · x.com/jurzon", 80, 1322);
  }

  /* ---------- vstup odkazom na scénu (#cent, #box…): bez úvodu ---------- */
  const SCENY = {
    uctenka: ["#stol", spustScenu1],
    cent: ["#stol2", spustScenu2],
    tableta: ["#stol3", spustScenu3],
    box: ["#stol4", spustScenu4],
  };
  const vstup = SCENY[location.hash.slice(1)];
  if (vstup) {
    $("#uvod").hidden = true;
    document.body.classList.remove("na-uvode");
    $("#pult").hidden = false;
    $("#stol").hidden = true;
    $(vstup[0]).hidden = false;
    vstup[1]();
  }
  addEventListener("hashchange", () => location.reload());
})();
