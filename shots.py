import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173'
ROOT = Path(__file__).resolve().parent
OUT = Path(os.environ.get('SHOTS_OUT', ROOT))
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')

def settle(pg, full=True):
    H = pg.evaluate('document.documentElement.scrollHeight'); vh = pg.viewport_size['height']
    if full:
        for y in range(0, H + vh, vh // 2):
            pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(50)
    pg.evaluate('Promise.race([new Promise(r=>setTimeout(r,4000)),Promise.all([...document.images].filter(i=>i.offsetParent).map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})))])')
    pg.evaluate('document.fonts.ready.then(()=>1)'); pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(700)
    return pg.evaluate('[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)')
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    ctx = br.new_context(viewport={'width': 1280, 'height': 860})
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(BASE + '/'); print('home broken', settle(pg)); pg.screenshot(path=str(OUT / 'shot-home.png'), full_page=True)
    pg.goto(BASE + '/shop'); print('shop broken', settle(pg)); pg.screenshot(path=str(OUT / 'shot-catalog.png'), full_page=True)
    pg.goto(BASE + '/products/dune-stoneware-mug'); print('prod broken', settle(pg)); pg.screenshot(path=str(OUT / 'shot-product.png'), full_page=True)
    pg.click('[data-testid=add-to-cart]'); pg.goto(BASE + '/products/flores-bajawa-coffee'); settle(pg, False)
    pg.click('text=500 g'); pg.click('[data-testid=add-to-cart]'); pg.wait_for_timeout(900)
    pg.evaluate('Promise.race([new Promise(r=>setTimeout(r,4000)),Promise.all([...document.querySelectorAll("[data-testid=cart-drawer] img")].map(i=>{i.loading="eager";return i.complete?1:new Promise(r=>{i.onload=i.onerror=r})}))])'); pg.wait_for_timeout(600)
    pg.screenshot(path=str(OUT / 'shot-cart.png'))
    pg.goto(BASE + '/checkout'); settle(pg, False); pg.screenshot(path=str(OUT / 'shot-checkout.png'), full_page=True)
    m = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    mp = m.new_page(); mp.goto(BASE + '/'); print('mobile broken', settle(mp)); mp.screenshot(path=str(OUT / 'shot-mobile.png'), full_page=True)
    print('mobile scrollWidth', mp.evaluate('document.documentElement.scrollWidth'))
    print('errors', errs)
    br.close()
