# SahelStock AI

SahelStock AI est une application web légère de suivi de stock et d'analyse des ventes pour petits marchands. Elle transforme des fichiers tabulaires simples en indicateurs lisibles, alertes de stock, suggestions de réapprovisionnement et résumé métier en français.

## Ce que fait l'application

- import de fichiers `CSV`, `XLSX` et `XLS`
- validation des colonnes attendues et contrôles de cohérence
- stockage local du jeu de données importé dans le navigateur
- tableau de bord avec KPI, graphiques et priorités d'action
- alertes de stock et prévision simple du mois suivant
- export CSV des recommandations et export HTML du rapport d'analyse
- résumé enrichi via `/api/summary` si `OPENAI_API_KEY` est disponible

## Périmètre de cette version

Formats pris en charge :

- `products.csv`, `products.xlsx`, `products.xls`
- `sales.csv`, `sales.xlsx`, `sales.xls`

Cette version ne couvre pas :

- PDF
- OCR
- factures scannées
- documents texte non structurés
- authentification
- base de données serveur

## Stack

- `Next.js 16`
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

## Installation

```bash
npm install
```

Créer ensuite un fichier `.env.local` si nécessaire à partir de `.env.example`.

Exemple :

```bash
OPENAI_API_KEY=
```

La clé OpenAI est optionnelle. Sans cette variable, l'application reste pleinement utilisable avec un résumé local déterministe.

## Lancer l'application

Développement :

```bash
npm run dev
```

Production locale :

```bash
npm run build
npm run start
```

Application disponible par défaut sur [http://localhost:3000](http://localhost:3000).

## Vérifications utiles

```bash
npm run lint
npm run build
```

Ces commandes vérifient respectivement la qualité statique du code et la génération du build de production.

## Jeu de démonstration

Le mode démo charge toujours deux fichiers fixes fournis dans le dépôt :

- `public/demo/products.csv`
- `public/demo/sales.csv`

Comportement attendu :

- le bouton **Charger une démo** importe ce jeu de données sans aléatoire
- le tableau de bord affiche un résultat cohérent et stable
- un import manuel ultérieur remplace le jeu de démonstration dans le navigateur

## Scénario de test recommandé

1. Ouvrir `/upload`
2. Cliquer sur **Charger une démo**
3. Vérifier la redirection vers `/dashboard`
4. Contrôler les KPI, les graphiques et les suggestions de réassort
5. Tester les exports CSV et HTML
6. Revenir sur `/upload` et importer ensuite ses propres fichiers pour confirmer le remplacement des données de démonstration

Des fichiers de test supplémentaires sont aussi fournis dans `public/test-scenarios/` avec des en-têtes en français.

## Structure des données attendues

### Produits

Colonnes minimales :

```text
sku, name, category, cost_price, sell_price, current_stock, min_stock, supplier
```

Colonne optionnelle :

```text
unit
```

Si `unit` n'est pas fournie, l'application utilise `unité` par défaut.

### Ventes

Colonnes minimales :

```text
date, sku, units_sold, revenue
```

## Notes de déploiement

- aucune base de données n'est requise
- aucune authentification n'est nécessaire
- les données importées sont stockées côté navigateur
- l'application peut être déployée simplement sur un hébergement compatible Next.js, ou sur Vercel.
NB: déjà déployer sur Vercel (sahelstock-ai.vercel.app)

## Limites actuelles

- stockage local uniquement
- pas de synchronisation multi-utilisateur
- prévision volontairement simple
- pas de consolidation automatique de plusieurs sources hétérogènes

