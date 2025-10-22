# 🚀 Guide de Déploiement Nexus Connect sur Vercel

Ce guide vous accompagne étape par étape pour déployer **Nexus Connect** sur Vercel avec un backend FastAPI sur Railway/Render et MongoDB Atlas.

## 📋 Prérequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [Railway](https://railway.app) ou [Render](https://render.com) (gratuit pour backend)
- Compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuit)
- Projet Firebase déjà configuré
- Repository GitHub avec le code Nexus Connect

---

## 🏗️ Architecture de Déploiement

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │ ← React App
└────────┬────────┘
         │
         ↓ API Calls
┌─────────────────┐
│   Backend       │
│ (Railway/Render)│ ← FastAPI
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MongoDB Atlas  │ ← Base de données
└─────────────────┘
```

---

## 📦 PARTIE 1: Déploiement du Backend (FastAPI)

### Option A: Railway (Recommandé - Plus simple)

#### 1. Créer un compte Railway
- Allez sur [Railway.app](https://railway.app)
- Connectez-vous avec GitHub

#### 2. Créer un nouveau projet
- Cliquez sur "New Project"
- Sélectionnez "Deploy from GitHub repo"
- Choisissez votre repository Nexus Connect
- Railway détecte automatiquement Python

#### 3. Configurer les Variables d'Environnement

Dans les Settings de votre projet Railway, ajoutez:

```bash
# MongoDB
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=nexus_connect

# CORS
CORS_ORIGINS=https://votre-app.vercel.app,https://nexus-connect.com

# JWT
SECRET_KEY=votre-secret-key-ultra-securisee-changez-moi

# Firebase (optionnel - utilise firebase-admin.json)
GOOGLE_APPLICATION_CREDENTIALS=/app/firebase-admin.json
```

#### 4. Configurer le Root Directory

Dans Settings → Build & Deploy:
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### 5. Ajouter firebase-admin.json

Via Railway CLI ou directement dans le dashboard:
```bash
railway run cat > firebase-admin.json
# Collez le contenu de votre fichier firebase-admin.json
# Ctrl+D pour sauvegarder
```

Ou créez une variable d'environnement `FIREBASE_ADMIN_JSON` avec le contenu complet.

#### 6. Déployer
- Railway déploie automatiquement
- Notez l'URL de votre backend: `https://votre-app.up.railway.app`

---

### Option B: Render

#### 1. Créer un compte Render
- Allez sur [Render.com](https://render.com)
- Connectez-vous avec GitHub

#### 2. Créer un Web Service
- New → Web Service
- Connectez votre repository
- Configuration:
  - **Name**: nexus-connect-api
  - **Root Directory**: `backend`
  - **Environment**: Python 3
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### 3. Variables d'Environnement
Identiques à Railway (voir ci-dessus)

#### 4. Ajouter firebase-admin.json
- Allez dans "Environment" → "Secret Files"
- Créez un fichier `firebase-admin.json`
- Collez le contenu de votre clé Firebase

---

## 🗄️ PARTIE 2: Configuration MongoDB Atlas

### 1. Créer un Cluster Gratuit

- Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Créez un compte / Connectez-vous
- Créez un nouveau cluster (M0 Free Tier)
- Région: Choisissez la plus proche (ex: Europe West si vous ciblez l'Afrique de l'Ouest)

### 2. Configurer l'Accès

**Créer un utilisateur:**
- Database Access → Add New Database User
- Username: `nexus_admin`
- Password: générez un mot de passe fort
- Roles: Read and write to any database

**Autoriser les connexions:**
- Network Access → Add IP Address
- Cliquez sur "Allow Access from Anywhere" (0.0.0.0/0)
  - ⚠️ Pour production, restreignez aux IPs de Railway/Render

### 3. Obtenir la Connection String

- Clusters → Connect → Connect your application
- Driver: Python 3.12 or later
- Copiez la connection string:
  ```
  mongodb+srv://nexus_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- Remplacez `<password>` par votre vrai mot de passe
- Utilisez cette URL dans vos variables d'environnement

### 4. Créer la Base de Données

```bash
# Connectez-vous à votre backend déployé via Railway CLI
railway run python

# Dans Python:
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def create_db():
    client = AsyncIOMotorClient("VOTRE_MONGO_URL")
    db = client["nexus_connect"]
    await db.create_collection("users")
    await db.create_collection("entrepreneurs")
    await db.create_collection("contact_messages")
    print("Base de données créée !")

asyncio.run(create_db())
```

### 5. Importer les Données Démo (Optionnel)

```bash
# Sur votre backend déployé
railway run python seed_data.py
```

---

## 🎨 PARTIE 3: Déploiement Frontend (Vercel)

### 1. Préparer le Frontend

Dans `/app/frontend/.env.production`:

```bash
# Backend API
REACT_APP_BACKEND_URL=https://votre-backend.up.railway.app

# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSyAwX72obWD17oNzxlT1y-IxxJVYKFgBqY0
REACT_APP_FIREBASE_AUTH_DOMAIN=nexuspartners-connect.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=nexuspartners-connect
REACT_APP_FIREBASE_STORAGE_BUCKET=nexuspartners-connect.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=905049465425
REACT_APP_FIREBASE_APP_ID=1:905049465425:web:b1115bdbcbbf8f5a7c0e70
REACT_APP_FIREBASE_MEASUREMENT_ID=G-LN4RFK73TM
```

### 2. Créer vercel.json

Créez `/app/frontend/vercel.json`:

```json
{
  "buildCommand": "cd frontend && yarn build",
  "outputDirectory": "frontend/build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Déployer sur Vercel

**Via Dashboard:**
1. Allez sur [Vercel](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub
4. Configuration:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
   - **Install Command**: `yarn install`

**Variables d'Environnement:**
Ajoutez toutes les variables de `.env.production` dans Vercel:
- Settings → Environment Variables
- Ajoutez chaque variable (REACT_APP_BACKEND_URL, REACT_APP_FIREBASE_*, etc.)

5. Cliquez sur "Deploy"

**Via CLI (Alternatif):**
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer depuis /app/frontend
cd /app/frontend
vercel --prod
```

### 4. Configuration du Domaine (Optionnel)

**Domaine personnalisé:**
1. Dans Vercel → Settings → Domains
2. Ajoutez votre domaine (ex: `nexusconnect.com`)
3. Suivez les instructions DNS

**Sous-domaine:**
- Ajoutez `www.nexusconnect.com` également
- Vercel génère automatiquement les certificats SSL

---

## 🔥 PARTIE 4: Configuration Firebase Production

### 1. Ajouter le Domaine Vercel

Dans [Firebase Console](https://console.firebase.google.com):

**Domaines autorisés:**
1. Authentication → Settings → Authorized domains
2. Ajoutez:
   - `votre-app.vercel.app`
   - `nexusconnect.com` (si domaine personnalisé)
   - `www.nexusconnect.com`

**OAuth Redirect URIs (Google Sign-In):**
- Pas de configuration supplémentaire nécessaire
- Firebase gère automatiquement les redirections

### 2. Mettre à Jour les CORS Backend

Dans votre backend (Railway/Render), mettez à jour `CORS_ORIGINS`:

```bash
CORS_ORIGINS=https://votre-app.vercel.app,https://nexusconnect.com,https://www.nexusconnect.com
```

---

## ✅ PARTIE 5: Vérification du Déploiement

### Checklist Complète

- [ ] **Backend accessible** - Testez: `https://votre-backend.up.railway.app/api/`
- [ ] **MongoDB connecté** - Vérifiez les logs backend
- [ ] **Firebase configuré** - Domaines autorisés ajoutés
- [ ] **Frontend accessible** - Ouvrez `https://votre-app.vercel.app`
- [ ] **Auth fonctionne** - Testez inscription/connexion
- [ ] **Google Sign-In fonctionne** - Testez le bouton Google
- [ ] **Annuaire charge** - Vérifiez que les profils s'affichent
- [ ] **Dashboard accessible** - Créez un profil test
- [ ] **Contact fonctionne** - Envoyez un message test

### Tests API Backend

```bash
# Test connexion
curl https://votre-backend.up.railway.app/api/

# Test stats
curl https://votre-backend.up.railway.app/api/stats

# Test entrepreneurs
curl https://votre-backend.up.railway.app/api/entrepreneurs?limit=2
```

### Debugger les Erreurs

**Backend:**
- Railway/Render → Logs → Voir les erreurs en temps réel
- Vérifiez les variables d'environnement
- Vérifiez la connection MongoDB

**Frontend:**
- Vercel → Deployments → Votre déploiement → Logs
- Vérifiez les variables d'environnement
- Ouvrez la console du navigateur (F12)

---

## 🔧 PARTIE 6: Optimisations Production

### Backend (Railway/Render)

**1. Ajouter un Healthcheck:**

Dans `server.py`, ajoutez:
```python
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}
```

**2. Activer le Monitoring:**
- Railway: Intégré automatiquement
- Render: Activez dans Settings

**3. Configurer les Replicas (Optionnel):**
- Railway: Pas disponible en gratuit
- Render: Upgrade vers plan payant

### Frontend (Vercel)

**1. Optimiser les Images:**

Créez `/app/frontend/next.config.js`:
```javascript
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'images.pexels.com'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
}
```

**2. Activer la Compression:**
- Vercel active automatiquement Gzip et Brotli

**3. Analytics (Optionnel):**
- Vercel Analytics: Settings → Analytics → Enable
- Google Analytics: Utilisez `REACT_APP_FIREBASE_MEASUREMENT_ID`

---

## 🔐 Sécurité Production

### Variables Sensibles

**NE JAMAIS COMMITER:**
- ❌ `firebase-admin.json`
- ❌ `.env` avec secrets
- ❌ `MONGO_URL` avec credentials
- ❌ `SECRET_KEY`

**Utilisez:**
- Variables d'environnement Vercel
- Variables d'environnement Railway/Render
- Secret Files (Render)

### Restrictions MongoDB

**Network Access:**
- Passez de `0.0.0.0/0` aux IPs spécifiques:
  - Railway: Ajoutez les IPs statiques (plan payant)
  - Render: Ajoutez les IPs fournies

### Rate Limiting

**Backend - Ajoutez slowapi:**
```bash
pip install slowapi
```

Dans `server.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@api_router.post("/auth/register")
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate):
    # ... code existant
```

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Dashboard automatique des performances
- Web Vitals tracking
- Real User Monitoring

### 2. Firebase Analytics
- Suivi des événements utilisateurs
- Déjà configuré via `measurementId`

### 3. MongoDB Atlas Monitoring
- Alertes sur utilisation CPU/RAM
- Slow queries detection
- Storage usage

### 4. Sentry (Optionnel)
```bash
# Frontend
yarn add @sentry/react

# Backend
pip install sentry-sdk
```

---

## 💰 Coûts Estimés

### Plan Gratuit (Recommandé pour débuter)

| Service | Plan | Limites | Coût |
|---------|------|---------|------|
| Vercel | Hobby | 100 GB bandwidth/mois | **Gratuit** |
| Railway | Trial | 500h runtime/mois, 512MB RAM | **$5/mois** |
| MongoDB Atlas | M0 | 512MB storage | **Gratuit** |
| Firebase Auth | Spark | 10K/mois utilisateurs actifs | **Gratuit** |
| **TOTAL** | | | **$5/mois** |

### Plan Scalable (Pour croissance)

| Service | Plan | Limites | Coût |
|---------|------|---------|------|
| Vercel | Pro | 1TB bandwidth/mois | **$20/mois** |
| Railway | Developer | 8GB RAM, IP statiques | **$20/mois** |
| MongoDB Atlas | M10 | 10GB storage, backup | **$57/mois** |
| Firebase Auth | Blaze | Pay-as-you-go | **~$25/mois** |
| **TOTAL** | | | **~$122/mois** |

---

## 🆘 Résolution de Problèmes

### Erreur: "CORS Policy Error"

**Solution:**
```python
# Backend server.py
CORS_ORIGINS=https://votre-app.vercel.app,https://www.votre-app.vercel.app
```

### Erreur: "Firebase Auth Domain"

**Solution:**
- Vérifiez que le domaine est dans Firebase → Authorized domains
- Vérifiez `REACT_APP_FIREBASE_AUTH_DOMAIN` dans Vercel

### Erreur: "MongoDB Connection Timeout"

**Solution:**
- Vérifiez les credentials dans `MONGO_URL`
- Vérifiez Network Access dans MongoDB Atlas
- Testez la connexion depuis Railway shell

### Frontend ne se connecte pas au Backend

**Solution:**
```bash
# Vérifiez REACT_APP_BACKEND_URL dans Vercel
# Testez manuellement:
curl https://votre-backend.up.railway.app/api/stats
```

---

## 📞 Support

**Documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Firebase Docs](https://firebase.google.com/docs)

**Communauté:**
- Discord Vercel
- Railway Community
- Stack Overflow

---

## ✅ Déploiement Réussi !

Votre application **Nexus Connect** est maintenant en production ! 🎉

**URLs de production:**
- Frontend: `https://votre-app.vercel.app`
- Backend: `https://votre-backend.up.railway.app`
- API Docs: `https://votre-backend.up.railway.app/docs`

**Prochaines étapes:**
1. Configurez un domaine personnalisé
2. Activez les analytics
3. Monitorer les performances
4. Promouvoir votre plateforme ! 🚀

---

**Développé avec ❤️ pour Nexus Partners**
**Questions ? Consultez `/app/NEXUS_CONNECT_README.md`**
