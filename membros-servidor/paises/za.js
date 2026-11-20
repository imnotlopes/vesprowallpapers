/* ÁREA DE MEMBROS DA ÁFRICA DO SUL (za.vesprowallpapers.com/members/)
   Só o que muda em relação ao Brasil. Coleções, prévias e textos vêm da área do Brasil.
   Depois de mexer aqui: python membros-servidor/gerar-paises.py */
Object.assign(window.MEMBROS, {
  pais: "za",              // compras com loja = 'za' (webhook da Lojou)
  idiomaPadrao: "en",
  idiomas: ["en", "pt", "es"],   // a área da África do Sul continua com a troca de idioma
  api: "https://membros.vesprowallpapers.com/api/membros-entrar",   // a função fica no site do Brasil

  metaPixelId: "",         // mesmo pixel da landing za (hoje vazio)
  clarityId: "",

  /* Rand, preços sempre terminando em 7. PREÇOS SÃO SUGESTÃO.
     Na Lojou, cada oferta precisa ser um produto aprovado; cole o link do checkout (pay.lojou.app/...). */
  loja: {
    moeda: "R", decimal: ".", final7: true, codigoMoeda: "ZAR",
    precoColecaoSite: "47",
    ofertas: {
      upgrade_signature: { preco: "37", de: "77",  link: "" },
      shadows:           { preco: "37", de: "97",  link: "" },
      sporting:          { preco: "37", de: "87",  link: "" },
      shadows_sporting:  { preco: "57", de: "177", link: "" },
      movies:            { preco: "37", de: "47",  link: "" },
      signature:         { preco: "47", de: "77",  link: "" },
      acervo:            { cheio: "167", minimo: "87", link: "" }   // igual aos funis da Lojou: R117 / R97 / R87
    }
  },

  demo: {
    essencial:  { colecoes: ["essencial"], pagou: "47" },
    completa:   { colecoes: ["signature"], pagou: "77" },
    movies:     { colecoes: ["movies"], pagou: "47" },
    movies_sig: { colecoes: ["movies","signature"], pagou: "77" },
    com_bumps:  { colecoes: ["signature","shadows","sporting"], pagou: "131" },
    acervo:     { colecoes: ["acervo"], pagou: "167" }
  }
});
