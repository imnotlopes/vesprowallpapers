# Estratégia de upsell da área de membros VESPRO™

Quem já comprou é o cliente mais barato de vender de novo: não custa anúncio para achar. A área de membros é a vitrine que essa pessoa abre sempre que quer baixar um wallpaper, então cada visita é uma chance de venda.

A regra geral: **uma oferta principal por vez**, escolhida pelo que a pessoa já tem, e o **Acervo Completo sempre por baixo**, com o que ela já pagou virando desconto.

---

## 1. Escada de valor (o "próximo passo")

No topo da área aparece um único card "Seu próximo passo". O degrau muda conforme o que a pessoa comprou:

| A pessoa tem | Área Wallpapers mostra | Área Movies mostra |
|---|---|---|
| Só a Essential (75+) | Completar a Signature pagando a diferença | VESPRO Movies |
| Signature (150) | Combo Shadows + Sporting | VESPRO Movies |
| Signature + Shadows | Só a Sporting | VESPRO Movies |
| Signature + Shadows + Sporting | Acervo Completo | VESPRO Movies |
| Só a VESPRO Movies | Combo Shadows + Sporting | Signature Collection |
| Movies + Signature | Combo Shadows + Sporting | Acervo Completo |
| Acervo Completo (VIP) | Nada para vender: selo VIP | Nada para vender: selo VIP |

Por que funciona: a próxima compra é sempre pequena e lógica ("complete o que você começou"), nunca um salto grande de preço.

## 2. Coleções trancadas com preço de membro

Na seção "Complete seu acervo", as coleções que a pessoa não tem aparecem com cadeado, prévia desfocada e o preço riscado ao lado do preço de membro. Clicando na coleção, ela vê a amostra e a oferta.

A Expansão Exclusiva (200+) aparece trancada com "Só no Acervo Completo": ela não é vendida separada, para dar um motivo único para o Acervo.

## 3. Acesso VIP (Acervo Completo) com preço exclusivo

No Brasil, o Acesso VIP custa **R$ 37,90, preço que só existe dentro da área de membros**:
- Selo "Preço exclusivo da área de membros" em cima do preço.
- Âncora: "Cada coleção nova custa R$ 12,90 no site. Com o acesso VIP, você não paga mais nenhuma."
- Comparação: "Separadas, as coleções que faltam custariam R$ Z."

Na África do Sul continua a lógica do crédito (igual aos funis da Lojou): "Você já pagou X, falta só Y", com preço final terminando em 7 e mínimo de R87.

## 4. Barra de progresso

"Você tem 1 de 5 coleções da VESPRO™", com a barra dourada. Coleção incompleta incomoda; a barra lembra disso a cada visita.

## 5. Ponte entre as duas áreas

A VESPRO Movies tem uma área só dela, separada da principal. Quem só tem wallpapers vê, no fim da página, o convite para a Movies; quem só tem a Movies vê o convite para a Signature. A aba "Movies" com cadeado no topo também chama atenção.

## 6. Lançamento de coleção (quando tiver uma nova)

Em `membros/config.js`, `proxima` mostra "Em breve: [nome da coleção]":
- Para VIP: "ela entra aqui sem custo" (reforça que o Acervo valeu a pena).
- Para os outros: "com o Acervo Completo, ela entra aqui sem custo" (empurra o Acervo).

Nos primeiros dias depois do lançamento, vale colocar a coleção nova como oferta principal com preço de membro.

## 7. Medição

Cada clique em oferta manda o evento `MembrosCliqueOferta` para o Pixel e o Clarity, com nome e valor. Cada download manda `MembrosDownload`. Com isso dá para:
- ver qual oferta da área mais vende;
- criar no Meta um público "clicou numa oferta da área e não comprou" para remarketing barato.

---

## Fora da página (próximos passos sugeridos)

**Sequência de e-mails (Klaviyo)**, puxando a pessoa de volta para a área:

| Dia | E-mail |
|---|---|
| 0 | Acesso liberado: link da área + como entrar com o código |
| 2 | "Já colocou o seu wallpaper?" com o guia rápido |
| 4 | Próximo passo dela (o mesmo da escada acima), preço de membro |
| 7 | Acervo Completo com o crédito do que ela já pagou |
| 14 | Coleção nova ou "artes que só os VIP têm" |

**Mais para frente:**
- Indique e ganhe: o cliente indica um amigo e ganha uma coleção quando o amigo compra.
- Assinatura mensal: uma coleção nova por mês, para quem não quer pagar o Acervo de uma vez.

---

## Preços sugeridos (conferir antes de criar os produtos)

Área do Brasil, em reais, na Wiapy. A área da África do Sul tem os preços dela em `membros-servidor/paises/za.js`.

| Oferta | Preço de membro |
|---|---|
| Completar a Signature (quem tem Essential) | R$ 9,90 (de R$ 21,90) |
| Shadows | R$ 9,90 (de R$ 14,90) |
| Sporting | R$ 9,90 (de R$ 14,90) |
| Shadows + Sporting | R$ 14,90 (de R$ 29,80) |
| VESPRO Movies | R$ 9,90 (de R$ 12,90) |
| Signature (quem só tem Movies) | R$ 12,90 (de R$ 21,90) |
| Acesso VIP (Acervo Completo) | R$ 37,90, exclusivo da área de membros |

Os preços ficam todos em `membros/config.js` (`lojas.br`). Enquanto o produto não existir na plataforma, o botão abre o WhatsApp do suporte com a mensagem pronta ("quero a oferta de membro: ...").
