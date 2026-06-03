#!/usr/bin/env python3
"""Mede a largura real (px) da linha mais larga do titulo, com a fonte ja carregada."""
import pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).parent.resolve()
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
JS = """() => {
  const cover = document.querySelector('.cover');
  const lns = [...cover.querySelectorAll('.title .ln')];
  let mx = 0;
  for (const ln of lns){
    const r = document.createRange();
    r.selectNodeContents(ln);
    mx = Math.max(mx, r.getBoundingClientRect().width);
  }
  const fs = parseFloat(getComputedStyle(cover.querySelector('.title')).fontSize);
  return {fontSize: fs, widest: mx};
}"""
def measure(html):
    p=(ROOT/html).resolve()
    with sync_playwright() as pw:
        b=pw.chromium.launch(executable_path=CHROME)
        pg=b.new_page(viewport={"width":1080,"height":1920}, device_scale_factor=1)
        pg.goto(p.as_uri())
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(500)
        res=pg.evaluate(JS)
        b.close()
        return res
for f,target in [("capa-texto.html",840),("capa-foto.html",702)]:
    r=measure(f)
    # margem de seguranca: usar 0.975 do limite
    final=int(r["widest"] and (r["fontSize"]*target*0.975/r["widest"]))
    print(f"{f}: fontSize={r['fontSize']} widest={r['widest']:.1f} -> alvo={target} => FONTE_FINAL={final}px")
