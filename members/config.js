/* ARQUIVO GERADO por membros-servidor/gerar-paises.py: não edite aqui.
   Edite membros/config.js (comum) ou membros-servidor/paises/ww.js (só deste país). */
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
      capa: "membros/limpas/signature-capa.webp?v=2",
      artes: ["membros/limpas/signature-01.webp","membros/limpas/signature-02.webp","membros/limpas/signature-03.webp","membros/limpas/signature-04.webp","membros/limpas/signature-05.webp","membros/limpas/signature-06.webp","membros/limpas/signature-07.webp","membros/limpas/signature-08.webp","membros/limpas/signature-09.webp","membros/limpas/signature-10.webp","membros/limpas/signature-11.webp","membros/limpas/signature-12.webp","membros/limpas/signature-13.webp","membros/limpas/signature-14.webp","membros/limpas/signature-15.webp","membros/limpas/signature-16.webp","membros/limpas/signature-17.webp","membros/limpas/signature-18.webp"],
      downloads: ["desktop","celular","todos"],
      guia: "membros/guia-wallpaper-vespro.pdf"   // bônus da Coleção Completa (botão abaixo de "Como colocar")
    },
    essencial: {
      universo: "wallpapers", ordem: 2, qtd: "75+", dentroDe: "signature",
      nome: "VESPRO Essential Collection™",
      capa: "membros/limpas/essencial-capa.webp?v=2",
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
     Produtos criados na Wiapy em 21/11/2026 (nome "... · Oferta de membro"), já no webhook.
     Para criar: na Wiapy, um produto novo para cada oferta (pagamento único) e cole o link aqui. */
  loja: {
    moeda: "R$", decimal: ",", codigoMoeda: "BRL",
    precoColecaoSite: "12,90",          // âncora: "cada coleção nova custa R$ 12,90 no site"
    ofertas: {
      upgrade_signature: { preco: "9,90",  de: "21,90", link: "https://pay.wiapy.com/smGtJXo-4A-g" },   // Essencial > Signature (paga só a diferença)
      shadows:           { preco: "9,90",  de: "14,90", link: "https://pay.wiapy.com/z3q-TBe4M5x5" },
      sporting:          { preco: "9,90",  de: "14,90", link: "https://pay.wiapy.com/P2n-aBHGn7bs" },
      shadows_sporting:  { preco: "14,90", de: "29,80", link: "https://pay.wiapy.com/mW2OOIdvcEXD" },
      movies:            { preco: "9,90",  de: "12,90", link: "https://pay.wiapy.com/Q1-asTX3iQ60" },
      signature:         { preco: "12,90", de: "21,90", link: "https://pay.wiapy.com/Vzkb1l8cW8Zt" },   // para quem só tem a Movies
      acervo:            { preco: "37,90", link: "https://pay.wiapy.com/iTRVTC0ukQ3V" }                  // Acesso VIP: preço exclusivo da área de membros
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

/* ÁREA DE MEMBROS WORLDWIDE (members.vesprowallpapers.com -> /members/)
   Só o que muda em relação ao Brasil. Coleções, prévias e textos vêm da área do Brasil.
   Depois de mexer aqui: python membros-servidor/gerar-paises.py

   Uma área só para o mundo todo. O checkout muda pelo país de quem está vendo:
   - KashPay/Stripe (dólar): padrão, para os países que pagam com cartão;
   - Lojou (rand): todos os países da África;
   - Hotmart: para alguns países, ainda desligada (ativo: false).
   País novo num checkout = código de 2 letras (ISO) na lista "paises" dele. */
Object.assign(window.MEMBROS, {
  pais: "ww",              // compras com loja = 'ww' (Stripe, Lojou e Hotmart). A API também mostra as antigas 'za'.
  idiomaPadrao: "en",
  idiomas: ["en", "es", "pt"],
  api: "/api/membros-entrar",

  metaPixelId: "",         // a decidir (pixel da marca ou o da África)
  clarityId: "",

  gatewayPadrao: "stripe",
  gateways: {

    /* ---------- KashPay (Stripe PJ): países com cartão (todos que não estão em outra lista) ----------
       Ofertas de membro criadas na KashPay em 27/11/2026 (preços do usuário: coleções a $9.90,
       Acesso VIP acima do maior upsell, que é $34.90). Pós-compra volta para members.vesprowallpapers.com.
       Webhook: api/membros-compra?plataforma=kashpay (o nome da oferta diz a coleção). */
    stripe: {
      paises: [],
      loja: {
        moeda: "US$", decimal: ".", codigoMoeda: "USD",
        precoColecaoSite: "9.90",
        ofertas: {
          upgrade_signature: { preco: "9.90",  de: "19.90", link: "https://checkout.kashpay.com/checkout/checkout-1795796504190" }, // Complete Collection · Member Offer
          shadows:           { preco: "9.90",  link: "https://checkout.kashpay.com/checkout/checkout-1795796236703" },
          sporting:          { preco: "9.90",  link: "https://checkout.kashpay.com/checkout/checkout-1795796333214" },
          shadows_sporting:  { preco: "14.90", de: "19.80", link: "https://checkout.kashpay.com/checkout/checkout-1795796611675" },
          movies:            { preco: "9.90",  link: "https://checkout.kashpay.com/checkout/checkout-1795796416956" },
          signature:         { preco: "9.90",  de: "19.90", link: "https://checkout.kashpay.com/checkout/checkout-1795796504190" }, // mesmo checkout do upgrade
          acervo:            { preco: "37.90", link: "https://checkout.kashpay.com/checkout/checkout-1795796038484" }  // Complete Archive · VIP Member Access
        }
      }
    },

    /* ---------- Lojou: África inteira ----------
       Produtos "... · Member Offer" criados na Lojou em 22/11/2026 (IDs 6152 a 6156, 6161, 6162),
       preço em rand (final 7). A Lojou converte sozinha para a moeda do país no checkout.
       Os 15 países africanos que aparecem na lista de telefone do checkout da Lojou:
       AO CV MZ ZA CM ET GH KE MA NG SN TZ UG ZM ZW. Os outros também vão para a Lojou (cartão). */
    lojou: {
      paisDaMoeda: "ZA",     // fora da África do Sul aparece o aviso "no checkout o valor aparece na sua moeda"
      paises: [
        "DZ","AO","BJ","BW","BF","BI","CV","CM","CF","TD","KM","CG","CD","CI","DJ","EG","GQ","ER",
        "SZ","ET","GA","GM","GH","GN","GW","KE","LS","LR","LY","MG","MW","ML","MR","MU","MA","MZ",
        "NA","NE","NG","RW","ST","SN","SC","SL","SO","ZA","SS","SD","TZ","TG","TN","UG","ZM","ZW",
        "EH","RE","YT","SH"
      ],
      loja: {
        moeda: "R", decimal: ".", final7: true, codigoMoeda: "ZAR",
        precoColecaoSite: "47",
        ofertas: {
          upgrade_signature: { preco: "37", de: "77",  link: "https://pay.lojou.app/3e1PK" },  // 6152 Complete Collection · Member Upgrade
          shadows:           { preco: "37", de: "97",  link: "https://pay.lojou.app/g9ze3" },  // 6153
          sporting:          { preco: "37", de: "87",  link: "https://pay.lojou.app/TBOX7" },  // 6154
          shadows_sporting:  { preco: "57", de: "177", link: "https://pay.lojou.app/89Mgs" },  // 6155
          movies:            { preco: "37", de: "47",  link: "https://pay.lojou.app/8QddU" },  // 6156
          signature:         { preco: "47", de: "77",  link: "https://pay.lojou.app/Tt5rQ" },  // 6161 Complete Collection · Member Offer
          acervo:            { preco: "97", link: "https://pay.lojou.app/mS3Fy" }               // 6162 Complete Archive · VIP Member Access
        }
      }
    },

    /* ---------- Hotmart: alguns países, depois ----------
       Para ligar: ativo: true, códigos dos países em "paises" e os links em "ofertas". */
    hotmart: {
      ativo: false,
      paises: [],
      loja: {
        moeda: "US$", decimal: ".", codigoMoeda: "USD",
        precoColecaoSite: "4.99",
        ofertas: {}
      }
    }
  },

  demo: {
    essencial:  { colecoes: ["essencial"], pagou: "4.99" },
    completa:   { colecoes: ["signature"], pagou: "7.99" },
    movies:     { colecoes: ["movies"], pagou: "4.99" },
    movies_sig: { colecoes: ["movies","signature"], pagou: "9.99" },
    com_bumps:  { colecoes: ["signature","shadows","sporting"], pagou: "14.97" },
    acervo:     { colecoes: ["acervo"], pagou: "19.99" }
  }
});
