#!/usr/bin/env python3
"""Renderiza cada .cover dos HTMLs em PNG 1080x1920 para ./saida/."""
import sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).parent.resolve()
SAIDA = ROOT / "saida"; SAIDA.mkdir(exist_ok=True)
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PADRAO = ["capa-texto.html", "capa-foto.html"]


def render(html_file: str):
    caminho = (ROOT / html_file).resolve()
    if not caminho.exists():
        print(f"[pular] nao encontrei {html_file}"); return
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME)
        pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        pg.goto(caminho.as_uri())
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(500)
        ids = pg.eval_on_selector_all(".cover", "els => els.map(e => e.id)")
        for cid in ids:
            if not cid:
                continue
            pg.locator(f'[id="{cid}"]').screenshot(path=str(SAIDA / f"{cid}.png"))
            print(f"[ok] {html_file} -> saida/{cid}.png")
        b.close()


if __name__ == "__main__":
    for a in (sys.argv[1:] or PADRAO):
        render(a)
    print("\nConcluido. PNGs em ./saida/")
