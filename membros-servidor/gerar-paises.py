"""Gera a área de membros de cada país a partir da área do Brasil (/membros/).

A área do Brasil é a original: membros/index.html, app.js, textos.js e config.js.
Para cada país em PAISES, copia a página para a pasta do site daquele país,
monta o config.js (config do Brasil + o que muda no país, em paises/<país>.js)
e copia as imagens que a área usa e que o site do país ainda não tem.

Uso (na pasta landing Impasto):  python membros-servidor/gerar-paises.py
Depois, conferir no navegador e subir o site do país (só com "sobe").
"""
import filecmp
import os
import re
import shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)                      # landing Impasto
SITES = os.path.dirname(RAIZ)

PAISES = {
    # país: pasta do site do país, subpasta da área
    "za": {"site": os.path.join(SITES, "landing za"), "pasta": "members"},
}

ARQUIVOS = ["index.html", "app.js", "textos.js"]
SEMPRE = [  # imagens e fontes que a página usa fora do config
    "logo/vespro-logo-240.webp", "logo/favicon-32.png", "logo/apple-touch-icon.png",
    "fonts/inter-latin.woff2", "fonts/instrument-serif-italic-latin.woff2",
    "tex/impasto-navy.webp", "tex/impasto-shade-soft.webp",
]


def gerar(pais, info):
    origem = os.path.join(RAIZ, "membros")
    destino = os.path.join(info["site"], info["pasta"])
    if not os.path.isdir(info["site"]):
        print(f"[{pais}] pasta do site não encontrada: {info['site']}")
        return
    os.makedirs(destino, exist_ok=True)

    for nome in ARQUIVOS:
        texto = open(os.path.join(origem, nome), encoding="utf-8").read()
        texto = texto.replace("/membros/", "/" + info["pasta"] + "/")  # scripts apontam para a pasta da área
        open(os.path.join(destino, nome), "w", encoding="utf-8").write(texto)

    base = open(os.path.join(origem, "config.js"), encoding="utf-8").read()
    extra = open(os.path.join(AQUI, "paises", pais + ".js"), encoding="utf-8").read()
    aviso = (f"/* ARQUIVO GERADO por membros-servidor/gerar-paises.py: não edite aqui.\n"
             f"   Edite membros/config.js (comum) ou membros-servidor/paises/{pais}.js (só deste país). */\n")
    open(os.path.join(destino, "config.js"), "w", encoding="utf-8").write(aviso + base + "\n" + extra)

    # imagens usadas: caminhos dentro de "..." que terminam em .webp no config + as fixas
    usadas = set(SEMPRE) | set(re.findall(r'"([\w./-]+\.webp)"', base + extra))
    copiadas = 0
    for rel in sorted(usadas):
        de = os.path.join(RAIZ, "assets", rel)
        para = os.path.join(info["site"], "assets", rel)
        if not os.path.exists(de):
            print(f"[{pais}] faltando no Brasil: assets/{rel}")
            continue
        if not os.path.exists(para) or not filecmp.cmp(de, para, shallow=False):  # nova ou mudou
            os.makedirs(os.path.dirname(para), exist_ok=True)
            shutil.copyfile(de, para)
            copiadas += 1
    print(f"[{pais}] área gerada em {destino} ({copiadas} imagens copiadas)")


if __name__ == "__main__":
    for p, i in PAISES.items():
        gerar(p, i)
