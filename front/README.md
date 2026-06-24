# Front Dashboard (Vite)

Ce front utilise maintenant Vite (React) au lieu de `react-scripts`.

## Scripts

- `yarn start` / `yarn wstart` : lance le serveur de dev sur http://localhost:8090
- `yarn build` : build de production dans le dossier `build`
- `yarn preview` : prévisualise le build de production
- `yarn lint` : corrige et vérifie le lint

## Variables d'environnement

- `PUBLIC_URL` : URL publique du dashboard (ex: `https://upsignonpro.votre-domaine.fr/admin`)

Utiliser [dot-env-template](dot-env-template) comme base de configuration.
