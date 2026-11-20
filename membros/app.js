/* Área de membros VESPRO: lógica da página.
   Textos em textos.js, coleções/ofertas/preços em config.js. */
(function () {
  "use strict";
  var C = window.MEMBROS, T = window.TEXTOS, A = "/assets/";
  var qs = new URLSearchParams(location.search);
  var DEMO = !!C.modoDemo || qs.get("demo") === "1";
  var CHAVE_EMAIL = "vespro_email_" + C.pais; // e-mail lembrado neste aparelho
  var LOCAL = /^(localhost|127\.|\[::1\])/.test(location.hostname);
  var app = document.getElementById("app");

  /* ---------- utilidades ---------- */
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }
  function semHtml(s) { return String(s).replace(/<[^>]+>/g, ""); }

  var st = {
    lang: detectarIdioma(),
    email: "", erro: "", ocupado: false,
    dados: null,
    perfil: ler("vespro_demo_perfil") || "completa"
  };
  function L() { return T[st.lang] || T.pt; }
  function t(k, v) { var x = L()[k]; if (x == null) x = T.pt[k]; return v ? fill(x, v) : x; }

  // idiomas que esta área oferece (config "idiomas"); com um só, não aparece a troca no topo
  function idiomas() { return (C.idiomas || Object.keys(T)).filter(function (l) { return T[l]; }); }
  function detectarIdioma() {
    var ok = idiomas();
    var q = (qs.get("lang") || "").slice(0, 2).toLowerCase();
    if (ok.indexOf(q) >= 0) return q;
    var s = ler("vespro_lang"); if (s && ok.indexOf(s) >= 0) return s;
    return ok.indexOf(C.idiomaPadrao) >= 0 ? C.idiomaPadrao : (ok[0] || "pt"); // cada país abre no seu idioma
  }
  function trocarIdioma(l) {
    if (idiomas().indexOf(l) < 0) return;
    st.lang = l; gravar("vespro_lang", l);
    render();
  }

  /* ---------- dinheiro ---------- */
  function loja() { return C.loja; }
  function num(s, lj) { if (s === "" || s == null) return NaN; s = String(s); lj = lj || loja(); return lj.decimal === "," ? parseFloat(s.replace(/\./g, "").replace(",", ".")) : parseFloat(s); }
  function fmt(n, lj) {
    lj = lj || loja();
    var v = lj.decimal === "," ? n.toFixed(2).replace(".", ",") : (Math.round(n) === n && lj.moeda === "R" ? String(n) : n.toFixed(2));
    return lj.moeda === "R" ? "R" + v : lj.moeda + " " + v;
  }

  /* ---------- posse das coleções ---------- */
  function tem(id) { var d = st.dados; if (!d) return false; return d.acervo || Object.prototype.hasOwnProperty.call(d.colecoes, id); }
  function visivelComoMinha(id) { var c = C.colecoes[id]; return tem(id) && !(c.dentroDe && tem(c.dentroDe)); }
  function ids(universo) {
    return Object.keys(C.colecoes).filter(function (id) { return C.colecoes[id].universo === universo; })
      .sort(function (a, b) { return C.colecoes[a].ordem - C.colecoes[b].ordem; });
  }
  function progresso() {
    var slots = [["signature", "essencial"], ["shadows"], ["sporting"], ["exclusivas"], ["movies"]];
    var n = slots.filter(function (s) { return s.some(tem); }).length;
    return { n: n, t: slots.length };
  }

  /* ---------- estratégia de upsell ----------
     1 oferta principal por área, escolhida pelo que a pessoa já tem (escada de valor).
     Depois dela, o Acervo Completo com o que a pessoa já pagou virando desconto. */
  function ofertaPrincipal(u) {
    if (st.dados.acervo) return null;
    if (u === "wallpapers") {
      if (tem("essencial") && !tem("signature")) return "upgrade_signature";
      var sh = tem("shadows"), sp = tem("sporting");
      if (!sh && !sp) return "shadows_sporting";
      if (!sh) return "shadows";
      if (!sp) return "sporting";
      return "acervo";
    }
    if (!tem("movies")) return "movies";
    if (!tem("signature") && !tem("essencial")) return "signature";
    return "acervo";
  }
  function ofertaDaColecao(id) {
    if (id === "signature") return tem("essencial") ? "upgrade_signature" : "signature";
    if (id === "exclusivas") return "acervo";
    return id; // shadows, sporting, movies
  }
  function precoOferta(of) {
    var o = (loja().ofertas || {})[of]; if (!o) return null;
    if (of === "acervo" && !o.preco) { // modo crédito: cheio menos o que já pagou
      var cheio = num(o.cheio), minimo = num(o.minimo), pago = st.dados.pago || 0;
      if (isNaN(cheio)) return null;
      var falta = cheio - pago;
      if (loja().final7) falta = Math.floor((falta - 7) / 10) * 10 + 7; // África do Sul: preço sempre terminando em 7
      falta = Math.max(falta, isNaN(minimo) ? 0 : minimo);
      return { por: falta, de: falta < cheio ? cheio : null, pago: pago > 0 && falta < cheio ? pago : 0 };
    }
    var p = num(o.preco); if (isNaN(p)) return null;
    var de = num(o.de);
    return { por: p, de: !isNaN(de) && de > p ? de : null };
  }
  function nomeOferta(of) {
    return { upgrade_signature: "Signature Collection (upgrade)", shadows_sporting: "Shadows + Sporting", shadows: "Shadows Collection", sporting: "Sporting Collection", movies: "VESPRO Movies", signature: "Signature Collection", acervo: semHtml(t("acervo_nome")) }[of] || of;
  }
  function linkOferta(of) {
    var o = (loja().ofertas || {})[of];
    if (o && /^https:\/\//.test(o.link || "")) return o.link;
    var msg = t("whats_msg", { oferta: nomeOferta(of) });
    return "https://wa.me/" + C.suporte.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  function somaQueFalta() {
    var lj = loja(), s = 0, ok = false;
    ["shadows", "sporting", "movies"].forEach(function (id) {
      if (!tem(id)) { var p = precoOferta(id); if (p) { s += p.de || p.por; ok = true; } }
    });
    if (!tem("signature")) { var p = precoOferta(tem("essencial") ? "upgrade_signature" : "signature"); if (p) { s += p.de || p.por; ok = true; } }
    return ok ? s : 0;
  }

  /* ---------- rotas ---------- */
  function rota() {
    var h = location.hash.replace(/^#\/?/, "");
    var m = h.match(/^c\/([a-z_]+)/);
    if (m && C.colecoes[m[1]]) return { u: C.colecoes[m[1]].universo, col: m[1] };
    if (h === "movies") return { u: "movies" };
    return { u: "wallpapers" };
  }

  /* ---------- pedaços de HTML ---------- */
  var ICONES = {
    cadeado: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>',
    celular: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
    todos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="13" height="10" rx="2"/><rect x="17" y="8" width="5" height="11" rx="1"/><path d="M5 19h7"/></svg>',
    pasta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5m-2.5-2.5L12 16l2.5-2.5"/></svg>'
  };
  function idiomasHtml() {
    if (idiomas().length < 2) return "";
    return '<div class="idiomas" role="group" aria-label="' + esc(t("idioma")) + '">' +
      idiomas().map(function (l) {
        return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === st.lang) + '" title="' + esc(T[l].nome) + '">' + T[l].curto + "</button>";
      }).join("") + "</div>";
  }
  function img(src, alt, extra) { return '<img src="' + A + src + '" alt="' + esc(alt || "") + '" loading="lazy" decoding="async"' + (extra || "") + ">"; }

  function cardColecao(id) {
    var c = C.colecoes[id], meu = tem(id);
    var qtd = c.qtd ? '<span class="meta">' + esc(t("wallpapers", { q: c.qtd })) + "</span>" : "";
    var desc = (L().cols || {})[id] || "";
    if (meu) {
      return '<a class="col" href="#/c/' + id + '">' +
        '<div class="img">' + img(c.capa, c.nome) + '<span class="tag ' + (st.dados.acervo ? "vip" : "ok") + '">✓ VESPRO</span></div>' +
        '<div class="corpo"><h3>' + esc(c.nome) + "</h3><p>" + esc(desc) + "</p>" + qtd +
        '<div class="acao"><span class="btn-sec">' + esc(t("abrir")) + " →</span></div></div></a>";
    }
    var of = ofertaDaColecao(id), p = precoOferta(of), acao;
    if (c.so === "acervo") {
      acao = '<a class="btn-sec" href="#acervo" data-acao="ir-acervo">' + esc(t("ver_acervo")) + "</a>";
    } else {
      acao = '<a class="btn" href="' + esc(linkOferta(of)) + '" target="_blank" rel="noopener" data-oferta="' + of + '">' + ICONES.cadeado + " " +
        esc(p ? t("desbloquear", { preco: fmt(p.por) }) : L().ofertas[of].btn) + "</a>";
    }
    var preco = p && c.so !== "acervo" ? '<div class="preco-linha">' + (p.de ? "<s>" + fmt(p.de) + "</s>" : "") + "<b>" + fmt(p.por) + "</b></div>" : "";
    return '<div class="col trancada">' +
      '<a class="img" href="#/c/' + id + '" aria-label="' + esc(c.nome) + '">' + img(c.capa, "") + '<span class="tag">' + esc(c.so === "acervo" ? t("so_acervo") : t("bloqueada")) + '</span><span class="cadeado"><span>' + ICONES.cadeado + "</span></span></a>" +
      '<div class="corpo"><h3>' + esc(c.nome) + "</h3><p>" + esc(desc) + "</p>" + qtd + preco + '<div class="acao">' + acao + "</div></div></div>";
  }

  function imagemOferta(of) {
    var cs = C.colecoes;
    var mos = function (lista) { return '<div class="mosaico">' + lista.map(function (s) { return img(s, ""); }).join("") + "</div>"; };
    switch (of) {
      case "upgrade_signature": return mos(cs.signature.artes.slice(4, 7));
      case "shadows_sporting": return mos([cs.shadows.artes[0], cs.sporting.artes[0], cs.shadows.artes[1]]);
      case "acervo": return mos(cs.exclusivas.artes.slice(0, 3));
      case "signature": return img(cs.signature.capa, "");
      default: return img(cs[of].capa, "");
    }
  }

  function cardOferta(of, opts) {
    opts = opts || {};
    var tx = L().ofertas[of], p = precoOferta(of), extra = "";
    if (of === "acervo") {
      if (p && p.pago > 0) extra += '<p class="credito">' + t("credito", { pago: fmt(p.pago), falta: fmt(p.por) }) + "</p>";
      if (p && !p.pago && ((loja().ofertas || {}).acervo || {}).preco) extra += '<p class="exclusivo">✦ ' + esc(t("exclusivo_membros")) + "</p>";
      var soma = somaQueFalta();
      if (p && soma > p.por) extra += '<p class="sec-sub">' + esc(t("economia", { soma: fmt(soma) })) + "</p>";
      var ref = loja().precoColecaoSite;
      if (ref) extra += '<p class="ancora">' + t("ancora", { preco: fmt(num(ref)) }) + "</p>";
    }
    var preco = p ? '<div class="o-preco">' + (p.de ? "<s>" + fmt(p.de) + "</s>" : "") + "<b>" + fmt(p.por) + '</b></div><p class="unico">' + esc(t("unico")) + "</p>" : "";
    return '<section class="oferta"' + (of === "acervo" ? ' id="acervo"' : "") + ">" +
      '<div class="o-img">' + imagemOferta(of) + "</div>" +
      '<div class="o-corpo"><span class="selo">' + esc(opts.selo || t("prox_selo")) + "</span>" +
      "<h3>" + tx.t + "</h3><p>" + esc(tx.d) + "</p>" + extra + preco +
      '<a class="btn" href="' + esc(linkOferta(of)) + '" target="_blank" rel="noopener" data-oferta="' + of + '">' + esc(tx.btn) + "</a>" +
      '<p class="garantia">' + esc(t("garantia")) + "</p></div></section>";
  }

  function vipHtml() {
    return '<div class="vip"><span class="estrela" aria-hidden="true">✦</span><div><b>' + esc(t("vip_titulo")) + "</b><span>" + esc(t("vip_texto")) + "</span></div></div>";
  }
  function proximaHtml() {
    var p = C.proxima; if (!p || !p.ativa || !p.nome) return "";
    return '<div class="ponte" style="cursor:default">' + (p.capa ? img(p.capa, "") : "<span></span>") +
      "<div><b>" + esc(t("proxima_selo")) + ": " + esc(p.nome) + (p.data ? " · " + esc(p.data) : "") + "</b><span>" +
      esc(st.dados.acervo ? t("proxima_vip") : t("proxima_nao_vip")) + "</span></div></div>";
  }
  function ponte(paraMovies) {
    var c = paraMovies ? C.colecoes.movies : C.colecoes.signature;
    var of = paraMovies ? "movies" : "signature", tx = L().ofertas[of];
    return '<a class="ponte" href="' + (paraMovies ? "#/movies" : "#/") + '">' + img(c.capa, "") +
      "<div><b>" + semHtml(tx.t) + "</b><span>" + esc(tx.d) + "</span></div></a>";
  }

  /* ---------- telas ---------- */
  function telaLogin() {
    var demo = "";
    if (DEMO) {
      var pf = L().demo_perfis;
      demo = '<p class="demo-aviso">' + esc(t("demo_aviso")) + "</p>" +
        '<label for="perfil">' + esc(t("demo_perfil")) + '</label><select id="perfil">' +
        Object.keys(C.demo).map(function (k) { return '<option value="' + k + '"' + (k === st.perfil ? " selected" : "") + ">" + esc(pf[k] || k) + "</option>"; }).join("") + "</select>";
    }
    var form = '<form class="form" data-form="email" novalidate>' + demo +
      '<label for="email">' + esc(t("email_label")) + "</label>" +
      '<input id="email" type="email" inputmode="email" autocomplete="email" required placeholder="' + esc(t("email_ph")) + '" value="' + esc(st.email) + '">' +
      '<button class="btn" type="submit"' + (st.ocupado ? " disabled" : "") + ">" + esc(st.ocupado ? t("entrando") : t("entrar")) + "</button>" +
      (st.erro ? '<p class="erro">' + st.erro + "</p>" : "") + "</form>";
    return '<div class="login">' + idiomasHtml() + '<div class="login-box">' +
      '<img class="logo" src="' + A + 'logo/vespro-logo-240.webp" alt="VESPRO" width="240" height="212">' +
      '<span class="eyebrow">' + esc(t("area")) + "</span>" +
      "<h1>" + t("login_titulo") + '</h1><p class="sub">' + esc(t("login_sub")) + "</p>" + form +
      '<p class="rodape">' + esc(t("ajuda")) + ' <a href="mailto:' + esc(C.suporte.email) + '">' + esc(C.suporte.email) + "</a></p></div></div>";
  }

  function topo(r) {
    var movTem = tem("movies");
    return '<header class="topo"><div class="wrap" style="position:relative"><div class="topo-linha">' +
      '<img class="logo" src="' + A + 'logo/vespro-logo-240.webp" alt="VESPRO" width="240" height="212">' +
      '<div class="marca">VESPRO<small>' + esc(t("area")) + "</small></div>" +
      '<div class="dir">' + idiomasHtml() + '<button class="sair" type="button" data-acao="sair">' + esc(t("sair")) + "</button></div></div>" +
      '<nav class="abas" aria-label="VESPRO">' +
      '<a href="#/"' + (r.u === "wallpapers" ? ' aria-current="page"' : "") + ">" + esc(t("tab_wallpapers")) + "</a>" +
      '<a href="#/movies"' + (r.u === "movies" ? ' aria-current="page"' : "") + ">" + esc(t("tab_movies")) + (movTem ? "" : ' <span class="cad">' + ICONES.cadeado + "</span>") + "</a>" +
      "</nav></div></header>";
  }

  function rodape() {
    return "<footer><p>" + esc(t("ajuda")) + ' <a href="mailto:' + esc(C.suporte.email) + '">' + esc(C.suporte.email) + "</a> · " +
      '<a href="https://wa.me/' + C.suporte.whatsapp + '" target="_blank" rel="noopener">' + esc(t("whats")) + "</a></p><p>" + esc(t("rodape")) + "</p></footer>";
  }

  function telaWallpapers() {
    var lista = ids("wallpapers"), pr = progresso();
    var minhas = lista.filter(visivelComoMinha);
    var trancadas = lista.filter(function (id) { return !tem(id) && id !== "essencial"; });
    var of = ofertaPrincipal("wallpapers");
    var h = '<section class="ola"><h1>' + t("ola") + '</h1><p class="email">' + esc(st.email) + "</p>" +
      '<div class="progresso"><p>' + esc(pr.n >= pr.t ? t("progresso_tudo") : t("progresso", { n: pr.n, t: pr.t })) + '</p><div class="barra"><i style="width:' + Math.round(pr.n / pr.t * 100) + '%"></i></div></div></section>';
    if (st.dados.acervo) h += vipHtml();
    if (of && of !== "acervo") h += cardOferta(of);
    h += '<h2 class="sec">' + esc(t("minhas")) + "</h2>";
    h += minhas.length ? '<div class="grade">' + minhas.map(cardColecao).join("") + "</div>" : '<p class="vazio">' + esc(t("minhas_vazio")) + "</p>";
    if (trancadas.length) {
      h += '<h2 class="sec">' + t("complete") + '</h2><p class="sec-sub">' + esc(t("complete_sub")) + "</p>";
      h += '<div class="grade">' + trancadas.map(cardColecao).join("") + "</div>";
    }
    if (!st.dados.acervo) h += cardOferta("acervo", { selo: of === "acervo" ? t("prox_selo") : t("vip_selo") });
    h += proximaHtml();
    if (!tem("movies")) h += ponte(true);
    return h;
  }

  function telaMovies() {
    var c = C.colecoes.movies, h;
    if (!tem("movies")) {
      h = '<section class="cine">' + img(c.capa, c.nome) + '<div class="txt"><span class="eyebrow">VESPRO Movies™</span><h1>' + t("movies_trancado_t") + "</h1><p>" + esc(t("movies_trancado_d")) + "</p></div></section>";
      h += cardOferta("movies");
      h += '<h2 class="sec">' + esc(t("previa")) + '</h2><p class="sec-sub">' + esc(t("previa_trancada")) + "</p>";
      h += '<div class="galeria trancada">' + c.artes.slice(0, 8).map(function (s) { return img(s, ""); }).join("") + "</div>";
      if (!tem("signature") && !tem("essencial")) h += ponte(false);
      return h;
    }
    h = '<section class="cine">' + img(c.capa, c.nome) + '<div class="txt"><span class="eyebrow">VESPRO Movies™</span><h1>' + t("ola_movies") + "</h1><p>" + esc(st.email) + "</p></div></section>";
    if (st.dados.acervo) h += vipHtml();
    h += '<h2 class="sec">' + esc(t("minhas")) + '</h2><div class="grade">' + ids("movies").filter(visivelComoMinha).map(cardColecao).join("") + "</div>";
    var of = ofertaPrincipal("movies");
    if (of) h += cardOferta(of);
    if (of === "signature") h += cardOferta("acervo", { selo: t("vip_selo") });
    h += proximaHtml();
    return h;
  }

  function telaColecao(id) {
    var c = C.colecoes[id], meu = tem(id), desc = (L().cols || {})[id] || "";
    var volta = c.universo === "movies" ? "#/movies" : "#/";
    var h = '<a class="voltar" href="' + volta + '">← ' + esc(t("voltar")) + "</a>" +
      '<section class="c-hero">' + img(c.capa, c.nome) + '<div class="txt"><span class="selo">' + esc(meu ? "✓ VESPRO" : (c.so === "acervo" ? t("so_acervo") : t("bloqueada"))) + "</span>" +
      "<h1>" + esc(c.nome) + "</h1><p>" + esc(desc) + (c.qtd ? " · " + esc(t("wallpapers", { q: c.qtd })) : "") + "</p></div></section>";
    if (meu) {
      var links = (st.dados.colecoes[id]) || {};
      h += '<h2 class="sec">' + t("baixar_titulo") + '</h2><div class="downloads">' + c.downloads.map(function (k) {
        var d = L().dl[k], href = links[k] || "";
        return '<a class="dl" href="' + esc(href || "#") + '" target="_blank" rel="noopener" data-dl="' + (href ? (href === "#demo" ? "demo" : "ok") : "falta") + '" data-col="' + id + '">' +
          '<span class="ic">' + ICONES[k] + "</span><span><b>" + esc(d.t) + "</b><small>" + esc(d.d) + '</small></span><span class="seta">↗</span></a>';
      }).join("") + "</div>";
      h += '<h2 class="sec">' + esc(t("como_titulo")) + '</h2><div class="como">' + L().como.map(function (x) { return "<div><b>" + esc(x.t) + "</b><span>" + esc(x.p) + "</span></div>"; }).join("") + "</div>";
      h += '<h2 class="sec">' + esc(t("previa")) + '</h2><div class="galeria">' + c.artes.map(function (s) { return img(s, ""); }).join("") + "</div>";
      var of = ofertaPrincipal(c.universo);
      if (of) h += cardOferta(of);
    } else {
      h += cardOferta(ofertaDaColecao(id));
      h += '<h2 class="sec">' + esc(t("previa")) + '</h2><p class="sec-sub">' + esc(t("previa_trancada")) + '</p><div class="galeria trancada">' + c.artes.map(function (s) { return img(s, ""); }).join("") + "</div>";
    }
    return h;
  }

  function telaDemoBar() {
    if (!DEMO) return "";
    var pf = L().demo_perfis;
    return '<div class="demo-bar"><span>DEMO</span><select data-acao="perfil" aria-label="' + esc(t("demo_perfil")) + '">' +
      Object.keys(C.demo).map(function (k) { return '<option value="' + k + '"' + (k === st.perfil ? " selected" : "") + ">" + esc(pf[k] || k) + "</option>"; }).join("") + "</select></div>";
  }

  var ultimaRota = "";
  function render() {
    var l = L();
    document.documentElement.lang = l.lang;
    document.title = l.titulo_pag;
    if (!st.dados) { document.body.className = ""; app.innerHTML = telaLogin(); focoLogin(); return; }
    var r = rota();
    document.body.className = r.u === "movies" ? "u-movies" : "";
    var corpo = r.col ? telaColecao(r.col) : r.u === "movies" ? telaMovies() : telaWallpapers();
    app.innerHTML = topo(r) + '<main class="wrap">' + corpo + "</main>" + rodape() + telaDemoBar();
    var chave = location.hash;
    if (chave !== ultimaRota) { window.scrollTo(0, 0); ultimaRota = chave; }
  }
  function focoLogin() {
    var el = document.getElementById("email");
    if (el && !("ontouchstart" in window)) el.focus();
  }
  function aviso(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg; el.hidden = false;
    clearTimeout(aviso.t); aviso.t = setTimeout(function () { el.hidden = true; }, 3800);
  }

  /* ---------- dados: demonstração ---------- */
  function dadosDemo() {
    var p = C.demo[st.perfil] || C.demo.completa;
    var acervo = p.colecoes.indexOf("acervo") >= 0, cols = {};
    Object.keys(C.colecoes).forEach(function (id) {
      if (acervo || p.colecoes.indexOf(id) >= 0) {
        var l = {}; C.colecoes[id].downloads.forEach(function (k) { l[k] = "#demo"; }); cols[id] = l;
      }
    });
    return { acervo: acervo, colecoes: cols, pago: num(p.pagou), loja: C.pais };
  }

  /* ---------- entrada só com e-mail ----------
     A página manda o e-mail para a nossa função (api/membros-entrar), que confere
     no banco o que essa pessoa comprou NESTE país e devolve as coleções e os links. */
  function entrar(email, silencioso) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { st.erro = esc(t("erro_email")); render(); return; }
    st.email = email; st.erro = "";
    if (DEMO) {
      gravar(CHAVE_EMAIL, email); gravar("vespro_demo_perfil", st.perfil);
      st.dados = dadosDemo(); render(); return;
    }
    st.ocupado = true;
    if (silencioso) app.innerHTML = '<div class="carregando">' + esc(t("carregando")) + "</div>"; else render();
    fetch(C.api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, pais: C.pais }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, d: d }; }); })
      .then(function (x) {
        st.ocupado = false;
        if (x.status === 200) {
          var d = x.d || {};
          st.dados = { acervo: !!d.acervo, colecoes: d.colecoes || {}, pago: Number(d.pago) || 0, loja: C.pais };
          gravar(CHAVE_EMAIL, email);
          rastrear("MembrosEntrou");
          render(); return;
        }
        gravar(CHAVE_EMAIL, null);
        if (x.status === 404) st.erro = esc(t("erro_nao_achou")) + ' <a href="https://wa.me/' + C.suporte.whatsapp + '" target="_blank" rel="noopener">' + esc(t("whats")) + "</a>";
        else if (x.status === 429) st.erro = esc(t("erro_muitas"));
        else st.erro = esc(t("erro_carregar"));
        render();
      })
      .catch(function () { st.ocupado = false; st.erro = esc(t("erro_carregar")); render(); });
  }
  function sair() {
    st.dados = null; st.erro = "";
    gravar(CHAVE_EMAIL, null);
    location.hash = "";
    render();
  }

  /* ---------- medição (Pixel e Clarity) ---------- */
  function rastrear(ev, dados) {
    if (window.fbq) fbq("trackCustom", ev, dados || {});
    if (window.clarity) clarity("event", ev);
  }
  (function () {
    if (LOCAL || DEMO) return;
    var id = (C.metaPixelId || "").trim();
    if (id) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", id); fbq("track", "PageView");
    }
    var c = (C.clarityId || "").trim();
    if (c) (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, "clarity", "script", c);
  })();

  /* ---------- eventos ---------- */
  app.addEventListener("submit", function (e) {
    var f = e.target.getAttribute("data-form"); if (!f) return;
    e.preventDefault();
    if (f === "email" && !st.ocupado) entrar(document.getElementById("email").value.trim().toLowerCase());
  });
  app.addEventListener("change", function (e) {
    if (e.target.id === "perfil") { st.perfil = e.target.value; return; }
    if (e.target.getAttribute("data-acao") === "perfil") {
      st.perfil = e.target.value; gravar("vespro_demo_perfil", st.perfil);
      st.dados = dadosDemo(); render();
    }
  });
  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-lang],[data-acao],[data-oferta],[data-dl]"); if (!el) return;
    if (el.hasAttribute("data-lang")) { trocarIdioma(el.getAttribute("data-lang")); return; }
    var acao = el.getAttribute("data-acao");
    if (acao === "sair") { sair(); return; }
    if (acao === "ir-acervo") {
      e.preventDefault();
      var alvo = document.getElementById("acervo");
      if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" }); else location.hash = "#/";
      return;
    }
    if (el.hasAttribute("data-oferta")) {
      var of = el.getAttribute("data-oferta"), p = precoOferta(of);
      rastrear("MembrosCliqueOferta", { content_name: nomeOferta(of), value: p ? p.por : 0, currency: loja().codigoMoeda || "BRL" });
      if (DEMO) { e.preventDefault(); aviso("DEMO: " + nomeOferta(of) + (p ? " · " + fmt(p.por) : "") + " → " + linkOferta(of).slice(0, 60) + "..."); }
      return;
    }
    if (el.hasAttribute("data-dl")) {
      var s = el.getAttribute("data-dl");
      if (s === "demo") { e.preventDefault(); aviso(t("demo_link")); }
      else if (s === "falta") { e.preventDefault(); aviso(t("sem_link")); }
      else rastrear("MembrosDownload", { content_name: el.getAttribute("data-col") });
    }
  });
  window.addEventListener("hashchange", function () { if (st.dados) render(); });

  /* ---------- início: entra direto se o e-mail já foi usado neste aparelho ---------- */
  var lembrado = ler(CHAVE_EMAIL) || (DEMO ? ler("vespro_demo_email") : null);
  if (lembrado) entrar(lembrado, true); else render();
})();
