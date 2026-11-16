// Gera as páginas temáticas (/filmes/, /anime/, /frases/) a partir do index.html atual.
// Uso:  node _funis/gerar.js
//
// O index.html original não é alterado. Cada página é uma cópia dele com textos, cards,
// links de checkout e caminhos das imagens ajustados. Se algum trecho do original mudar
// e o gerador não encontrar o texto que precisa trocar, ele para e avisa qual foi.

const fs = require('fs');
const path = require('path');
const temas = require('./temas');

const raiz = path.join(__dirname, '..');
const original = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');

const WIAPY = {
  completa: 'https://pay.wiapy.com/7fmmsK964ZH8',
  completaUpsell: 'https://pay.wiapy.com/SdUNug8FDfso',
  essencial: 'https://pay.wiapy.com/Lb6irRZR-uLn'
};

function gerar(slug, t) {
  let html = original;
  const erros = [];
  const troca = (de, para) => {
    const achou = typeof de === 'string' ? html.includes(de) : de.test(html);
    if (!achou) { erros.push(String(de).slice(0, 90)); return; }
    html = typeof de === 'string' ? html.split(de).join(para) : html.replace(de, para);
  };

  const Q = t.qtd, A = t.artes, C = t.colecao, N = t.curto, NU = N.toUpperCase();
  const limpo = C.replace(/™/g, '');          // nome sem ™ para Pixel/Clarity
  const SIG = 'VESPRO Signature Collection™';   // nome fixo dos 150 wallpapers em todas as páginas temáticas
  const combo = `${limpo} + Signature Collection`;
  const centavos = Math.ceil(2190 / (150 + t.qtdNum));
  const link = k => (t.checkout[k] || '').trim();

  // Aviso no topo do arquivo gerado
  troca('<!doctype html>\n', `<!doctype html>\n<!-- GERADO por _funis/gerar.js a partir do index.html. Não edite aqui: mude _funis/temas.js e rode "node _funis/gerar.js". -->\n`);

  // Caminhos: a página fica uma pasta abaixo da raiz
  troca('href="favicon.ico"', 'href="../favicon.ico"');
  troca(/(^|[\s"'(,])assets\//g, '$1../assets/');
  // Artes próprias do tema: mesma estrutura de pastas e mesmos nomes de arquivo, dentro de assets/<pasta>/
  if (t.pastaArtes) troca(/\.\.\/assets\/(desktop|celular)\//g, `../assets/${t.pastaArtes}/$1/`);

  // Cabeçalho
  troca('<title>VESPRO | 75 Wallpapers em Pintura a Óleo</title>', `<title>${t.title}</title>`);
  troca(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${t.description}" />`);

  // Checkout (configuração) + nome do produto no Pixel + marca do funil no Clarity
  troca(/checkout: \{[\s\S]*?\n  \}/, `checkout: {
    // ${C}: cole os links da Wiapy em _funis/temas.js (não aqui) e gere de novo
    completa: "${link('completa')}",         // ${combo} · R$ 21,90 (botão do card)
    completaUpsell: "${link('completaUpsell')}",   // ${combo} com desconto · R$ 17,90 (pop-up)
    essencial: "${link('essencial')}"         // ${C} · R$ 12,90 (pop-up, "não, quero só a ${C}")
  }`);
  troca("content_name: 'Coleção de wallpapers'", `content_name: '${limpo}'`);
  troca('  // marca a sessão com a origem do anúncio', `  clarity('set', 'funil', '${slug}');\n  // marca a sessão com a origem do anúncio`);

  // 1. Topo (a headline NUNCA muda: fica a mesma da página original)
  troca('75 wallpapers em pintura a óleo impasto, feitos para ficar bonitos de verdade no notebook e no celular.<br>Textura, pinceladas e cores que fazem a tela parecer outra.', t.heroP.replace('{qtd}', Q));

  // 2. Galeria
  troca('São 75 pinturas na Essencial e 150 na Completa.', `São ${Q} ${A} na coleção ${C}, e mais 150 wallpapers na ${SIG}.`);

  // 5. O que vem na coleção
  troca('>75 artes</h3>', `>${Q} ${A}</h3>`);
  troca('São pinturas em estilos e composições diferentes, todas seguindo a estética de óleo impasto.', t.packP1);
  troca('Tem arte mais escura, mais clara, clássica, abstrata e várias que ficam absurdas em tela grande.', t.packP2);

  // 7. Oferta: card de entrada
  troca('<!-- Plano 1: Essencial', `<!-- Plano 1: ${C}`);
  troca('<!-- Plano 2: Completa', `<!-- Plano 2: ${combo}`);
  troca('>Coleção Essencial</h3>', `>${C}</h3>`);
  troca('Para quem só quer as artes e pronto.', t.entradaP);
  troca('>75 wallpapers</span>', `>${Q} ${A}</span>`);
  troca('>QUERO A ESSENCIAL</button>', `>QUERO A ${C.toUpperCase()}</button>`);

  // 7. Oferta: card principal (coleção temática + 150)
  troca('>Coleção Completa</h3>', `>${C}<br>+ ${SIG}</h3>`);
  troca('Para quem quer ficar com o acervo todo.', `Para quem quer as ${A} e o acervo VESPRO™ todo.`);
  troca('>150</div>', '>+150</div>');
  troca('>150 wallpapers</p>', `>${Q} ${A} + 150 wallpapers</p>`);
  troca('Você recebe as artes da Essencial e também as outras versões e formatos que fizemos.', `Você recebe a coleção ${C} e também os 150 wallpapers da ${SIG}, com todas as versões e formatos.`);
  troca('>150 wallpapers em 4K</span>', `>${C} + ${SIG} (150 wallpapers) em 4K</span>`);
  troca('Dá menos de 15 centavos por wallpaper.', `Dá menos de ${centavos} centavos por wallpaper.`);
  troca('>QUERO A COLEÇÃO COMPLETA</a>', `>QUERO ${NU} + SIGNATURE</a>`);

  // Pop-up (abre ao escolher a coleção de entrada)
  troca('Mas por mais R$ 5, dá para levar a <span class="font-serif italic font-normal">Completa</span>.', `Mas por mais R$ 5, você leva também a <span class="font-serif italic font-normal">${SIG}</span>.`);
  troca('Além das 75 artes, você recebe:', `Além das ${A}, você recebe:`);
  troca('>150 wallpapers no total</span>', `>150 wallpapers da ${SIG}</span>`);
  troca('>SIM, QUERO A COMPLETA</a>', `>SIM, QUERO ${NU} + SIGNATURE</a>`);
  troca('>não, quero ficar com a Essencial</a>', `>não, quero só a ${C}</a>`);

  // Links e nomes dos produtos nos botões (o nome vai para o Pixel e o Clarity)
  troca('data-name="Coleção Completa (upsell)"', `data-name="${combo} (pop-up)"`);
  troca('data-name="Coleção Completa"', `data-name="${combo}"`);
  troca('data-name="Coleção Essencial"', `data-name="${limpo}"`);
  for (const k of Object.keys(WIAPY)) troca(`href="${WIAPY[k]}"`, `href="${link(k) || '#checkout-pendente'}"`);

  // 8. Dúvidas
  troca('Qual a diferença entre a Coleção Essencial e a Completa?', `Qual a diferença entre a ${C} sozinha e com a ${SIG}?`);
  troca('A Essencial traz 75 wallpapers em 4K. A Completa traz o dobro (150), com cada pintura também em versão Dourada, formatos ultrawide, iPad e tela de bloqueio, além de bônus e garantia estendida.',
        `A ${C} traz ${Q} ${A} em 4K. Com a ${SIG}, você leva essas artes e mais 150 wallpapers, com versão Dourada, formatos ultrawide, iPad e tela de bloqueio, além de bônus e garantia estendida.`);

  // Barra fixa
  troca('>75 wallpapers em 4K</p>', `>${t.barra || Q + ' artes em 4K'}</p>`);  // curto para caber no celular ao lado do botão

  if (erros.length) {
    console.error(`\n[${slug}] não achei estes trechos no index.html (o original mudou?):\n - ` + erros.join('\n - '));
    process.exitCode = 1;
    return;
  }

  // Sobras do texto original que não deveriam aparecer
  const sobras = ['Essencial', '75 wallpapers', '75 artes', '75 pinturas', 'pay.wiapy.com'].filter(s => html.includes(s) && !(s === 'pay.wiapy.com' && Object.values(t.checkout).some(Boolean)));
  if (sobras.length) console.warn(`[${slug}] atenção, ainda aparece: ${sobras.join(', ')}`);

  const dir = path.join(raiz, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const pend = Object.keys(WIAPY).filter(k => !link(k));
  console.log(`[${slug}] ok -> /${slug}/` + (pend.length ? `  (checkout pendente: ${pend.join(', ')})` : ''));
}

const so = process.argv[2];
for (const [slug, t] of Object.entries(temas)) if (!so || so === slug) gerar(slug, t);
