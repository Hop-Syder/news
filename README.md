# Here are your Instructions

## Tests & CI rapides

- **Backend** : `cd backend && pip install -r requirements.txt && pytest`
- **Frontend** :
  1. `cd frontend && yarn install --non-interactive --no-progress`
  2. `CI=true yarn test --watch=false`

Deux pipelines GitHub Actions sont fournis :

- `.github/workflows/backend-ci.yml` exécute les tests Python à chaque push/PR impactant `backend/`.
- `.github/workflows/frontend-ci.yml` installe les dépendances Yarn et lance la suite Jest pour le frontend.

> ⚠️ L’installation Yarn peut être longue lors de la première exécution (pas de `yarn.lock` actuellement). Relancez la commande si le processus est interrompu.
