import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TOOLS = Path(__file__).resolve().parent
PUBLIC = ROOT / 'public'
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')

with sync_playwright() as p:
    br = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox', '--allow-file-access-from-files'])
    pg = br.new_page(viewport={'width': 1200, 'height': 630})
    pg.goto((TOOLS / 'og.html').as_uri()); pg.evaluate('document.fonts.ready.then(()=>1)'); pg.wait_for_timeout(800)
    og_tmp = Path('/tmp/og.png')
    pg.screenshot(path=str(og_tmp))
    for s, name in [(180, 'apple-touch-icon.png'), (32, 'favicon-32.png'), (512, 'icon-512.png')]:
        q = br.new_page(viewport={'width': s, 'height': s})
        icon_html = TOOLS / '_icon.html'
        icon_html.write_text(f'<body style="margin:0"><img src="../public/favicon.svg" width="{s}" height="{s}" style="display:block"></body>')
        q.goto(icon_html.as_uri())
        q.wait_for_timeout(300); q.screenshot(path=str(PUBLIC / name), omit_background=True); q.close()
    br.close()
Image.open(og_tmp).convert('RGB').save(PUBLIC / 'og-image.jpg', quality=86)
print('ok')
