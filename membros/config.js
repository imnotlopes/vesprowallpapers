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
  idiomaPadrao: "pt",       // idioma em que a área abre
  idiomas: ["pt"],          // só português (pedido em 21/11). Com mais de um, ex. ["pt","en","es"], aparece a troca no topo

  /* ---------- Entrada só com e-mail ----------
     modoDemo: true = demonstração (qualquer e-mail entra e escolhe um perfil de cliente).
     Depois de ligar o banco (membros-servidor/LEIA-ME.md), mude para false.
     api: função que confere a compra pelo e-mail (fica neste site, em api/membros-entrar.js). */
  modoDemo: false,
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
     artes: miniaturas mostradas como prévia (caminho a partir de /assets/).
     Imagens SEM marca d'água (quem está aqui já comprou): geradas por membros-servidor/gerar-imagens.py. */
  colecoes: {
    signature: {
      universo: "wallpapers", ordem: 1, qtd: "150",
      nome: "VESPRO Signature Collection™",
      capa: "membros/limpas/signature-capa.webp",
      artes: ["membros/limpas/signature-01.webp","membros/limpas/signature-02.webp","membros/limpas/signature-03.webp","membros/limpas/signature-04.webp","membros/limpas/signature-05.webp","membros/limpas/signature-06.webp","membros/limpas/signature-07.webp","membros/limpas/signature-08.webp","membros/limpas/signature-09.webp","membros/limpas/signature-10.webp","membros/limpas/signature-11.webp","membros/limpas/signature-12.webp"],
      downloads: ["desktop","celular","todos"]
    },
    essencial: {
      universo: "wallpapers", ordem: 2, qtd: "75+", dentroDe: "signature",
      nome: "VESPRO Essential Collection™",
      capa: "membros/limpas/essencial-capa.webp",
      artes: ["membros/limpas/essencial-01.webp","membros/limpas/essencial-02.webp","membros/limpas/essencial-03.webp","membros/limpas/essencial-04.webp","membros/limpas/essencial-05.webp","membros/limpas/essencial-06.webp","membros/limpas/essencial-07.webp","membros/limpas/essencial-08.webp"],
      downloads: ["desktop","celular"]
    },
    shadows: {
      universo: "wallpapers", ordem: 3,
      nome: "VESPRO Shadows Collection™",
      capa: "membros/limpas/shadows-capa.webp",
      artes: ["membros/limpas/shadows-01.webp","membros/limpas/shadows-02.webp","membros/limpas/shadows-03.webp","membros/limpas/shadows-04.webp"],
      downloads: ["pasta"]
    },
    sporting: {
      universo: "wallpapers", ordem: 4,
      nome: "VESPRO Sporting Collection™",
      capa: "membros/limpas/sporting-capa.webp",
      artes: ["membros/limpas/sporting-01.webp","membros/limpas/sporting-02.webp","membros/limpas/sporting-03.webp","membros/limpas/sporting-04.webp"],
      downloads: ["pasta"]
    },
    exclusivas: {
      universo: "wallpapers", ordem: 5, qtd: "200+", so: "acervo",
      nome: "VESPRO Exclusive Expansion™",
      capa: "membros/limpas/exclusivas-capa.webp",
      artes: ["membros/limpas/exclusivas-01.webp","membros/limpas/exclusivas-02.webp","membros/limpas/exclusivas-03.webp"],
      downloads: ["pasta"]
    },
    movies: {
      universo: "movies", ordem: 1, qtd: "80",
      nome: "VESPRO Movies™",
      capa: "membros/limpas/movies-capa.webp",
      artes: ["membros/limpas/movies-01.webp","membros/limpas/movies-02.webp","membros/limpas/movies-03.webp","membros/limpas/movies-04.webp","membros/limpas/movies-05.webp","membros/limpas/movies-06.webp","membros/limpas/movies-07.webp","membros/limpas/movies-08.webp","membros/limpas/movies-09.webp","membros/limpas/movies-10.webp","membros/limpas/movies-11.webp","membros/limpas/movies-12.webp"],
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
