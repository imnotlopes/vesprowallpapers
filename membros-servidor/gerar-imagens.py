"""Gera as imagens da área de membros SEM marca d'água (quem está na área já comprou).

Saída: assets/membros/limpas/<colecao>-NN.webp (miniaturas 400x225) e <colecao>-capa.webp (960x540).
Fontes limpas:
  - coleção principal: oil wallpaper/_site-limpas/desktop/NN.webp
  - VESPRO Movies:     filmes/Vespro movies/impasto__<nome>.jpg (originais fora do git)
  - Exclusivas:        oil wallpaper/capas/artes/*.webp
  - Shadows/Sporting:  oil wallpaper/capas/_gerador-lojou/img/*.jpg
Escolha das prévias: sem rostos de pessoas famosas na coleção principal.
Uso (na pasta landing Impasto): python membros-servidor/gerar-imagens.py
Depois, conferir que membros/config.js aponta para membros/limpas/...
"""
import os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "assets", "membros", "limpas")
LIMPAS = os.path.join(RAIZ, "oil wallpaper", "_site-limpas", "desktop")
FILMES = os.path.join(RAIZ, "filmes", "Vespro movies")
ARTES = os.path.join(RAIZ, "oil wallpaper", "capas", "artes")
LOJOU = os.path.join(RAIZ, "oil wallpaper", "capas", "_gerador-lojou", "img")
RECENTES = os.path.join(RAIZ, "oil wallpaper", "drive-signature-recentes")

def principal(n): return os.path.join(LIMPAS, n + ".webp")
def filme(nome): return os.path.join(FILMES, "impasto__" + nome + ".jpg")

COLECOES = {
    # capa primeiro, depois as miniaturas da prévia
    # Signature: artes mais recentes da pasta do Drive (30 adicionadas em 19/10/2026), versões de 1000 px
    # baixadas pela miniatura do Drive e guardadas em oil wallpaper/drive-signature-recentes/
    # (as 18 escolhidas pelo usuário em 21/11, na ordem da tela dele)
    "signature": [os.path.join(RECENTES, n + ".jpg") for n in [
        "hidroaviao-oceano",
        "rolex-already-late", "relogio-fuck-9-5", "porsche-palmeiras", "polo-nuvens", "polo-azul", "pantera-fonte",
        "no-risk-no-story", "monge-cha", "homem-terno-olhar", "homem-leoes-parede", "homem-estadio-vazio", "hidroaviao-oceano",
        "hercules-leao", "golfe-montanhas", "gladiador-crianca-vale", "frase-money-talks", "frase-iate-dinheiro", "frase-average-trap"]],
    "essencial": [principal(n) for n in ["13", "05", "09", "12", "13", "17", "27", "33", "45"]],
    "movies": [filme(n) for n in [
        "Batman - The Batman 2022 1",
        "Batman - The Batman 2022 1", "Batman - O Cavaleiro das Trevas 5", "O Poderoso Chefao 2",
        "Batman - O Cavaleiro das Trevas 1", "Peaky Blinders 1", "O Lobo de Wall Street 1", "Breaking Bad 3",
        "Os Bons Companheiros 2", "Batman - Begins 2", "Psicopata Americano 3", "Lupin 2", "Familia Soprano 3"]],
    "exclusivas": [os.path.join(ARTES, n + ".webp") for n in ["polo-nuvem", "polo-nuvem", "relogio-9-5", "no-risk-no-story"]],
    "shadows": [os.path.join(LOJOU, n + ".jpg") for n in ["shadows", "shadows", "dobermann", "multidao", "snowpb"]],
    "sporting": [os.path.join(LOJOU, n + ".jpg") for n in ["f1", "f1", "polojog", "iate", "conversivel"]],
}

def cobrir(im, w, h):
    s = max(w / im.width, h / im.height)
    im = im.resize((max(w, round(im.width * s)), max(h, round(im.height * s))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def main():
    os.makedirs(SAIDA, exist_ok=True)
    faltando = []
    for col, arquivos in COLECOES.items():
        for i, src in enumerate(arquivos):
            if not os.path.exists(src):
                faltando.append(src); continue
            im = Image.open(src).convert("RGB")
            if i == 0:
                cobrir(im, 960, 540).save(os.path.join(SAIDA, f"{col}-capa.webp"), "WEBP", quality=80, method=6)
            else:
                cobrir(im, 400, 225).save(os.path.join(SAIDA, f"{col}-{i:02d}.webp"), "WEBP", quality=78, method=6)
        print(f"{col}: capa + {len(arquivos) - 1} miniaturas")
    for f in faltando:
        print("FALTANDO:", f)

if __name__ == "__main__":
    main()
