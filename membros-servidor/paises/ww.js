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
