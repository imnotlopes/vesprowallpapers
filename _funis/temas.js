// Textos e links de cada página temática. É aqui que se mexe.
// Depois de editar, rode:  node _funis/gerar.js
// (o gerador refaz /filmes/, /anime/ e /frases/ a partir do index.html atual)
//
// colecao: nome da coleção como aparece na página. curto: nome curto usado nos botões ("QUERO MOVIES + 150").
// qtd / qtdNum: quantidade de artes da coleção temática (provisória até as artes ficarem prontas).
// pastaArtes: pasta dentro de assets/ com as artes do tema (mesmos nomes de arquivo da página principal). Sem ela, a página usa as artes da principal.
// checkout: links da Wiapy de cada produto. Enquanto estiver vazio, o botão não leva a lugar nenhum.

module.exports = {
  filmes: {
    qtd: '80+', qtdNum: 80,
    pastaArtes: 'filmes',
    colecao: 'VESPRO Movies™',
    curto: 'Movies',
    artes: 'artes de cinema',
    title: 'VESPRO | Wallpapers de Cinema em Pintura a Óleo',
    description: 'Coleção de wallpapers inspirados no cinema, em pintura a óleo impasto, para notebook e celular. 4K, download imediato, pagamento único.',
    heroP: '{qtd} cenas de filmes e séries que marcaram época, pintadas a óleo impasto, para o notebook e o celular.<br>Textura, pinceladas e aquela luz de cena que faz a tela parecer outra.',
    packP1: 'Cenas de filmes e séries que marcaram época, todas refeitas em óleo impasto.',
    packP2: 'Tem máfia, cassino, golpe perfeito, herói na cidade à noite e várias que ficam absurdas em tela grande.',
    entradaP: 'Para quem quer só as artes de cinema.',
    checkout: {
      completa: 'https://pay.wiapy.com/NAhagBuNVr4y',        // VESPRO Movies™ + Signature Collection™ · R$ 23,90
      completaUpsell: 'https://pay.wiapy.com/u5h0EscLMhD3',  // o mesmo combo no pop-up · R$ 19,90
      essencial: 'https://pay.wiapy.com/oPEAOO9qmrct'        // VESPRO Movies™ · R$ 14,90
    }
  },

  anime: {
    qtd: '30+', qtdNum: 30,
    colecao: 'Collab Anime VESPRO™',
    curto: 'Anime',
    artes: 'artes anime',
    title: 'VESPRO | Wallpapers Anime em Pintura a Óleo',
    description: 'Coleção de wallpapers inspirados no universo anime, em pintura a óleo impasto, para notebook e celular. 4K, download imediato, pagamento único.',
    heroP: '{qtd} cenas no clima dos animes pintadas a óleo impasto, para o notebook e o celular.<br>Céus enormes, ruas de Tóquio e luz de fim de tarde, com textura de tinta de verdade.',
    packP1: 'Paisagens, cidades e momentos com a atmosfera dos animes, todos em óleo impasto.',
    packP2: 'Tem céu de verão, rua de Tóquio à noite, trem no pôr do sol e várias que ficam absurdas em tela grande.',
    entradaP: 'Para quem quer só as artes anime.',
    checkout: { completa: '', completaUpsell: '', essencial: '' }
  },

  frases: {
    qtd: '30+', qtdNum: 30,
    colecao: 'VESPRO Inspirations™',
    curto: 'Inspirations',
    artes: 'frases',
    title: 'VESPRO | Wallpapers de Frases em Pintura a Óleo',
    description: 'Coleção de wallpapers com frases em pintura a óleo impasto, para notebook e celular. 4K, download imediato, pagamento único.',
    heroP: '{qtd} frases pintadas a óleo impasto, para o notebook e o celular.<br>Letras com relevo de tinta e uma frase para lembrar todo dia por que você começou.',
    packP1: 'Frases curtas e diretas, com letras de tinta grossa e composições que viram quadro na tela.',
    packP2: 'Tem frase sobre risco, dinheiro, tempo e coragem, e várias que ficam absurdas em tela grande.',
    entradaP: 'Para quem quer só as frases.',
    checkout: { completa: '', completaUpsell: '', essencial: '' }
  }
};
