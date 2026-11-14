"""Gera as 3 páginas de upsell com desconto da compra (uma por checkout).

A fonte é acesso-total/index.html. Edite só ela e rode:
    python acesso-total/gerar_versoes.py

Cria acesso-total/essencial/, acesso-total/completa-oferta/ e acesso-total/completa/.
A página detecta a versão pelo endereço e usa os preços de window.VERSOES.
"""
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
VERSOES = ["essencial", "completa-oferta", "completa"]

with open(os.path.join(AQUI, "index.html"), encoding="utf-8") as f:
    fonte = f.read()

# a página fica uma pasta mais funda: ../assets vira ../../assets
pagina = re.sub(r"(?<![./\w])\.\./", "../../", fonte)
aviso = "<!-- GERADO por acesso-total/gerar_versoes.py a partir de acesso-total/index.html. Não edite aqui. -->\n"
pagina = pagina.replace("<!doctype html>\n", "<!doctype html>\n" + aviso, 1)

for v in VERSOES:
    pasta = os.path.join(AQUI, v)
    os.makedirs(pasta, exist_ok=True)
    with open(os.path.join(pasta, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(pagina)
    print("gerado:", f"acesso-total/{v}/index.html")
