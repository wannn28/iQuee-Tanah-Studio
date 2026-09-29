/* Seed data: the 16 Tanah Studio products + 4 categories that were previously hard-coded in the
 * frontend (src/data/products.ts). Prices are in whole USD here and converted to cents on insert. */
export interface SeedOptionValue { label: string; priceDelta?: number; image?: number; swatch?: string }
export interface SeedProduct {
  id: string; slug: string; name: string; category: string; price: number; compareAt?: number
  images: { src: string; alt: string }[]; short: string; description: string[]; details: string[]
  options: { name: string; values: SeedOptionValue[] }[]; badge?: string; featured?: boolean; added: number
}
export interface SeedCategory { id: string; name: string; blurb: string; image: string }

export const categories: SeedCategory[] = [
  { id: 'cups', name: 'Cups & Mugs', blurb: 'Everyday vessels, thrown by hand.', image: 'cat-cups' },
  { id: 'brewing', name: 'Brewing', blurb: 'Tools and beans for a slower cup.', image: 'cat-brewing' },
  { id: 'tableware', name: 'Tableware', blurb: 'Plates and bowls for long dinners.', image: 'cat-tableware' },
  { id: 'home', name: 'Home & Vases', blurb: 'Quiet forms for sills and shelves.', image: 'cat-home' },
]

export const products: SeedProduct[] = [
  {
    id: 'p01', slug: 'dune-stoneware-mug', name: 'Dune Stoneware Mug', category: 'cups', price: 34,
    images: [
      { src: 'dune-mug-1', alt: 'Two Dune mugs, one sand and one charcoal, on a wooden board' },
      { src: 'dune-mug-2', alt: 'Pair of matte white Dune mugs against a pale grey wall' },
      { src: 'dune-mug-3', alt: 'Dune mugs with dark rims on a white tiled counter' },
    ],
    short: 'Our house mug. Satin glaze, generous handle, a rim that feels right.',
    description: [
      'The Dune is the first mug we ever sold and still the one we reach for every morning. Thrown from a West Javan stoneware body, then dipped in a satin glaze that breaks softly over the throwing lines.',
      'Every piece is made by hand in small batches, so the glaze and shape vary slightly from mug to mug. We think that is the point.',
    ],
    details: ['Stoneware, satin glaze', 'Dishwasher & microwave safe', 'Handmade, slight variations', 'Ships in recycled paper packaging'],
    options: [
      { name: 'Color', values: [{ label: 'Sand', swatch: '#D8CFC2', image: 0 }, { label: 'Chalk', swatch: '#F1EFEA', image: 1 }, { label: 'Charcoal', swatch: '#3A3733', image: 0 }] },
      { name: 'Size', values: [{ label: '8 oz' }, { label: '12 oz', priceDelta: 4 }] },
    ],
    badge: 'Bestseller', featured: true, added: 1,
  },
  {
    id: 'p02', slug: 'ember-espresso-cups', name: 'Ember Espresso Cups, Set of 2', category: 'cups', price: 38,
    images: [
      { src: 'ember-espresso-1', alt: 'Two small ash-glazed espresso cups with espresso on a stone table' },
      { src: 'ember-espresso-2', alt: 'Ember espresso cups seen from above in soft daylight' },
    ],
    short: 'Thick-walled cups that hold heat and crema. Sold as a pair.',
    description: [
      'A squat, thick-walled cup for espresso and cortados. The heavy base keeps your shot warm while the tapered lip concentrates the aroma.',
      'Glazed inside, raw clay foot outside, so it sits steadily on a saucer or straight on the counter.',
    ],
    details: ['90 ml capacity', 'Set of two cups', 'Stoneware, ash glaze', 'Dishwasher safe'],
    options: [{ name: 'Color', values: [{ label: 'Ash', swatch: '#C9C4BB' }, { label: 'Bone', swatch: '#EDE6D8' }] }],
    featured: true, added: 6,
  },
  {
    id: 'p03', slug: 'merapi-tumbler', name: 'Merapi Tumbler', category: 'cups', price: 28,
    images: [{ src: 'merapi-tumbler-1', alt: 'Speckled grey handleless Merapi tumblers stacked on a wooden table' }],
    short: 'A handleless cup with volcanic speckle, named for the mountain.',
    description: [
      'Iron-rich clay gives the Merapi its freckled finish, a nod to the volcanic soil near our studio. Use it for pour-over, tea or a short glass of wine.',
    ],
    details: ['200 ml capacity', 'Iron-speckle stoneware', 'Dishwasher safe', 'Stackable'],
    options: [{ name: 'Color', values: [{ label: 'Iron Speckle', swatch: '#8A8177' }, { label: 'Ash Glaze', swatch: '#BDB6AA' }] }],
    added: 9,
  },
  {
    id: 'p04', slug: 'sabana-cup-and-saucer', name: 'Sabana Cup & Saucer', category: 'cups', price: 42,
    images: [
      { src: 'sabana-cup-honey', alt: 'Honey-glazed Sabana cup and saucer with a flat white on a marble table' },
      { src: 'sabana-cup-cobalt', alt: 'Cobalt Sabana cup and saucer holding a latte with heart art' },
    ],
    short: 'A wide latte cup for milk drinks, with a saucer that actually fits.',
    description: [
      'Wide enough for latte art, shallow enough to drink from comfortably. The saucer has a recessed well so the cup stays put on the walk from the machine.',
    ],
    details: ['240 ml capacity', 'Porcelain-stoneware blend', 'Glossy glaze', 'Dishwasher safe'],
    options: [{ name: 'Color', values: [{ label: 'Honey', swatch: '#B9874A', image: 0 }, { label: 'Cobalt', swatch: '#5C86C4', image: 1 }] }],
    badge: 'New', featured: true, added: 15,
  },
  {
    id: 'p05', slug: 'arc-pour-over-dripper', name: 'Arc Pour-Over Dripper', category: 'brewing', price: 46,
    images: [
      { src: 'arc-dripper-1', alt: 'Hands pouring water from a glass pitcher into a white Arc ceramic dripper' },
      { src: 'arc-dripper-2', alt: 'Arc dripper brewing coffee over a glass server on a digital scale' },
    ],
    short: 'A cone dripper with deep spiral ribs for an even, clean extraction.',
    description: [
      'The Arc takes standard #02 cone filters. Spiral ribs keep the paper off the walls so water flows evenly through the bed, which gives you a clear, sweet cup without much fuss.',
      'Pre-heat it with hot water: ceramic holds temperature far better than plastic.',
    ],
    details: ['Brews 1–4 cups', 'Fits #02 cone filters', 'Glazed stoneware', 'Includes 40 filters'],
    options: [{ name: 'Color', values: [{ label: 'Bone', swatch: '#EFEBE3' }, { label: 'Moss', swatch: '#6E7A5A' }] }],
    featured: true, added: 5,
  },
  {
    id: 'p06', slug: 'slow-pour-kettle', name: 'Slow Pour Kettle 0.9 L', category: 'brewing', price: 89, compareAt: 105,
    images: [
      { src: 'slow-pour-kettle-1', alt: 'Matte black gooseneck kettle next to a coffee grinder' },
      { src: 'slow-pour-kettle-2', alt: 'Slow Pour kettle pouring into a black cone dripper' },
    ],
    short: 'A stovetop gooseneck kettle with a precise, steady pour.',
    description: [
      'Stainless steel with a matte powder coat and a thin gooseneck spout for full control over flow rate. Works on gas, electric and induction.',
    ],
    details: ['0.9 L capacity', 'Stainless steel, matte finish', 'Induction compatible', 'Built-in thermometer port'],
    options: [{ name: 'Finish', values: [{ label: 'Matte Black', swatch: '#1E1E1E' }, { label: 'Brushed Steel', swatch: '#B7B7B2' }] }],
    badge: 'Sale', added: 4,
  },
  {
    id: 'p07', slug: 'clear-glass-server', name: 'Clear Glass Server', category: 'brewing', price: 32,
    images: [
      { src: 'clear-server-1', alt: 'Glass coffee server filled with filter coffee on a bamboo table' },
      { src: 'clear-server-2', alt: 'Glass server on a pale yellow and mint background' },
    ],
    short: 'Heat-resistant borosilicate glass, for sharing a pot.',
    description: ['Pairs with the Arc dripper. Borosilicate glass handles boiling water and a quick trip to the fridge for iced coffee.'],
    details: ['Borosilicate glass', 'Dishwasher safe', 'Measurement marks'],
    options: [{ name: 'Size', values: [{ label: '400 ml' }, { label: '600 ml', priceDelta: 6 }] }],
    added: 8,
  },
  {
    id: 'p08', slug: 'flores-bajawa-coffee', name: 'Flores Bajawa Coffee', category: 'brewing', price: 19,
    images: [
      { src: 'flores-bajawa-1', alt: 'Roasted Flores Bajawa coffee beans in an open paper bag' },
      { src: 'flores-bajawa-2', alt: 'Coffee beans spilling from a burlap sack onto a dark surface' },
    ],
    short: 'Washed Arabica from Flores. Brown sugar, cacao nib, a little spice.',
    description: [
      'Grown at 1,400 m around the Inerie volcano and roasted for filter every Monday. Sweet and round with a gentle spice finish. Excellent in the Arc dripper.',
    ],
    details: ['Origin: Bajawa, Flores, Indonesia', 'Process: washed', 'Roast: light-medium', 'Roasted to order'],
    options: [
      { name: 'Size', values: [{ label: '250 g' }, { label: '500 g', priceDelta: 15 }, { label: '1 kg', priceDelta: 36 }] },
      { name: 'Grind', values: [{ label: 'Whole bean' }, { label: 'Filter' }, { label: 'Espresso' }] },
    ],
    featured: true, added: 12,
  },
  {
    id: 'p09', slug: 'west-java-frinsa-natural', name: 'West Java Frinsa Natural', category: 'brewing', price: 22,
    images: [
      { src: 'java-frinsa-1', alt: 'Coffee beans spilling from a dark bag onto a wooden table' },
      { src: 'java-frinsa-2', alt: 'Roasted coffee beans scattered on a mint background' },
    ],
    short: 'Natural-process lot from Frinsa estate. Jammy, ripe and bright.',
    description: ['Dried whole in the cherry for four weeks on raised beds. Expect strawberry jam, dark chocolate and a winey finish. A crowd-pleaser as espresso.'],
    details: ['Origin: Mt. Tilu, West Java', 'Process: natural', 'Roast: medium', 'Roasted to order'],
    options: [
      { name: 'Size', values: [{ label: '250 g' }, { label: '500 g', priceDelta: 17 }] },
      { name: 'Grind', values: [{ label: 'Whole bean' }, { label: 'Filter' }, { label: 'Espresso' }] },
    ],
    badge: 'Limited', added: 14,
  },
  {
    id: 'p10', slug: 'kawi-dinner-plate', name: 'Kawi Dinner Plate', category: 'tableware', price: 36,
    images: [
      { src: 'kawi-plate-1', alt: 'Stacks of white Kawi stoneware plates in the studio' },
      { src: 'kawi-plate-2', alt: 'Rows of white Kawi plates laid out to dry' },
    ],
    short: 'A wide-rimmed plate in soft white, the backbone of the table.',
    description: ['Glazed in our warm white with an unglazed edge that frames food beautifully. Strong enough for daily use, pretty enough for guests.'],
    details: ['Stoneware, satin white', 'Dishwasher & microwave safe', 'Chip-resistant rim'],
    options: [{ name: 'Size', values: [{ label: '21 cm side' }, { label: '27 cm dinner', priceDelta: 8 }] }],
    featured: true, added: 3,
  },
  {
    id: 'p11', slug: 'nest-bowl-set', name: 'Nest Bowl Set of 3', category: 'tableware', price: 78,
    images: [
      { src: 'nest-bowls-1', alt: 'Three nesting bowls in grey, white and red, seen from above' },
      { src: 'nest-bowls-2', alt: 'Nest bowls with plates and a cup on a dark table' },
    ],
    short: 'Three sizes that stack neatly: prep, serve, snack.',
    description: ['Each bowl has a contrasting interior glaze. Stack them in the cupboard, spread them across the table.'],
    details: ['Diameters 12, 16 & 20 cm', 'Stoneware', 'Dishwasher safe'],
    options: [],
    added: 10,
  },
  {
    id: 'p12', slug: 'laut-serving-bowl', name: 'Laut Serving Bowl', category: 'tableware', price: 64,
    images: [{ src: 'laut-bowl-1', alt: 'Large speckled blue Laut serving bowl on a weathered surface' }],
    short: 'A deep bowl with a sea-spray glaze. Big enough for salad for six.',
    description: ['Laut means “sea” in Indonesian. The blue glaze pools in the centre and thins to speckled white at the rim, so no two bowls are alike.'],
    details: ['28 cm diameter', 'Hand-glazed stoneware', 'Hand wash recommended'],
    options: [],
    badge: 'One of a kind', added: 13,
  },
  {
    id: 'p13', slug: 'hearth-teapot', name: 'Hearth Teapot 800 ml', category: 'tableware', price: 72,
    images: [
      { src: 'hearth-teapot-oat', alt: 'Oat-coloured Hearth teapot surrounded by loose tea leaves' },
      { src: 'hearth-teapot-white', alt: 'White Hearth teapot on a pale pedestal' },
    ],
    short: 'A round-bellied teapot with a built-in strainer and a clean-cut spout.',
    description: ['The spout is trimmed by hand so it pours without dripping. Inside, a pierced clay strainer holds loose leaves back.'],
    details: ['800 ml capacity', 'Built-in strainer', 'Stoneware', 'Dishwasher safe'],
    options: [{ name: 'Color', values: [{ label: 'Oat', swatch: '#DDD0BC', image: 0 }, { label: 'White', swatch: '#F4F2EE', image: 1 }] }],
    featured: true, added: 7,
  },
  {
    id: 'p14', slug: 'pebble-bud-vase', name: 'Pebble Bud Vase', category: 'home', price: 26,
    images: [{ src: 'pebble-vase-1', alt: 'Small cream Pebble bud vase against a blush wall' }],
    short: 'A palm-sized vase for a single stem.',
    description: ['For the one flower you picked on the way home. Unglazed outside for a stone-like feel, glazed inside so it holds water.'],
    details: ['10 cm tall', 'Stoneware', 'Watertight'],
    options: [],
    added: 11,
  },
  {
    id: 'p15', slug: 'ridge-vase', name: 'Ridge Vase', category: 'home', price: 58,
    images: [{ src: 'ridge-vase-1', alt: 'Two textured Ridge vases in blush and slate against a plaster wall' }],
    short: 'Carved by hand, line after line, before the first firing.',
    description: ['Each ridge is carved into the leather-hard clay with a loop tool, then left matte to catch the light.'],
    details: ['24 cm tall', 'Carved stoneware, matte', 'Watertight'],
    options: [{ name: 'Color', values: [{ label: 'Blush', swatch: '#CDB6AA' }, { label: 'Slate', swatch: '#7F8A8A' }] }],
    featured: true, added: 2,
  },
  {
    id: 'p16', slug: 'twin-bottle-vases', name: 'Twin Bottle Vases, Pair', category: 'home', price: 68,
    images: [
      { src: 'twin-vases-1', alt: 'Two cream bottle vases with raw clay bases on a wooden tray' },
      { src: 'cat-home', alt: 'Bottle vases with dried grass on a linen-covered table' },
    ],
    short: 'Half-dipped bottles in raw clay and cream glaze. Sold as a pair.',
    description: ['We dip each bottle halfway by hand, leaving the raw clay exposed below. Beautiful empty, even better with dried grasses.'],
    details: ['18 & 14 cm tall', 'Stoneware, part glazed', 'Watertight'],
    options: [],
    badge: 'New', added: 16,
  },
]


export const promoCodes = [
  { code: 'DEMO10', label: '10% off your order', percentOff: 10, freeShipping: false },
  { code: 'FREESHIP', label: 'Free standard shipping', percentOff: 0, freeShipping: true },
]
