"""Gera as páginas de downsell (Coleções + 200 exclusivas, sem VIP), uma por checkout.

A fonte é colecoes/index.html. Edite só ela e rode:
    python colecoes/gerar_versoes.py

Cria uma pasta por versão: essencial, completa-oferta, completa (página principal) e
movies, movies-signature-oferta, movies-signature (página /filmes/).
A página detecta a versão pelo endereço e usa os preços de window.VERSOES.
"""
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
VERSOES = ["essencial", "completa-oferta", "completa", "movies", "movies-signature-oferta", "movies-signature"]

with open(os.path.join(AQUI, "index.html"), encoding="utf-8") as f:
    fonte = f.read()

# a página fica uma pasta mais funda: ../assets vira ../../assets
pagina = re.sub(r"(?<![./\w])\.\./", "../../", fonte)
aviso = "<!-- GERADO por colecoes/gerar_versoes.py a partir de colecoes/index.html. Não edite aqui. -->\n"
pagina = pagina.replace("<!doctype html>\n", "<!doctype html>\n" + aviso, 1)

for v in VERSOES:
    pasta = os.path.join(AQUI, v)
    os.makedirs(pasta, exist_ok=True)
    with open(os.path.join(pasta, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(pagina)
    print("gerado:", f"colecoes/{v}/index.html")
