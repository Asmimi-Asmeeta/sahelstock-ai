# SahelStock AI

## Description du projet

**SahelStock AI** est un mini SaaS web réalisé avec **Next.js**, **TypeScript** et **Tailwind CSS**.  
Il s'adresse aux petits marchands du Niger qui vendent via **WhatsApp**, **Facebook** ou en **petite boutique**, et qui gèrent encore leur stock de manière manuelle.

L'idée du projet est simple : permettre d'**importer des fichiers produits et ventes**, puis transformer ces données tabulaires en :

- indicateurs clés ;
- graphiques lisibles ;
- alertes de rupture ;
- prévisions simples ;
- suggestions de réapprovisionnement ;
- résumé intelligent en français.

Le projet est conçu comme un **MVP léger, crédible, propre et démontrable**, adapté à une remise académique.

## Objectif académique

Ce dépôt constitue le livrable de code source pour l'**UA3 du cours de Chiffrier électronique**.

Il démontre :

- l'intégration de **données tabulaires** ;
- une **application web claire** et structurée ;
- une **logique IA simple** avec fallback déterministe ;
- une base de code **maintenable** et commentée ;
- un projet prêt à être **installé, exécuté, buildé et déployé**.

## Fonctionnalités principales

L'application contient trois pages principales :

### 1. `/`

Landing page avec :

- présentation du problème ;
- explication de la solution ;
- bénéfices ;
- pricing fictif ;
- appels à l'action vers la démo et l'import.

### 2. `/upload`

Page d'import avec :

- import de fichiers `products` et `sales` ;
- support des formats **CSV**, **XLSX** et **XLS** ;
- validation des colonnes obligatoires ;
- messages d'erreur clairs ;
- bouton **Charger une démo** ;
- persistance locale des données via `localStorage`.

### 3. `/dashboard`

Tableau de bord avec :

- KPI principaux ;
- graphiques interactifs ;
- alertes de rupture ;
- prévision légère des ventes du mois suivant ;
- suggestions de réapprovisionnement ;
- résumé intelligent en français ;
- export CSV des recommandations.

## KPI calculés

Le dashboard calcule notamment :

- nombre total de produits ;
- stock total ;
- chiffre d'affaires total ;
- marge estimée ;
- nombre de produits en risque de rupture ;
- top 5 des ventes.

## Graphiques disponibles

L'application affiche les graphiques suivants :

- ventes par mois ;
- top produits ;
- stock actuel vs seuil minimum ;
- produits en risque de rupture.

## Logique IA simple

Le projet embarque une logique d'aide à la décision légère et crédible :

- prévision du mois suivant par SKU à partir de l'historique mensuel ;
- classification du risque de rupture : `faible`, `moyen`, `eleve` ;
- suggestion de quantité à recommander ;
- résumé intelligent en français.

### Comportement du résumé

- si `OPENAI_API_KEY` est défini, une **route serveur** tente de générer un résumé via l'API OpenAI ;
- si `OPENAI_API_KEY` n'est **pas** défini, ou si l'appel échoue, l'application utilise un **fallback déterministe** ;
- l'application reste donc pleinement fonctionnelle sans API externe.

## Stack technique

- **Next.js 16** avec **App Router**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Recharts** pour les graphiques
- **PapaParse** pour les CSV
- **xlsx** pour les fichiers Excel
- **localStorage** pour conserver les données importées
- **ESLint** pour la qualité de code

## Prérequis

Avant de lancer le projet, il faut disposer de :

- **Node.js 20+**
- **npm**

## Installation locale

Depuis la racine du projet :

```bash
npm install
```

Créer ensuite un fichier `.env.local` si vous souhaitez activer le résumé via OpenAI :

```bash
OPENAI_API_KEY=votre_cle_api
```

Sinon, aucune variable d'environnement n'est obligatoire pour utiliser le MVP.

## Commandes npm

### Lancer le projet en développement

```bash
npm run dev
```

Application disponible sur :

[http://localhost:3000](http://localhost:3000)

### Vérifier le lint

```bash
npm run lint
```

### Générer le build de production

```bash
npm run build
```

### Lancer le build en production

```bash
npm run start
```

## Format des fichiers attendus

### 1. `products.csv` ou `products.xlsx`

Colonnes minimales obligatoires :

```text
sku, name, category, cost_price, sell_price, current_stock, min_stock, supplier
```

Exemple :

```csv
sku,name,category,cost_price,sell_price,current_stock,min_stock,supplier
+RIZ25KG,Riz local 25 kg,Epicerie,10800,13500,18,12,Cooperative Niamey
```

### 2. `sales.csv` ou `sales.xlsx`

Colonnes minimales obligatoires :

```text
date, sku, units_sold, revenue
```

Exemple :

```csv
date,sku,units_sold,revenue
2026-05-02,RIZ25KG,10,135000
```

## Mode démo

Le projet inclut des données d'exemple réalistes dans :

- `public/demo/products.csv`
- `public/demo/sales.csv`

Sur la page `/upload`, le bouton **Charger une démo** permet :

- de charger automatiquement ces fichiers ;
- de les valider ;
- de les enregistrer dans `localStorage` ;
- d'ouvrir immédiatement le dashboard.

Ce mode est pratique pour une démonstration en cours ou devant un professeur.

## Variables d'environnement

Un fichier `.env.example` est fourni :

```bash
OPENAI_API_KEY=
```

### Variable optionnelle

- `OPENAI_API_KEY` : permet de générer un résumé intelligent via la route serveur `/api/summary`.

Si cette variable est absente, le fallback local prend le relais automatiquement.

## Structure du projet

```text
sahelstock-ai/
├── public/
│   └── demo/
│       ├── products.csv
│       └── sales.csv
├── src/
│   ├── app/
│   │   ├── api/summary/route.ts
│   │   ├── dashboard/page.tsx
│   │   ├── upload/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── upload/
│   └── lib/
│       ├── analytics.ts
│       ├── constants.ts
│       ├── importers.ts
│       ├── storage.ts
│       ├── summary.ts
│       ├── types.ts
│       └── utils.ts
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Build

Pour générer une version de production :

```bash
npm run build
```

Si le build réussit, le projet est prêt pour un lancement local de production :

```bash
npm run start
```

## Déploiement sur Vercel

Le projet est compatible avec **Vercel**.

### Méthode recommandée

1. pousser le dépôt sur GitHub ;
2. importer le dépôt dans Vercel ;
3. laisser Vercel détecter automatiquement Next.js ;
4. ajouter `OPENAI_API_KEY` dans les variables d'environnement Vercel si nécessaire ;
5. lancer le déploiement.

### Points importants

- aucune base de données n'est requise ;
- aucune authentification n'est nécessaire ;
- les données sont stockées dans le navigateur via `localStorage` ;
- l'application est donc simple à déployer pour une démonstration.

## Choix de conception

Le projet a été pensé pour rester :

- **simple**, afin d'éviter la complexité inutile ;
- **rapide à finir**, pour respecter le cadre académique ;
- **léger**, avec peu de dépendances ;
- **crédible**, grâce à une logique métier claire ;
- **présentable**, avec une interface propre et mobile-first.

## Limites de la V1

Cette première version comporte volontairement certaines limites :

- pas d'authentification ;
- pas de base de données ;
- pas de synchronisation multi-utilisateur ;
- pas d'import multi-feuilles Excel avancé ;
- prévision volontairement simple, non statistique avancée ;
- résumé IA dépendant d'une clé OpenAI optionnelle ;
- stockage local uniquement côté navigateur.

Ces limites sont cohérentes avec un MVP académique léger.

## Démonstration conseillée

Pour présenter le projet rapidement :

1. lancer l'application ;
2. ouvrir `/upload` ;
3. cliquer sur **Charger une démo** ;
4. montrer les KPI, les graphiques, les alertes et les recommandations ;
5. expliquer la présence du fallback IA si aucune clé n'est configurée.

## Conclusion

**SahelStock AI** fournit une base propre, cohérente et déployable pour illustrer :

- l'exploitation de fichiers tabulaires ;
- la visualisation de données ;
- une logique d'aide à la décision ;
- une intégration IA simple ;
- un développement web moderne avec Next.js.

Le projet est prêt pour une **remise en zip avec README complet**, une **démonstration académique** et un **déploiement sur Vercel**.
