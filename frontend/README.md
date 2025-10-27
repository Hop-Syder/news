# 🚀 Nexus Connect - Frontend

Cette application est le frontend de **Nexus Connect**, une plateforme de networking pour les professionnels d'Afrique de l'Ouest. Elle est construite avec React et fournit l'interface utilisateur pour naviguer dans l'annuaire, gérer les profils et interagir avec les fonctionnalités de la plateforme.

---

## ✨ Technologies Utilisées

- **Framework** : React (via `create-react-app` avec Craco pour la personnalisation)
- **Composants UI** : shadcn/ui
- **Styling** : Tailwind CSS
- **Routing** : React Router v7
- **Communication API** : Axios & Supabase JS SDK
- **Gestion de formulaires** : React Hook Form avec Zod pour la validation
- **Gestionnaire de paquets** : Yarn

---

## 🔧 Démarrage Rapide

Suivez ces instructions pour obtenir une copie du projet fonctionnelle sur votre machine locale à des fins de développement.

### Prérequis

- Node.js (v18 ou plus récent)
- Yarn

### 1. Installation

Clonez le dépôt, naviguez dans le dossier du frontend et installez les dépendances.

```bash
cd frontend
yarn install
```

### 2. Variables d'Environnement

Le projet a besoin de variables d'environnement pour se connecter aux services backend. Créez un fichier `.env` à la racine du dossier `/frontend`.

Vous pouvez copier l'exemple fourni :
```bash
cp .env.example .env
```

Ensuite, remplissez les valeurs requises dans votre nouveau fichier `.env` :
```env
# URL de votre projet Supabase
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co

# Clé "anon" publique de votre projet Supabase
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# URL de votre backend déployé sur Railway (ou http://localhost:8001 pour le dev local)
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📜 Scripts Disponibles

Dans le répertoire du projet, vous pouvez exécuter :

### `yarn start`

Lance l'application en mode développement.
Ouvrez http://localhost:3000 pour la voir dans votre navigateur. La page se rechargera automatiquement lorsque vous ferez des modifications.

### `yarn build`

Construit l'application pour la production dans le dossier `build`.
Cette commande optimise les fichiers pour de meilleures performances et prépare l'application à être déployée.

### `yarn test`

Lance les tests en mode interactif.

---

## 📁 Structure du Projet

```
frontend/
├── public/         # Fichiers statiques (index.html, favicon)
├── src/
│   ├── components/   # Composants réutilisables (Navbar, Button, etc.)
│   ├── contexts/     # Contexte React (ex: AuthContext)
│   ├── lib/          # Clients API (supabase.js, axios.js)
│   ├── pages/        # Pages principales de l'application (Home, Annuaire, etc.)
│   ├── App.js        # Point d'entrée principal et gestion du routing
│   └── index.js      # Fichier racine de l'application React
├── .env            # Variables d'environnement (à créer)
├── package.json    # Dépendances et scripts
└── vercel.json     # Configuration de déploiement pour Vercel
```

---

## ▲ Déploiement

Ce projet est configuré pour un déploiement facile sur Vercel.

1.  Connectez votre dépôt Git à Vercel.
2.  Configurez le **Root Directory** sur `frontend`.
3.  Vercel détectera automatiquement les commandes de build (`yarn build`) et le dossier de sortie (`build`) grâce au fichier `vercel.json`.
4.  Ajoutez les variables d'environnement (`REACT_APP_...`) dans les paramètres du projet sur Vercel.

Pour plus de détails, consultez le fichier `ENV_VARIABLES.md`.

