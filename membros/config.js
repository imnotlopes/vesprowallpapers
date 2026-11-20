/* =====================================================================
   ÁREA DE MEMBROS VESPRO: CONFIGURAÇÃO
   Tudo que muda com frequência fica aqui: conexão, coleções, ofertas e preços.
   Os links do Google Drive NÃO ficam aqui (este arquivo é público).
   Eles ficam no banco de dados (membros-servidor/02-links.sql) e só chegam
   para quem comprou.
   ===================================================================== */
window.MEMBROS = {

  /* ---------- País desta área ----------
     Cada país tem a sua área de membros, separada: só vê as compras feitas no próprio país.
     Brasil: esta pasta (/membros/). África do Sul: gerada em landing za/members/ por
     membros-servidor/gerar-paises.py a partir de membros-servidor/paises/za.js. */
  pais: "br",               // precisa bater com a coluna "loja" das compras no banco
  idiomaPadrao: "pt",       // idioma em que a área abre (a pessoa pode trocar no topo)

  /* ---------- Entrada só com e-mail ----------
     modoDemo: true = demonstração (qualquer e-mail entra e escolhe um perfil de cliente).
     Depois de ligar o banco (membros-servidor/LEIA-ME.md), mude para false.
     api: função que confere a compra pelo e-mail (fica neste site, em api/membros-entrar.js). */
  modoDemo: true,
  api: "/api/membros-entrar",

  metaPixelId: "1781303226340709",
  clarityId: "yyc0uitibt",

  suporte: {
    email: "support@vesprowallpapers.com",
    whatsapp: "5511989455471"   // só números, com DDI
  },

  /* ---------- Coleções ----------
     universo: "wallpapers" (área principal) ou "movies" (área separada da VESPRO Movies).
     dentroDe: se a pessoa tem a coleção indicada, esta não aparece (ex.: a Essencial está dentro da Signature).
     so: "acervo" = só se ganha com o Acervo Completo.
     downloads: botões que aparecem na página da coleção (as chaves precisam existir nos links do banco).
     artes: miniaturas mostradas como prévia (caminho a partir de /assets/). */
  colecoes: {
    signature: {
      universo: "wallpapers", ordem: 1, qtd: "150",
      nome: "VESPRO Signature Collection™",
      capa: "desktop/800/08.webp",
      artes: ["desktop/400/01.webp","desktop/400/03.webp","desktop/400/04.webp","desktop/400/06.webp","desktop/400/07.webp","desktop/400/08.webp","desktop/400/09.webp","desktop/400/10.webp","desktop/400/11.webp","desktop/400/13.webp","desktop/400/29.webp","desktop/400/30.webp"],
      downloads: ["desktop","celular","todos"]
    },
    essencial: {
      universo: "wallpapers", ordem: 2, qtd: "75+", dentroDe: "signature",
      nome: "VESPRO Essential Collection™",
      capa: "desktop/800/14.webp",
      artes: ["desktop/400/14.webp","desktop/400/15.webp","desktop/400/16.webp","desktop/400/17.webp","desktop/400/18.webp","desktop/400/19.webp","desktop/400/20.webp","desktop/400/21.webp"],
      downloads: ["desktop","celular"]
    },
    shadows: {
      universo: "wallpapers", ordem: 3,
      nome: "VESPRO Shadows Collection™",
      capa: "membros/shadows-capa.webp",
      artes: ["membros/shadows-1.webp","membros/shadows-2.webp","membros/shadows-3.webp","membros/shadows-4.webp"],
      downloads: ["pasta"]
    },
    sporting: {
      universo: "wallpapers", ordem: 4,
      nome: "VESPRO Sporting Collection™",
      capa: "membros/sporting-capa.webp",
      artes: ["membros/sporting-1.webp","membros/sporting-2.webp","membros/sporting-3.webp","membros/sporting-4.webp"],
      downloads: ["pasta"]
    },
    exclusivas: {
      universo: "wallpapers", ordem: 5, qtd: "200+", so: "acervo",
      nome: "VESPRO Exclusive Expansion™",
      capa: "acervo/capa-720.webp",
      artes: ["acervo/polo-nuvem-400.webp","acervo/relogio-9-5-400.webp","acervo/no-risk-no-story-400.webp"],
      downloads: ["pasta"]
    },
    movies: {
      universo: "movies", ordem: 1, qtd: "80",
      nome: "VESPRO Movies™",
      capa: "membros/movies-capa.webp",
      artes: ["filmes/desktop/400/01.webp","filmes/desktop/400/02.webp","filmes/desktop/400/03.webp","filmes/desktop/400/04.webp","filmes/desktop/400/05.webp","filmes/desktop/400/08.webp","filmes/desktop/400/09.webp","filmes/desktop/400/10.webp","filmes/desktop/400/12.webp","filmes/desktop/400/13.webp","filmes/desktop/400/15.webp","filmes/desktop/400/16.webp"],
      downloads: ["desktop"]
    }
  },

  /* Próxima coleção (estratégia "lançamento"). ativa:false = não aparece. */
  proxima: { ativa: false, nome: "", data: "", capa: "" },

  /* ---------- Ofertas dentro da área (upsell para quem já é cliente) ----------
     Moeda e checkouts deste país (Brasil: reais, Wiapy).
     link vazio = o botão abre o WhatsApp do suporte com a mensagem pronta.
     PREÇOS ABAIXO SÃO SUGESTÃO: confira antes de criar os produtos.
     Para criar: na Wiapy, um produto novo para cada oferta (pagamento único) e cole o link aqui. */
  loja: {
    moeda: "R$", decimal: ",", codigoMoeda: "BRL",
    precoColecaoSite: "12,90",          // âncora: "cada coleção nova custa R$ 12,90 no site"
    ofertas: {
      upgrade_signature: { preco: "9,90",  de: "21,90", link: "" },   // Essencial > Signature (paga só a diferença)
      shadows:           { preco: "9,90",  de: "14,90", link: "" },
      sporting:          { preco: "9,90",  de: "14,90", link: "" },
      shadows_sporting:  { preco: "14,90", de: "29,80", link: "" },
      movies:            { preco: "9,90",  de: "12,90", link: "" },
      signature:         { preco: "12,90", de: "21,90", link: "" },   // para quem só tem a Movies
      acervo:            { preco: "37,90", link: "" }                  // Acesso VIP: preço exclusivo da área de membros
      // (outra opção: { cheio: "39,80", minimo: "17,90" } = cheio menos o que a pessoa já pagou)
    }
  },

  /* ---------- Modo demonstração ----------
     Perfis para ver como a área fica para cada tipo de cliente (só aparece sem Supabase ou com ?demo=1). */
  demo: {
    essencial:  { colecoes: ["essencial"], pagou: "12,90" },
    completa:   { colecoes: ["signature"], pagou: "21,90" },
    movies:     { colecoes: ["movies"], pagou: "12,90" },
    movies_sig: { colecoes: ["movies","signature"], pagou: "21,90" },
    com_bumps:  { colecoes: ["signature","shadows","sporting"], pagou: "35,70" },
    acervo:     { colecoes: ["acervo"], pagou: "37,90" }
  }
};
