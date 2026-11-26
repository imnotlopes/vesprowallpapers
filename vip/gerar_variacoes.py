"""Gera as 2 variações de estrutura da página do Acesso VIP a partir de vip/index.html.
   vip/carta/  = carta da marca para quem já conhece (texto corrido, assinatura, P.S.)
   vip/direta/ = curta e comparativa (preço no topo, "hoje x com o VIP")
   Preços, links e prazo vêm do bloco window.VIP do index.html (copiado para cada uma).
   Uso: python vip/gerar_variacoes.py   (rode de novo sempre que mudar o index.html)"""
import os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(AQUI, 'index.html'), encoding='utf-8').read()


def bloco(ini, fim):
    i = src.index(ini)
    j = src.index(fim, i)
    return src[i:j]


head, resto = src.split('<main class="wrap">', 1)
corpo, pe = resto.split('</main>', 1)
oferta = bloco('<!-- 8. OFERTA -->', '<!-- 9. DÚVIDAS -->')
duvidas = bloco('<!-- 9. DÚVIDAS -->', '</main>')
clientes = bloco('<!-- 6. CLIENTES -->', '<!-- 7. COMO FUNCIONA -->')
passos = bloco('<!-- 7. COMO FUNCIONA -->', '<!-- 8. OFERTA -->')
conta = bloco('<!-- 3. A CONTA -->', '<!-- 4. POR QUE VIP -->')

LOGO = '<img class="logo" src="../assets/logo/vespro-logo-240.webp" alt="VESPRO" width="240" height="212">'
PRECO = '''<div class="precobox">
      <div class="off so-promo"><b data-off-num>65%</b><span>OFF</span></div>
      <div class="val">
        <p class="de">de <s>R$ <span data-separado>72,50</span></s> comprando separado</p>
        <p class="preco"><small>R$</small><span data-preco>24,90</span></p>
        <p class="unico">pagamento único · Pix ou cartão</p>
      </div>
    </div>'''
CK = ('<span class="ck" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>')
XX = '<span class="xx" aria-hidden="true">✕</span>'

CSS_EXTRA = '''
/* ===== variações ===== */
.btn.ghost{background:transparent;background-image:none;border:1.5px solid var(--gold);color:var(--gold);max-width:320px;margin:6px auto 0}
.carta{margin-top:30px;background:rgba(10,14,22,.72);border:1px solid var(--line);border-radius:20px;padding:26px 22px 22px}
.carta p{font-size:16.5px;line-height:1.7;color:#e4e7ec;margin:0 0 16px}
.carta p b{color:#fff}
.carta .destaque{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:27px;line-height:1.25;color:var(--gold2);margin:24px 0}
.carta figure{margin:22px -8px}
.carta figure img{border-radius:12px;width:100%;aspect-ratio:16/9;object-fit:cover}
.carta figcaption{font-size:12.5px;color:var(--muted);text-align:center;margin-top:8px}
.carta ul{list-style:none;padding:0;margin:0 0 18px}
.carta li{position:relative;padding:0 0 10px 24px;font-size:16px;line-height:1.55;color:#e4e7ec}
.carta li:before{content:"✦";position:absolute;left:0;color:var(--gold)}
.assina{border-top:1px dashed rgba(255,255,255,.18);padding-top:16px;margin-top:6px;display:flex;align-items:center;gap:14px}
.assina img{width:54px}
.assina b{display:block;font-size:15px}.assina span{font-size:13px;color:var(--muted)}
.carta .ps{font-size:15px;color:#cfd3d8;margin:18px 0 0}
.carta .ps b{color:var(--gold2)}
.comparativo{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.lado{border-radius:16px;padding:16px 14px;border:1px solid var(--line);background:rgba(10,14,22,.62)}
.lado.vip{border:1.5px solid var(--gold);background:linear-gradient(180deg,rgba(217,184,120,.14),rgba(10,14,22,.62))}
.lado h3{margin:0 0 12px;font-size:14px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
.lado.vip h3{color:var(--gold)}
.lado ul{list-style:none;padding:0;margin:0}
.lado li{display:flex;gap:9px;align-items:flex-start;font-size:13.5px;line-height:1.4;padding:6px 0;color:#d6dae0}
.lado li .ck{flex-basis:20px;width:20px;height:20px}
.xx{flex:0 0 20px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#7a828d;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
.mini-grade{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:22px 0 4px}
.mini-grade>div{position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1}
.mini-grade img{width:100%;height:100%;object-fit:cover}
.mini-grade span{position:absolute;left:0;right:0;bottom:0;padding:16px 6px 6px;background:linear-gradient(transparent,rgba(0,0,0,.85));font-size:11.5px;font-weight:700;text-align:center}
.mini-grade span i{display:block;font-style:normal;color:var(--gold);font-weight:800}
.mini-grade .prox{border:2px dashed var(--gold);display:flex;align-items:center;justify-content:center}
.mini-grade .prox span{position:static;background:none;padding:0}
.mini-grade .borra img{filter:blur(4px) brightness(.7)}
.hero.curta{display:block;text-align:center}
.hero.curta .precobox{justify-content:center}
.hero.curta h1{font-size:38px}
@media (min-width:960px){
  .hero.carta-topo,.hero.curta{display:block;text-align:center;max-width:760px;margin:0 auto}
  .hero.carta-topo .logo,.hero.curta .logo{margin:0 auto 14px}
  .hero.carta-topo .lead,.hero.curta .lead{margin:0 auto 6px}
  .carta{max-width:680px;margin-left:auto;margin-right:auto;padding:40px 46px 34px}
  .carta p{font-size:18px}
  .hero.curta h1{font-size:52px}
  .hero.curta .precobox{justify-content:center}
  .hero.curta .btn{margin:0 auto}
  .hero.curta .seguro{text-align:center}
  .comparativo{max-width:760px;margin-left:auto;margin-right:auto;gap:16px}
  .lado{padding:22px}.lado li{font-size:15px}
  .mini-grade{grid-template-columns:repeat(6,1fr)}
}
'''

# ===== blocos novos da carta: coleções com faixas de pinturas, bônus e card de oferta =====
CSS_EXTRA += '''
/* coleções em faixas */
.colecoes{margin-top:64px}
.colecao{margin:0 0 30px}
.colecao-topo{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 4px}
.colecao-topo h3{margin:0;font-size:21px;font-weight:600;letter-spacing:-.3px}
.colecao-topo h3 .serif{font-size:1.1em;color:var(--gold2)}
.colecao-topo span{font-size:13px;font-weight:800;letter-spacing:1px;color:var(--gold);white-space:nowrap}
.colecao>p{font-size:14px;color:var(--muted);margin:0 0 12px}
.faixa{margin:0 -20px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
.faixa-trilho{display:flex;gap:10px;width:max-content;animation:passa var(--dur,40s) linear infinite}
.faixa.volta .faixa-trilho{animation-direction:reverse}
.faixa img{flex:none;height:118px;width:auto;aspect-ratio:16/9;object-fit:cover;border-radius:10px;border:1px solid var(--line)}
.faixa.trancada img{filter:blur(7px) brightness(.62)}
.cadeado{position:relative}
.cadeado .selo-tranca{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;display:flex;align-items:center;gap:10px;background:rgba(8,12,22,.9);border:1.5px solid var(--gold);border-radius:14px;padding:10px 16px;white-space:nowrap}
.selo-tranca svg{width:22px;height:26px}.selo-tranca b{font-size:14px}.selo-tranca small{display:block;font-size:11px;letter-spacing:1px;color:var(--gold);font-weight:700}
.proxima{border:2px dashed rgba(217,184,120,.6);border-radius:16px;padding:18px;text-align:center;background:rgba(217,184,120,.05)}
.proxima b{display:block;font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;font-size:26px;color:var(--gold2)}
.proxima span{font-size:14px;color:#cfd3d8}
@media (prefers-reduced-motion:reduce){.faixa-trilho{animation:none}}
/* bônus */
.bonus{margin-top:64px}
.bonus-grade{display:grid;gap:10px}
.bonus-item{display:flex;gap:14px;align-items:flex-start;background:rgba(10,14,22,.62);border:1px solid rgba(217,184,120,.35);border-radius:16px;padding:16px}
.bonus-item .ic{flex:none;width:44px;height:44px;border-radius:12px;background:rgba(217,184,120,.12);display:flex;align-items:center;justify-content:center;font-size:21px}
.bonus-item .et{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#0b0f15;background:var(--gold);border-radius:999px;padding:3px 9px;margin-bottom:6px}
.bonus-item b{display:block;font-size:16px;margin-bottom:3px}
.bonus-item p{margin:0;font-size:14px;color:#c9ced6;line-height:1.45}
/* card da oferta no modelo da landing principal */
.oferta2{position:relative;margin-top:78px;border-radius:26px;padding:34px 22px 24px;background:rgba(10,14,22,.72);box-shadow:inset 0 0 0 1px rgba(217,184,120,.45),0 30px 70px -30px rgba(0,0,0,.9)}
.oferta2>.selo{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);background:var(--gold);color:#0b0f15;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;border-radius:999px;padding:7px 16px;white-space:nowrap}
.o2-nome{font-size:24px;font-weight:600;letter-spacing:-.3px;margin:0}
.o2-sub{font-size:14.5px;color:var(--muted);margin:4px 0 18px}
.o2-thumbs{display:flex;margin:0 0 16px}
.o2-thumbs img,.o2-thumbs span{width:56px;height:56px;border-radius:13px;object-fit:cover;box-shadow:0 0 0 2px #0a0e16,0 6px 16px -6px rgba(0,0,0,.8)}
.o2-thumbs img+img,.o2-thumbs img+span{margin-left:-12px}
.o2-thumbs span{display:flex;align-items:center;justify-content:center;background:#2a2416;color:var(--gold);font-size:13px;font-weight:800}
.o2-qtd{font-size:15px;font-weight:600;margin:0 0 2px}
.o2-qtd-sub{font-size:14px;color:var(--muted);margin:0 0 16px}
.o2-lista{list-style:none;margin:0;padding:0}
.o2-lista li{display:flex;gap:11px;align-items:flex-start;font-size:14.5px;line-height:1.45;color:#e2e6eb;padding:5px 0}
.o2-lista li b{color:#fff}
.o2-lista .tag-b{font-size:10px;font-weight:800;letter-spacing:1px;color:var(--gold);border:1px solid rgba(217,184,120,.5);border-radius:999px;padding:1px 7px;margin-left:6px;vertical-align:1px;white-space:nowrap}
.o2-dir{text-align:center;border-top:1px solid rgba(255,255,255,.1);margin-top:22px;padding-top:24px}
.o2-label{font-size:12.5px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
.o2-preco-linha{display:flex;flex-direction:column;align-items:center;gap:8px}
.o2-off{display:inline-flex;align-items:center;gap:6px;background:rgba(217,184,120,.14);border:1px solid rgba(217,184,120,.6);color:var(--gold2);border-radius:999px;padding:5px 14px;font-weight:800;font-size:13px;letter-spacing:1.5px;line-height:1}
.o2-off b{font-size:13px;letter-spacing:1.5px}.o2-off span{font-size:13px}
.o2-de{font-size:14px;color:#c3cad6;margin:0}.o2-de s{text-decoration-color:var(--gold)}
.o2-preco{font-size:62px;font-weight:500;letter-spacing:-2px;line-height:1;margin:2px 0 0;white-space:nowrap}
.o2-preco small{font-size:26px;margin-right:6px;vertical-align:.8em}
.o2-conta{font-size:13.5px;color:var(--muted);margin:10px 0 18px}
.oferta2 .relogio{margin:0 0 18px}
.oferta2 .btn{font-size:16px}
.o2-escassez{font-size:13.5px;color:#cfd3d8;margin:14px 0 0;line-height:1.45}
.o2-escassez b{color:var(--gold2);font-weight:700}
@media (min-width:960px){
  .colecoes,.bonus{max-width:900px;margin-left:auto;margin-right:auto;margin-top:96px}
  .faixa{margin:0}.faixa img{height:150px}
  .bonus-grade{grid-template-columns:1fr 1fr}
  .oferta2{max-width:940px;margin:110px auto 0;padding:46px 44px 40px;display:grid;grid-template-columns:1.15fr 1fr;gap:44px;align-items:center}
  .o2-dir{border-top:0;margin-top:0;padding-top:0;border-left:1px solid rgba(255,255,255,.1);padding-left:40px}
}
'''

def faixa(imgs, dur=40, volta=False, trancada=False):
    # repete a lista para o trilho passar sem buraco
    tags = ''.join(f'<img src="../assets/{i}" alt="" loading="lazy" width="400" height="225">' for i in imgs)
    rep = tags * (2 if len(imgs) >= 8 else 4)
    cls = 'faixa' + (' volta' if volta else '') + (' trancada' if trancada else '')
    return f'<div class="{cls}" style="--dur:{dur}s" aria-hidden="true"><div class="faixa-trilho">{rep}{rep}</div></div>'

D = lambda ns: [f'desktop/400/{n}.webp?v=wm2' for n in ns]
F = lambda ns: [f'filmes/desktop/400/{n}.webp?v=wm2' for n in ns]
CADEADO = ('<svg viewBox="0 0 50 58" fill="none" aria-hidden="true"><rect x="3" y="24" width="44" height="31" rx="7" fill="#d9b878"/>'
           '<path d="M12 24v-8a13 13 0 0 1 26 0v8" stroke="#d9b878" stroke-width="6"/><circle cx="25" cy="38" r="4.5" fill="#0a1020"/></svg>')

COLECOES = f'''
  <!-- COLEÇÕES -->
  <section class="colecoes">
    <h2>O que tem <span class="serif">dentro do VIP</span></h2>
    <p class="centro m" style="margin-bottom:28px">Cinco coleções, mais de 600 pinturas. E as próximas também.</p>

    <div class="colecao">
      <div class="colecao-topo"><h3>Signature <span class="serif">Collection</span></h3><span>150 PINTURAS</span></div>
      <p>A coleção principal: paisagens, carros, mar, cidades. Notebook, celular, iPad e ultrawide.</p>
      {faixa(D(['05','07','08','09','10','29','30','31','41','43','44','49']), 46)}
    </div>
    <div class="colecao">
      <div class="colecao-topo"><h3>Shadows</h3><span>200+ PINTURAS</span></div>
      <p>Tudo em preto e branco, para quem gosta de uma tela mais sóbria.</p>
      {faixa(['membros/shadows-1.webp','membros/shadows-2.webp','membros/shadows-3.webp','membros/shadows-4.webp'] + D(['01','13','16','26']), 40, volta=True)}
    </div>
    <div class="colecao">
      <div class="colecao-topo"><h3>Sporting</h3><span>30+ PINTURAS</span></div>
      <p>Fórmula 1, polo, mar aberto e estrada.</p>
      {faixa(['membros/sporting-1.webp','membros/sporting-2.webp','membros/sporting-3.webp','membros/sporting-4.webp'], 30)}
    </div>
    <div class="colecao">
      <div class="colecao-topo"><h3>Movies</h3><span>80 CENAS</span></div>
      <p>Cenas de filmes e séries que marcaram época, todas pintadas a óleo.</p>
      {faixa(F(['01','02','03','04','05','08','09','13','15','17','25','30','39','43','53']), 50, volta=True)}
    </div>
    <div class="colecao">
      <div class="colecao-topo"><h3>Exclusive <span class="serif">Expansion</span></h3><span>200+ PINTURAS</span></div>
      <p>As que a gente deixa fora do site e dos anúncios. Só quem tem o VIP vê.</p>
      <div class="cadeado">{faixa(['acervo/polo-nuvem-400.webp','acervo/relogio-9-5-400.webp','acervo/no-risk-no-story-400.webp'] + D(['53','54','56','58']), 44, trancada=True)}<div class="selo-tranca">{CADEADO}<div><b>Liberadas no VIP</b><small>200+ PINTURAS</small></div></div></div>
    </div>
    <div class="proxima"><b>E as próximas coleções</b><span>Cada coleção nova aparece na sua área quando sair. Sem pagar de novo.</span></div>
  </section>
'''

BONUS = '''
  <!-- BÔNUS -->
  <section class="bonus">
    <h2>E ainda vem <span class="serif">junto</span></h2>
    <div class="bonus-grade">
      <div class="bonus-item"><div class="ic" aria-hidden="true">🔒</div><div><span class="et">Bônus</span><b>Exclusive Expansion</b><p>200+ pinturas que não estão no site nem nos anúncios.</p></div></div>
      <div class="bonus-item"><div class="ic" aria-hidden="true">✦</div><div><span class="et">Bônus</span><b>Todas as próximas coleções</b><p>Saiu coleção nova, ela já aparece na sua área. Você não compra de novo.</p></div></div>
      <div class="bonus-item"><div class="ic" aria-hidden="true">📖</div><div><span class="et">Bônus</span><b>Guia: wallpaper novo todo dia</b><p>O passo a passo para o seu celular e o seu notebook trocarem a pintura sozinhos.</p></div></div>
      <div class="bonus-item"><div class="ic" aria-hidden="true">🖥</div><div><span class="et">Bônus</span><b>Formatos extras</b><p>Na Signature, versões para iPad, monitor ultrawide e tela de bloqueio.</p></div></div>
      <div class="bonus-item"><div class="ic" aria-hidden="true">🗂</div><div><span class="et">Incluso</span><b>Sua área de membros</b><p>Tudo num lugar só, separado por coleção. Entra só com o e-mail, sem senha.</p></div></div>
    </div>
  </section>
'''

OFERTA_CARTA = f'''
  <!-- OFERTA (modelo do card da landing principal) -->
  <section class="oferta2" id="oferta">
    <span class="selo"><span class="so-promo"><span data-promo-nome>Black Friday</span> · <span data-off>65% OFF</span></span><span class="sem-promo-so">Acesso VIP</span></span>
    <div class="o2-esq">
      <h3 class="o2-nome">Acesso VIP VESPRO™</h3>
      <p class="o2-sub">Tudo o que a gente já pintou e tudo o que ainda vai pintar.</p>
      <div class="o2-thumbs" aria-hidden="true">
        <img src="../assets/desktop/400/30.webp?v=wm2" alt="" width="400" height="225" loading="lazy">
        <img src="../assets/membros/shadows-1.webp" alt="" width="400" height="225" loading="lazy">
        <img src="../assets/membros/sporting-1.webp" alt="" width="400" height="225" loading="lazy">
        <img src="../assets/filmes/desktop/400/01.webp?v=wm2" alt="" width="400" height="225" loading="lazy">
        <span>600+</span>
      </div>
      <p class="o2-qtd">600+ pinturas a óleo impasto</p>
      <p class="o2-qtd-sub">Notebook e celular em todas as coleções.</p>
      <ul class="o2-lista">
        <li>{CK}<span><b>Signature Collection</b> · 150 pinturas</span></li>
        <li>{CK}<span><b>Shadows</b> · 200+ em preto e branco</span></li>
        <li>{CK}<span><b>Sporting</b> · 30+ de esporte</span></li>
        <li>{CK}<span><b>Movies</b> · 80 cenas de filmes e séries</span></li>
        <li>{CK}<span><b>Exclusive Expansion</b> · 200+ fora do site <span class="tag-b">BÔNUS</span></span></li>
        <li>{CK}<span><b>As próximas coleções</b>, sem pagar de novo <span class="tag-b">BÔNUS</span></span></li>
        <li>{CK}<span><b>Guia</b> para trocar o wallpaper todo dia <span class="tag-b">BÔNUS</span></span></li>
        <li>{CK}<span>iPad, ultrawide e tela de bloqueio na Signature</span></li>
      </ul>
    </div>
    <div class="o2-dir">
      <p class="o2-label">Pagamento único</p>
      <div class="o2-preco-linha">
        <div class="o2-off so-promo"><b data-off-num>65%</b><span>OFF</span></div>
        <div style="text-align:center">
          <p class="o2-de">de <s>R$ <span data-separado>72,50</span></s> comprando separado</p>
          <p class="o2-preco"><small>R$</small><span data-preco>24,90</span></p>
        </div>
      </div>
      <p class="o2-conta">Dá menos de 5 centavos por pintura.</p>
      <div class="so-promo">
        <div class="relogio" aria-label="Tempo que falta">
          <div><b data-r="d">0</b><span>dias</span></div><div><b data-r="h">00</b><span>horas</span></div><div><b data-r="m">00</b><span>min</span></div><div><b data-r="s">00</b><span>seg</span></div>
        </div>
      </div>
      <a class="btn" data-checkout data-local="oferta" href="https://pay.wiapy.com/iTRVTC0ukQ3V">QUERO MEU ACESSO VIP</a>
      <p class="seguro">Compra segura · acesso liberado na hora</p>
      <p class="risco"><b>Risco zero:</b> 7 dias de garantia. Não gostou, a gente devolve.</p>
      <p class="o2-escassez so-promo">Fecha <span data-fim>segunda, 30/11, às 23h59</span>.<br>Quem conhece a VESPRO™ sabe: <b>a gente não faz escassez falsa.</b></p>
    </div>
  </section>
'''

CARTA = f'''
  <!-- TOPO -->
  <div class="hero carta-topo">
    {LOGO}
    <p class="tag so-promo" data-promo-nome>Black Friday</p>
    <h1>Opa. A gente já <span class="serif">se conhece.</span></h1>
    <p class="lead">Um recado rápido para quem já cruzou com a VESPRO™ por aí.</p>
    <a class="btn ghost" href="#oferta">Pular direto para a oferta ↓</a>
  </div>

  <!-- CARTA -->
  <article class="carta">
    <p>Você já passou por vários anúncios nossos. Talvez tenha parado em algum, olhado as pinturas, pensado <i>"isso fica bonito no notebook"</i> e seguido o dia.</p>
    <p>Talvez você até tenha comprado uma coleção. Se comprou, ela provavelmente está aí na sua tela agora, e isso deixa a gente feliz de verdade.</p>
    <p>Mas tem uma coisa que pouca gente sabe: <b>o que aparece nos anúncios é só um pedaço do que a gente pinta.</b></p>
    <figure><img src="../assets/filmes/desktop/800/01.webp?v=wm2" alt="" loading="lazy" width="800" height="450"><figcaption>Movies: 80 cenas de filmes e séries</figcaption></figure>
    <p>Hoje são cinco coleções. A Signature, com 150 pinturas. A Shadows, com mais de 200 em preto e branco. A Sporting, de esporte. A Movies, com cenas de filmes e séries. E a Exclusive Expansion, com <b>mais de 200 pinturas que a gente nunca colocou no site nem em anúncio nenhum.</b> De propósito.</p>
    <p class="destaque">Então a gente resolveu abrir tudo para quem já conhece a marca.</p>
    <p>Chama Acesso VIP. Funciona assim:</p>
    <ul>
      <li>Você leva <b>todas as coleções que já saíram</b>, numa área só, no tamanho certo do seu celular e do seu notebook.</li>
      <li>Leva as <b>200+ exclusivas</b>, que ninguém vê fora dali.</li>
      <li>E toda <b>coleção nova que sair</b> aparece na sua área sozinha. Você não compra de novo.</li>
    </ul>
    <p>Se você comprasse tudo separado, daria R$ <span data-separado>72,50</span>. <span class="so-promo">Até <span data-fim>segunda, 30/11, às 23h59</span>, o VIP sai por <b>R$ <span data-preco>24,90</span></b>, pagamento único. Depois volta para R$ <span data-normal>37,90</span>.</span><span class="sem-promo-so">No VIP sai por <b>R$ <span data-preco>37,90</span></b>, pagamento único.</span></p>
    <p>Por que tão barato? Porque você já conhece a gente. Não precisamos gastar com anúncio para te apresentar a marca de novo, e essa economia vira desconto.</p>
    <p>Se você já comprou antes, é só usar o mesmo e-mail. O que você tem continua lá, do jeito que está. O VIP só abre o resto.</p>
    <p>E se não gostar, são 7 dias de garantia. A gente devolve.</p>
    <div class="assina">{LOGO.replace(' class="logo"', '')}<div><b>Equipe VESPRO™</b><span>pintura a óleo impasto para a sua tela</span></div></div>
    <p class="ps"><b>P.S.</b> Você olha para essa tela o dia inteiro. Com mais de 600 pinturas, dá para trocar todo dia por mais de um ano e meio sem repetir nenhuma.</p>
  </article>

  {COLECOES}
  {clientes}
  {OFERTA_CARTA}
  {duvidas}
'''

DIRETA = f'''
  <!-- TOPO -->
  <div class="hero curta">
    {LOGO}
    <p class="tag so-promo" data-promo-nome>Black Friday</p>
    <p class="kicker">Para quem já conhece a VESPRO™</p>
    <h1>Você já viu um pedaço. <span class="serif">Leva tudo.</span></h1>
    {PRECO}
    <a class="btn" data-checkout data-local="topo" href="https://pay.wiapy.com/iTRVTC0ukQ3V">QUERO O ACESSO VIP</a>
    <p class="seguro"><span class="so-promo">Só até <b data-fim>segunda, 30/11, às 23h59</b> · </span>acesso na hora · 7 dias de garantia</p>
    <div class="mini-grade" aria-hidden="true">
      <div><img src="../assets/acervo/polo-nuvem-400.webp" alt="" width="400" height="225"><span>Signature<i>150</i></span></div>
      <div><img src="../assets/membros/shadows-1.webp" alt="" width="400" height="225"><span>Shadows<i>200+</i></span></div>
      <div><img src="../assets/membros/sporting-1.webp" alt="" width="400" height="225"><span>Sporting<i>30+</i></span></div>
      <div><img src="../assets/filmes/desktop/400/01.webp?v=wm2" alt="" width="400" height="225"><span>Movies<i>80</i></span></div>
      <div class="borra"><img src="../assets/acervo/no-risk-no-story-400.webp" alt="" width="400" height="223"><span>Exclusivas<i>200+</i></span></div>
      <div class="prox"><span>Próximas<i>incluídas</i></span></div>
    </div>
  </div>

  <!-- COMPARATIVO -->
  <section>
    <h2>Do jeito que está <span class="serif">x com o VIP</span></h2>
    <div class="comparativo">
      <div class="lado">
        <h3>Hoje</h3>
        <ul>
          <li>{XX}<span>Você vê as pinturas só nos anúncios</span></li>
          <li>{XX}<span>Tem uma coleção, ou nenhuma</span></li>
          <li>{XX}<span>As 200+ exclusivas ficam escondidas</span></li>
          <li>{XX}<span>Saiu coleção nova? Paga de novo</span></li>
        </ul>
      </div>
      <div class="lado vip">
        <h3>Com o VIP</h3>
        <ul>
          <li>{CK}<span>Todas as coleções na sua área</span></li>
          <li>{CK}<span>600+ pinturas, notebook e celular</span></li>
          <li>{CK}<span>As 200+ exclusivas liberadas</span></li>
          <li>{CK}<span>Coleção nova entra sozinha, sem pagar</span></li>
        </ul>
      </div>
    </div>
  </section>

  {conta}
  {oferta}
  <div class="porque estreito">
    <b>Por que tão barato?</b>
    <span>Porque você já conhece a gente. Não precisamos gastar com anúncio para te apresentar a marca, e essa economia vira desconto para você.</span>
  </div>
  {passos}
  {duvidas}
'''

for pasta, conteudo, titulo in [
    ('carta', CARTA, 'Acesso VIP VESPRO™ | um recado para quem já conhece a marca'),
    ('direta', DIRETA, 'Acesso VIP VESPRO™ | leva tudo'),
]:
    h = re.sub(r'<title>[^<]*</title>', f'<title>{titulo}</title>', head)
    h = h.replace('</style>', CSS_EXTRA + '</style>')
    h = h.replace("clarity('set','funil','vip');",
                  f"clarity('set','funil','vip'); clarity('set','variacao','{pasta}');")
    html = h + '<main class="wrap">\n' + conteudo + '\n</main>' + pe
    html = re.sub(r'(?<![./\w])\.\./', '../../', html)
    html = html.replace('<!doctype html>\n',
                        '<!doctype html>\n<!-- GERADO por vip/gerar_variacoes.py a partir de vip/index.html. Não edite aqui. -->\n', 1)
    os.makedirs(os.path.join(AQUI, pasta), exist_ok=True)
    with open(os.path.join(AQUI, pasta, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    print('gerado: vip/%s/' % pasta)
