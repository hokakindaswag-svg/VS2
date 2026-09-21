/* =========================================================================
   MAISON FLEUR — DONNÉES DU CATALOGUE
   -------------------------------------------------------------------------
   TOUT LE CONTENU ÉDITABLE DU SITE SE TROUVE DANS CE FICHIER.
   Pour brancher de vraies photos / prix / stocks :
     · remplacer `image` par le chemin d’une vraie photo (.jpg / .webp)
     · modifier `PRICES` pour changer les prix
     · modifier `notes`, `description`, `name` pour chaque parfum
     · `inStock: false` masque le bouton d’ajout et affiche "Épuisé"
   ========================================================================= */

const BRAND = {
  name: 'MAISON FLEUR',
  tagline: 'Sens bon. Sens-toi chère.',
  email: 'hello@maisonfleur.fr',
  instagram: 'https://instagram.com',
  tiktok: 'https://tiktok.com',
  currency: '€',
};

/* --- PRIX ------------------------------------------------------------- */
const PRICES = {
  mist: 9.99,          // Brume parfumée 250 ml
  lotion: 9.99,        // Lait parfumé 236 ml
  duo: 19.99,          // OFFRE PHARE : 2 produits au choix
};

const TYPES = {
  mist:   { id: 'mist',   label: 'Brume parfumée', short: 'Brume', size: '250 ml', price: PRICES.mist },
  lotion: { id: 'lotion', label: 'Lait parfumé',   short: 'Lait',  size: '236 ml', price: PRICES.lotion },
};

/* --- LES 8 PARFUMS ---------------------------------------------------- */
const SCENTS = [
  {
    slug: 'bare-vanilla',
    name: 'Bare Vanilla',
    notes: ['Vanille', 'Crème fouettée', 'Musc doux'],
    family: 'Gourmand',
    intensity: 3,
    mood: 'Sweet Girl',
    description: "Une vanille crémeuse et douce, faite pour les matins sucrés, les nuits tardives et tout ce qu’il y a entre les deux.",
    longNote: "Un nuage de vanille bourbon adouci par une crème fouettée et un musc de peau. Le genre de parfum qu’on te complimente sans savoir pourquoi.",
    colors: { bg: '#F6EADF', deep: '#C29466', ink: '#6B4A2E' },
    bestseller: true,
    image: null, // ← remplacer par 'assets/img/photos/bare-vanilla.jpg'
  },
  {
    slug: 'pure-seduction',
    name: 'Pure Seduction',
    notes: ['Fruité', 'Sucré', 'Sensuel'],
    family: 'Fruité',
    intensity: 4,
    mood: 'Hot Girl',
    description: "Prune rouge, freesia et une traîne sucrée qui reste sur la peau bien après ton départ.",
    longNote: "L’icône. Fruits rouges juteux, fleurs blanches et fond sensuel — un parfum qui fait tourner les têtes.",
    colors: { bg: '#F9D3DF', deep: '#B22C57', ink: '#6E1730' },
    bestseller: true,
    image: null,
  },
  {
    slug: 'love-spell',
    name: 'Love Spell',
    notes: ['Pêche', 'Cerise', 'Floral'],
    family: 'Fruité floral',
    intensity: 3,
    mood: 'Romantic Girl',
    description: "Pêche juteuse, cerise et fleurs fraîches. Le parfum qu’on te vole dans ta salle de bain.",
    longNote: "Un sortilège en trois temps : pêche craquante, cerise confite, bouquet de fleurs blanches.",
    colors: { bg: '#FBD5CB', deep: '#D4425A', ink: '#7B2233' },
    bestseller: true,
    image: null,
  },
  {
    slug: 'velvet-petals',
    name: 'Velvet Petals',
    notes: ['Amande', 'Floral', 'Crémeux'],
    family: 'Floral poudré',
    intensity: 2,
    mood: 'Pretty Girl',
    description: "Amande douce et pétales crémeux. Un voile poudré, joli et discret, comme une peau propre.",
    longNote: "Le parfum « jolie fille » par excellence : amande, pivoine et un fond de cachemire.",
    colors: { bg: '#EFDCEC', deep: '#A2678F', ink: '#5E3552' },
    bestseller: true,
    image: null,
  },
  {
    slug: 'coconut-passion',
    name: 'Coconut Passion',
    notes: ['Coco', 'Vanille', 'Chaleur'],
    family: 'Solaire gourmand',
    intensity: 3,
    mood: 'Vacation Girl',
    description: "Coco crémeuse et vanille chaude. Des vacances qui ne finissent jamais, sur ta peau.",
    longNote: "Lait de coco, vanille solaire et un souffle de monoï. Effet bronzage instantané, sans le soleil.",
    colors: { bg: '#F7EBD8', deep: '#C08A50', ink: '#6D4A24' },
    bestseller: false,
    image: null,
  },
  {
    slug: 'amber-romance',
    name: 'Amber Romance',
    notes: ['Ambre', 'Vanille', 'Musc chaud'],
    family: 'Ambré',
    intensity: 5,
    mood: 'After Dark',
    description: "Ambre chaud, vanille noire et musc. Le parfum des soirées qui se terminent tard.",
    longNote: "Dense, cocooning, addictif. Ambre, bois doux et vanille fumée pour un sillage qui reste.",
    colors: { bg: '#F2DCC5', deep: '#9A5B2E', ink: '#5A3117' },
    bestseller: true,
    image: null,
  },
  {
    slug: 'aqua-kiss',
    name: 'Aqua Kiss',
    notes: ['Frais', 'Aquatique', 'Floral'],
    family: 'Frais',
    intensity: 2,
    mood: 'Clean Girl',
    description: "Frais, aquatique, propre. L’effet « sortie de douche » toute la journée.",
    longNote: "Notes d’eau, muguet et musc blanc. Le clean girl aesthetic en format brume.",
    colors: { bg: '#DEEAEF', deep: '#5589A0', ink: '#2F5566' },
    bestseller: false,
    image: null,
  },
  {
    slug: 'midnight-bloom',
    name: 'Midnight Bloom',
    notes: ['Floral sombre', 'Musc', 'Notes chaudes'],
    family: 'Floral sombre',
    intensity: 5,
    mood: 'After Dark',
    description: "Fleurs noires, musc et chaleur. Pour les nuits où tu es la meilleure version de toi.",
    longNote: "Jasmin de nuit, iris sombre et musc velouté. Mystérieux, adulte, jamais sage.",
    colors: { bg: '#E0D3E4', deep: '#5A3B6B', ink: '#301C3D' },
    bestseller: true,
    image: null,
  },
];

/* --- SHOP BY MOOD ----------------------------------------------------- */
const MOODS = [
  { id: 'sweet',    title: 'SWEET GIRL',    line: 'Sucrée, douce, câline',        scents: ['bare-vanilla'] },
  { id: 'hot',      title: 'HOT GIRL',      line: 'Sensuelle, fruitée, magnétique', scents: ['pure-seduction'] },
  { id: 'romantic', title: 'ROMANTIC GIRL', line: 'Pêche, cerise, fleurs',         scents: ['love-spell'] },
  { id: 'pretty',   title: 'PRETTY GIRL',   line: 'Poudrée, amande, jolie',        scents: ['velvet-petals'] },
  { id: 'vacation', title: 'VACATION GIRL', line: 'Coco, vanille, soleil',         scents: ['coconut-passion'] },
  { id: 'dark',     title: 'AFTER DARK',    line: 'Ambre, fleurs noires, musc',    scents: ['amber-romance', 'midnight-bloom'] },
  { id: 'clean',    title: 'CLEAN GIRL',    line: 'Frais, propre, aquatique',      scents: ['aqua-kiss'] },
];

/* --- SUPERPOSITION / LAYERING ----------------------------------------- */
const LAYERS = [
  { a: 'bare-vanilla',  b: 'coconut-passion', label: 'Vanille solaire',  line: 'Crémeux + coco chaude. Effet peau bronzée.' },
  { a: 'love-spell',    b: 'velvet-petals',   label: 'Bouquet sucré',    line: 'Pêche + amande poudrée. Doux et joli.' },
  { a: 'pure-seduction',b: 'bare-vanilla',    label: 'Fruité gourmand',  line: 'Fruits rouges + vanille. Le combo signature.' },
  { a: 'amber-romance', b: 'midnight-bloom',  label: 'Sillage de nuit',  line: 'Ambre + fleurs sombres. Pour les soirées.' },
];

/* --- COFFRETS / IDÉES CADEAUX ----------------------------------------- */
const GIFTS = [
  { title: 'LE DUO BESTIE',   line: 'Une pour toi, une pour elle.',        scents: ['love-spell', 'bare-vanilla'],        types: ['mist', 'mist'] },
  { title: 'LE DUO COCOON',   line: 'Brume + lait, même parfum.',          scents: ['velvet-petals', 'velvet-petals'],    types: ['mist', 'lotion'] },
  { title: 'LE DUO AFTER DARK',line: 'Deux sillages pour la nuit.',        scents: ['amber-romance', 'midnight-bloom'],   types: ['mist', 'lotion'] },
  { title: 'LE DUO VACANCES', line: 'Coco + vanille, peau douce.',         scents: ['coconut-passion', 'bare-vanilla'],   types: ['lotion', 'mist'] },
];

/* --- UGC / TIKTOK ------------------------------------------------------ */
const UGC = [
  { handle: '@camillelpt',  comment: 'best odeur de chez VS ♡', likes: '12,4k', scent: 'bare-vanilla' },
  { handle: '@ninaaa.x',    comment: 'le duo que je recommande à toutes mes copines', likes: '8,9k', scent: 'bare-vanilla' },
  { handle: '@lou.gtn',     comment: 'Midnight Bloom sent divinement bon', likes: '21,7k', scent: 'midnight-bloom' },
  { handle: '@sarahbeauty', comment: 'Aqua Kiss = mon parfum d’été non négociable', likes: '5,2k', scent: 'aqua-kiss' },
  { handle: '@maeva.rse',   comment: 'je les collectionne officiellement', likes: '9,8k', scent: 'bare-vanilla' },
];

/* --- AVIS -------------------------------------------------------------- */
const REVIEWS = [
  { name: 'Léa M.',    rating: 5, title: 'Mon préféré', text: "Tenue incroyable pour le prix. J’ai pris le duo avec le lait, ça tient toute la journée." },
  { name: 'Inès B.',   rating: 5, title: 'Ça sent cher', text: "Tout le monde me demande quel parfum je porte. Personne ne devine le prix." },
  { name: 'Chloé D.',  rating: 4, title: 'Trop bien', text: "J’aurais aimé un format plus grand parce que je le finis trop vite. Sinon parfait." },
  { name: 'Manon T.',  rating: 5, title: 'Commande n°3', text: "Je rachète à chaque fois. L’offre 2 pour 19,99 € est imbattable." },
];

/* --- INFOS PRODUIT (onglets) ------------------------------------------ */
const INFO = {
  ingredients: "Alcohol Denat., Aqua, Parfum (Fragrance), Glycerin, Aloe Barbadensis Leaf Juice, Tocopheryl Acetate (Vitamine E), Benzyl Salicylate, Linalool, Limonene. Non testé sur les animaux. Formule vegan.",
  shipping: "Livraison offerte, sans minimum d’achat, sur toutes les commandes. Expédition sous 24 h ouvrées, réception en 2 à 4 jours. Suivi envoyé par e-mail.",
  returns: "30 jours pour changer d’avis. Retour gratuit via l’étiquette prépayée incluse dans ton colis. Remboursement sous 5 jours après réception.",
};

/* --- FAQ --------------------------------------------------------------- */
const FAQ = [
  { q: "Comment fonctionne l’offre 2 au choix pour 19,99 € ?", a: "Tu ajoutes deux produits éligibles au panier — 2 brumes, 2 laits, ou 1 brume + 1 lait — et le prix du duo s’applique automatiquement. Aucun code nécessaire." },
  { q: 'Puis-je mélanger brumes et laits ?', a: 'Oui, toutes les combinaisons comptent. Mixe les parfums et les formats comme tu veux.' },
  { q: 'Combien de temps tient le parfum ?', a: 'Entre 4 et 6 heures sur peau nue. Applique le lait avant la brume pour doubler la tenue.' },
  { q: 'Vos produits sont-ils vegan ?', a: 'Oui. Formules vegan, non testées sur les animaux, fabriquées en France.' },
  { q: 'Quels sont les délais de livraison ?', a: 'Expédition sous 24 h ouvrées, réception en 2 à 4 jours en France métropolitaine.' },
];

/* =========================================================================
   CATALOGUE GÉNÉRÉ — ne pas éditer en dessous (sauf besoin spécifique)
   ========================================================================= */
const PRODUCTS = SCENTS.flatMap((scent) =>
  Object.values(TYPES).map((type) => ({
    id: `${scent.slug}-${type.id}`,
    slug: scent.slug,
    type: type.id,
    scent,
    name: scent.name,
    typeLabel: type.label,
    typeShort: type.short,
    size: type.size,
    price: type.price,
    notes: scent.notes,
    image: scent.image || `assets/img/scents/${scent.slug}-${type.id}.jpeg`,
    inStock: true,
    eligibleDuo: true,
  }))
);

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
const getScent = (slug) => SCENTS.find((s) => s.slug === slug);
const productsOfType = (type) => PRODUCTS.filter((p) => p.type === type);

window.MR = { BRAND, PRICES, TYPES, SCENTS, MOODS, LAYERS, GIFTS, UGC, REVIEWS, INFO, FAQ, PRODUCTS, getProduct, getScent, productsOfType };
