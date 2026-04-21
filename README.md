# SahelStock AI

## Résumé

**SahelStock AI** est une application web légère de suivi de stock et d'analyse des ventes.
Elle permet d'importer des fichiers produits et ventes, de visualiser des indicateurs clés, d'identifier les références à surveiller et de générer des recommandations simples en français.

L'application vise un usage sobre, rapide à prendre en main et facile à démontrer.

## Fonctionnalités présentes

- import de fichiers `CSV`, `XLSX` et `XLS`
- validation des colonnes attendues
- stockage local des données importées via `localStorage`
- tableau de bord avec KPI métier
- graphiques de ventes et de stock
- niveaux d'alerte sur le stock
- prévision simple du mois suivant par produit
- suggestions de réassort
- export CSV des recommandations
- résumé intelligent en français
- fallback déterministe si `OPENAI_API_KEY` n'est pas configurée

## Stack technique

- `Next.js 16` avec App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Recharts`
- `PapaParse`
- `xlsx`
- `ESLint`

## Prérequis

- `Node.js` 20 ou supérieur
- `npm`

## Installation locale

1. Cloner le dépôt.
2. Installer les dépendances :

```bash
npm install
```

3. Créer un fichier `.env.local` à partir de `.env.example` si nécessaire.
4. Renseigner éventuellement `OPENAI_API_KEY` dans `.env.local`.
5. Lancer le serveur de développement :

```bash
npm run dev
```

6. Ouvrir [http://localhost:3000](http://localhost:3000).

## Commandes npm utiles

```bash
npm run dev
npm run lint
npm run build
npm run start
```

- `npm run dev` : démarre l'application en développement
- `npm run lint` : vérifie la qualité du code
- `npm run build` : génère le build de production
- `npm run start` : lance le build en mode production

## Variables d'environnement

Le projet fournit un fichier `.env.example` :

```bash
OPENAI_API_KEY=
```

### Variable optionnelle

- `OPENAI_API_KEY` : active la génération d'un résumé enrichi via la route serveur `/api/summary`

Si cette variable est absente, l'application continue de fonctionner avec un résumé local déterministe.

## Formats de fichiers acceptés

### Produits

Formats acceptés :

- `products.csv`
- `products.xlsx`
- `products.xls`

Colonnes minimales attendues :

```text
sku, name, category, cost_price, sell_price, current_stock, min_stock, supplier
```

Colonne optionnelle :

```text
unit
```

Si `unit` n'est pas fournie, l'application utilise `unité` comme valeur par défaut.

Exemple :

```csv
sku,name,category,cost_price,sell_price,current_stock,min_stock,supplier,unit
RIZ25KG,Riz local 25 kg,Epicerie,10800,13500,18,12,Cooperative Niamey,sac
```

### Ventes

Formats acceptés :

- `sales.csv`
- `sales.xlsx`
- `sales.xls`

Colonnes minimales attendues :

```text
date, sku, units_sold, revenue
```

Exemple :

```csv
date,sku,units_sold,revenue
2026-05-02,RIZ25KG,10,135000
```

## Mode démo

Un jeu de données fixe et stable est fourni dans :

- `public/demo/products.csv`
- `public/demo/sales.csv`

Le bouton **Charger une démo** charge toujours ces fichiers, sans génération aléatoire.

Comportement :

- le jeu de démonstration remplit le tableau de bord avec des résultats prévisibles
- les données restent enregistrées localement dans le navigateur
- si l'utilisateur importe ensuite ses propres fichiers, ces nouvelles données remplacent la démo

## Guide d'utilisation rapide

1. Ouvrir la page `/upload`
2. Charger la démo ou importer un fichier produits et un fichier ventes
3. Vérifier les éventuels messages d'erreur d'import
4. Ouvrir le tableau de bord
5. Consulter les KPI, graphiques, alertes et recommandations
6. Exporter le fichier CSV de réassort si besoin

## Build de production

Pour générer un build de production :

```bash
npm run build
```

Pour lancer l'application en production après le build :

```bash
npm run start
```

## Déploiement sur Vercel

Le projet est prêt pour un déploiement sur **Vercel**.

### Procédure recommandée

1. Pousser le dépôt sur GitHub
2. Importer le dépôt dans Vercel
3. Laisser Vercel détecter automatiquement la configuration Next.js
4. Ajouter `OPENAI_API_KEY` dans les variables d'environnement Vercel si souhaité
5. Déployer

### Points d'attention

- aucune base de données n'est requise
- aucune authentification n'est nécessaire
- les données importées sont stockées côté navigateur
- le projet reste donc simple à déployer et à tester

## Limites actuelles

- pas d'authentification
- pas de base de données
- pas de synchronisation multi-utilisateur
- pas d'import de documents non structurés
- prévision volontairement simple
- stockage local uniquement

## À venir

Les prochaines évolutions possibles du produit incluent :

- import de documents commerciaux
- consolidation de plusieurs sources de données
- analyse des dépenses et des mouvements de stock
- lecture de formats plus variés
- génération d'insights plus avancés

Ces éléments ne sont pas inclus dans la version actuelle.
