import os
import sys, re
from playwright.sync_api import sync_playwright, expect
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173'
CHROME = os.environ.get('CHROME_PATH', '/usr/bin/google-chrome')
ok = lambda m: print('PASS', m)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    for label, vp, mobile in [('desktop', {'width': 1280, 'height': 860}, False), ('mobile', {'width': 390, 'height': 844}, True)]:
        print(f'--- {label} ---')
        ctx = br.new_context(viewport=vp, is_mobile=mobile, has_touch=mobile)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        # deep link directly (refresh-safe routing)
        pg.goto(BASE + '/shop?category=cups'); expect(pg.get_by_role('heading', level=1)).to_have_text('Cups & Mugs'); ok('deep link /shop?category=cups')
        expect(pg.get_by_test_id('result-count')).to_contain_text('4 pieces')
        pg.goto(BASE + '/shop'); pg.fill('#shop-q', 'coffee'); expect(pg.get_by_test_id('result-count')).to_contain_text('for “coffee”'); ok('search: ' + pg.get_by_test_id('result-count').inner_text())
        pg.fill('#shop-q', ''); pg.select_option('select[aria-label="Sort products"]', 'price-desc')
        first = pg.locator('section[aria-label=Products] article h3').first.inner_text(); assert first.startswith('Slow Pour'), first; ok('sort price desc -> ' + first)
        pg.goto(BASE + '/shop?max=30'); n = pg.locator('section[aria-label=Products] article').count(); assert n == 4, n; ok(f'price range max=30 -> {n} items')
        # product detail, variants, qty
        pg.goto(BASE + '/shop'); pg.locator('article a[href="/products/dune-stoneware-mug"]').first.click()
        expect(pg).to_have_url(re.compile('/products/dune-stoneware-mug')); ok('open product')
        pg.get_by_text('Charcoal', exact=True).click(); pg.get_by_text('12 oz', exact=False).click()
        expect(pg.get_by_test_id('product-price')).to_have_text('$38.00'); ok('variant price 12oz = $38')
        pg.get_by_role('button', name='Increase quantity').click()
        pg.get_by_test_id('add-to-cart').click()
        drawer = pg.get_by_test_id('cart-drawer'); expect(drawer).to_contain_text('Charcoal · 12 oz'); expect(drawer).to_contain_text('$76.00'); ok('drawer opened with 2x Dune Charcoal 12oz ($76)')
        pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
        # second product from related / direct
        pg.goto(BASE + '/products/hearth-teapot'); pg.get_by_test_id('add-to-cart').click(); pg.wait_for_timeout(300)
        # persistence across reload
        pg.goto(BASE + '/cart'); pg.reload(); expect(pg.locator('section[aria-label="Cart items"] li', has_text='Hearth Teapot')).to_have_count(1); ok('cart persisted after reload (localStorage)')
        # qty edit & remove in cart page
        row = pg.locator('section[aria-label="Cart items"] li', has_text='Hearth Teapot')
        row.get_by_role('button', name='Increase quantity').click()
        expect(pg.locator('aside[aria-label="Order summary"]')).to_contain_text('$220.00'); ok('qty edit -> subtotal $220')
        row.get_by_role('button', name='Decrease quantity').click()
        pg.goto(BASE + '/products/pebble-bud-vase'); pg.get_by_test_id('add-to-cart').click(); pg.wait_for_timeout(300)
        pg.goto(BASE + '/cart'); pg.locator('section[aria-label="Cart items"] li', has_text='Pebble').get_by_role('button', name='Remove').click()
        expect(pg.locator('section[aria-label="Cart items"] li', has_text='Pebble')).to_have_count(0); ok('remove item')
        # promo
        pg.fill('#promo', 'WRONG'); pg.get_by_role('button', name='Apply').click(); expect(pg.locator('#promo-msg')).to_contain_text('isn’t a valid code'); ok('invalid promo rejected')
        pg.fill('#promo', 'demo10'); pg.get_by_role('button', name='Apply').click()
        aside = pg.locator('aside[aria-label="Order summary"]'); expect(aside).to_contain_text('Discount (DEMO10)'); expect(aside).to_contain_text('−$14.80'); ok('DEMO10 applied: -$14.80 on $148')
        # standard ship free over 120 after discount (133.20) -> total 133.20
        expect(pg.locator('main').get_by_test_id('order-total')).to_have_text('$133.20'); ok('total $133.20 (free shipping over $120)')
        pg.get_by_role('link', name=re.compile('^Checkout')).click(); expect(pg).to_have_url(re.compile('/checkout'))
        pg.reload(); ok('checkout survives refresh')
        expect(pg.get_by_test_id('discount')).to_have_text('−$14.80')
        # validation
        pg.get_by_test_id('place-order').click(); expect(pg.get_by_role('alert')).to_contain_text('Please fix'); ok('validation: ' + pg.get_by_role('alert').inner_text())
        assert pg.evaluate('document.activeElement.id') == 'email'; ok('focus moved to first invalid field')
        pg.fill('#email', 'not-an-email'); pg.locator('#phone').focus(); expect(pg.locator('#email-err')).to_contain_text('valid email'); ok('email format error')
        pg.fill('#email', 'jane@example.com'); pg.fill('#firstName', 'Jane'); pg.fill('#lastName', 'Cooper')
        pg.fill('#address1', '221 Maple Street'); pg.fill('#city', 'Portland'); pg.fill('#region', 'OR'); pg.fill('#postal', '97205')
        pg.get_by_text('Express', exact=True).click(); expect(pg.get_by_test_id('checkout-total')).to_have_text('$155.20'); ok('express shipping -> $155.20')
        pg.fill('#cardName', 'Jane Cooper')
        pg.get_by_test_id('place-order').click()
        expect(pg).to_have_url(re.compile(r'/order/TNH-\d{6}'), timeout=5000)
        num = pg.get_by_test_id('order-number').inner_text(); ok('confirmation reached, order ' + num)
        expect(pg.locator('main')).to_contain_text('$155.20')
        pg.reload(); expect(pg.get_by_test_id('order-number')).to_have_text(num); ok('confirmation deep route survives refresh')
        assert pg.evaluate("JSON.parse(localStorage.getItem('tanah.cart.v1')).length") == 0; ok('cart cleared after order')
        pg.goto(BASE + '/does-not-exist'); expect(pg.get_by_role('heading', level=1)).to_contain_text('Cracked'); ok('404 route')
        sw = pg.evaluate('document.documentElement.scrollWidth'); assert sw <= vp['width'], sw; ok(f'no horizontal overflow ({sw})')
        print('console errors:', errs)
        ctx.close()
    br.close()
print('ALL FLOW TESTS PASSED')
