# MAISON FLEUR — site e-commerce

Site vitrine + parcours d'achat complet pour une marque de **brumes et laits parfumés**
(TikTok → accueil → produit → duo → panier → commande), entièrement en français.

Offre centrale : **2 produits au choix pour 19,99 €** (1 produit = 9,99 €).

- 8 parfums × 2 formats = 16 produits
- Brume parfumée 250 ml — **9,99 €**
- Lait parfumé 236 ml — **9,99 €**

## Démarrer

Aucune dépendance, aucun build. Ouvre `index.html`, ou sers le dossier :

```bash
python3 -m http.server 8000     # puis http://localhost:8000
```

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : hero, parfums, moods, sélecteur duo, layering, bestsellers, UGC, cadeaux |
| `boutique.html` | Catalogue + filtres (`?type=mist`, `?type=lotion`, `?scent=<slug>`) + tri |
| `parfums.html` | Les 8 signatures, combinaisons de superposition, moods |
| `produit.html` | Fiche produit (`?scent=<slug>&type=mist|lotion`) + bloc « Fais-en un duo » |
| `duo.html` | Page dédiée à l'offre 2 pour 19,99 € |
| `cadeaux.html` | Duos à offrir |
| `panier.html` | Panier complet (progression vers le duo, suggestions, récapitulatif) |
| `checkout.html` | Commande (démo, aucun paiement réel) |
| `infos.html` | FAQ, à propos, livraison, retours, mentions légales |
| `compte.html` | Connexion (maquette) |

## Code

```
assets/
  css/style.css        design system complet (couleurs, typo, composants, responsive)
  js/data.js           ← TOUT LE CONTENU ÉDITABLE (produits, prix, textes, avis, FAQ)
  js/app.js            panier, moteur de prix duo, en-tête/pied de page, tiroirs, toasts
  js/components.js     cartes produit/parfum/mood/UGC/cadeau + widget « 2 au choix »
  js/<page>.js         logique propre à chaque page
  img/                 visuels SVG générés (placeholders)
scripts/generate-images.mjs   régénère les visuels : `node scripts/generate-images.mjs`
```

### Remplacer par de vraies données

Tout se passe dans **`assets/js/data.js`** :

- **Prix** → objet `PRICES` (`mist`, `lotion`, `duo`).
- **Parfums** → tableau `SCENTS` : `name`, `notes`, `description`, `family`, `colors`,
  `bestseller`, et `image` (mettre `'assets/img/photos/mon-parfum.jpg'` pour utiliser
  une vraie photo à la place du mockup SVG).
- **Stock** → `inStock: false` sur un produit affiche « Épuisé » et désactive l'ajout.
- **Moods, layering, cadeaux, UGC, avis, FAQ, livraison/retours** → `MOODS`, `LAYERS`,
  `GIFTS`, `UGC`, `REVIEWS`, `FAQ`, `INFO`.
- **Marque** (nom, e-mail, réseaux) → `BRAND`.

Le catalogue `PRODUCTS` (16 références) est généré automatiquement à partir de
`SCENTS` × `TYPES` : ajouter un parfum = ajouter un objet à `SCENTS`.

### Moteur de prix « 2 au choix »

`pricing()` (dans `app.js`) trie les produits éligibles du plus cher au moins cher et
applique le prix duo à chaque paire. Le prix d'une paire ne dépasse jamais la somme des
deux produits : deux brumes (9,99 € + 9,99 €) restent à 19,98 €, le client n'est jamais
perdant. L'offre est appliquée automatiquement, sans code promo.

Le panier est stocké dans `localStorage` (clé `mr_cart_v1`) — à brancher sur une vraie
API / Shopify le moment venu : seules les fonctions `Cart.*` sont à remplacer.

## Notes d'intégration

- **Mobile-first** : navigation en tiroir, barre d'achat collante, sélecteurs pleine
  largeur, zones tactiles ≥ 42 px, aucun débordement horizontal.
- La **barre d'offre** est collante : elle se replie quand on descend, réapparaît quand
  on remonte.
- Les visuels sont des **SVG générés** (≈ 150 Ko au total) : légers, nets sur tous les
  écrans, à remplacer par la vraie photographie.
- Polices : Playfair Display (titres) + Jost (textes), via Google Fonts, avec repli
  système si les polices ne chargent pas.
