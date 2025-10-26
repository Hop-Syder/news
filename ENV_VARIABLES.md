# 📋 Variables d'Environnement - Nexus Connect

Ce document contient toutes les variables d'environnement nécessaires pour déployer Nexus Connect sur différents environnements.

---

## 🎯 Comment Utiliser ce Document

1. **Récupérer vos credentials Supabase** (voir SUPABASE_SETUP.md)
2. **Copier les sections appropriées** ci-dessous
3. **Remplacer les valeurs** `your-project-ref`, `your-anon-key`, etc.
4. **Coller dans votre plateforme** (Railway, Vercel, .env local)

---

## 🔧 1. DÉVELOPPEMENT LOCAL

### Backend (.env dans /app/backend/)

```bash
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
SUPABASE_URL="https://xfzdcljwyddhgzcpcifl.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmemRjbGp3eWRkaGd6Y3BjaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDE1MDMsImV4cCI6MjA3NzAxNzUwM30.XTigTHTuWULbBNLf7iulhupMhYM2IxSgm4lzz2SvCvQ"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmemRjbGp3eWRkaGd6Y3BjaWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ0MTUwMywiZXhwIjoyMDc3MDE3NTAzfQ.gkQsaUZF2RJehQkZpOX0wAim_2iX_TevboqscYN-MMQ"
SUPABASE_JWT_SECRET="F6kSstRARrWynJRz36L1HBMWpEmPW4vHpn5fNREQpT3mRIbHOdwgqBJcrLtIGfdjrimmPXZYwYq60/jpJKqT+Q=="

# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
APP_NAME=Nexus Connect API
APP_VERSION=2.0.0
ENVIRONMENT=development

# ==========================================
# CORS CONFIGURATION
# ==========================================
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env dans /app/frontend/)

```bash
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==========================================
# BACKEND API CONFIGURATION
# ==========================================
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🚂 2. PRODUCTION - RAILWAY (Backend)

### Variables d'Environnement Railway

**Comment ajouter:**
1. Aller sur Railway Dashboard
2. Sélectionner votre projet Nexus Connect Backend
3. Aller dans **Variables**
4. Cliquer **New Variable**
5. Copier-coller les paires clé/valeur ci-dessous

**Variables à ajouter:**

```
SUPABASE_URL
https://your-project-ref.supabase.co

SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...votre-anon-key-complete...

SUPABASE_SERVICE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...votre-service-role-key-complete...

APP_NAME
Nexus Connect API

APP_VERSION
2.0.0

ENVIRONMENT
production

CORS_ORIGINS
https://votre-app.vercel.app
```

⚠️ **IMPORTANT:**
- Remplacer `your-project-ref` par votre vrai project ref Supabase
- Remplacer `votre-app.vercel.app` par votre vrai domaine Vercel
- Le `SUPABASE_SERVICE_KEY` est **SECRET** - ne JAMAIS l'exposer!

### railway.toml (optionnel mais recommandé)

Créer `/app/backend/railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn server:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## ▲ 3. PRODUCTION - VERCEL (Frontend)

### Variables d'Environnement Vercel

**Comment ajouter:**
1. Aller sur Vercel Dashboard
2. Sélectionner votre projet Nexus Connect Frontend
3. Aller dans **Settings > Environment Variables**
4. Ajouter les variables ci-dessous

**Variables à ajouter:**

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | `https://your-project-ref.supabase.co` | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `REACT_APP_BACKEND_URL` | `https://nexus-backend.railway.app` | Production |
| `REACT_APP_BACKEND_URL` | `https://nexus-backend-staging.railway.app` | Preview |
| `REACT_APP_BACKEND_URL` | `http://localhost:8001` | Development |

⚠️ **IMPORTANT:**
- Remplacer `your-project-ref` par votre vrai project ref Supabase
- Remplacer `nexus-backend.railway.app` par votre vrai URL Railway
- Cocher les environnements appropriés (Production, Preview, Development)

### vercel.json (déjà présent, vérifier)

```json
{
  "version": 2,
  "buildCommand": "yarn build",
  "outputDirectory": "build",
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

---

## 🧪 4. STAGING (Optionnel)

### Railway Staging Environment

Créer un 2ème service Railway pour staging:

```
SUPABASE_URL
https://your-project-ref.supabase.co

SUPABASE_ANON_KEY
[même que prod - ou créer un projet Supabase dédié staging]

SUPABASE_SERVICE_KEY
[même que prod - ou créer un projet Supabase dédié staging]

APP_NAME
Nexus Connect API - Staging

APP_VERSION
2.0.0

ENVIRONMENT
staging

CORS_ORIGINS
https://nexus-staging.vercel.app
```

### Vercel Preview Environment

Vercel crée automatiquement des preview deployments pour chaque branch.
Configurez les variables d'environnement pour "Preview" :

- `REACT_APP_BACKEND_URL` → URL Railway staging

---

## 📝 5. CHECKLIST DE VÉRIFICATION

### Backend (Railway)

- [ ] `SUPABASE_URL` - URL complète avec https://
- [ ] `SUPABASE_ANON_KEY` - Clé publique (anon)
- [ ] `SUPABASE_SERVICE_KEY` - Clé secrète (service_role)
- [ ] `CORS_ORIGINS` - URL Vercel frontend
- [ ] `ENVIRONMENT` - `production` ou `staging`
- [ ] Port binding automatique via `$PORT`

### Frontend (Vercel)

- [ ] `REACT_APP_SUPABASE_URL` - Même que backend
- [ ] `REACT_APP_SUPABASE_ANON_KEY` - Même que backend (anon key UNIQUEMENT)
- [ ] `REACT_APP_BACKEND_URL` - URL Railway backend
- [ ] Variables configurées pour tous les environnements

### Supabase Dashboard

- [ ] Email auth activé
- [ ] Google OAuth configuré (redirect URLs mis à jour)
- [ ] RLS policies activées sur toutes les tables
- [ ] Storage bucket "logos" créé et configuré
- [ ] Fonctions PostgreSQL créées (get_entrepreneur_contacts)

---

## 🔐 6. SÉCURITÉ - RAPPELS IMPORTANTS

### ✅ À EXPOSER (Frontend & Backend)

- `SUPABASE_URL` - URL publique
- `SUPABASE_ANON_KEY` - Clé publique (anon)

### ❌ NE JAMAIS EXPOSER (Backend UNIQUEMENT)

- `SUPABASE_SERVICE_KEY` - Clé secrète
- Mots de passe de base de données
- Clés API tierces

### 🔒 Protection RLS

Même avec la clé publique, les données sont protégées par:
- **Row Level Security (RLS)** sur toutes les tables
- **Policies** PostgreSQL strictes
- **Authentification** JWT Supabase

---

## 🧪 7. TESTER LES VARIABLES

### Test Backend (Railway)

```bash
# Health check
curl https://nexus-backend.railway.app/health

# Test auth
curl -X POST https://nexus-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@nexus.com",
    "password": "Nexus2025",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Frontend (Vercel)

1. Ouvrir https://votre-app.vercel.app
2. Ouvrir DevTools Console
3. Vérifier les logs:
   ```
   ✅ Supabase client initialized
   ✅ Auth listener active
   ```
4. Tester l'inscription/connexion

---

## 📞 8. TROUBLESHOOTING

### Erreur: "Missing Supabase environment variables"

**Cause:** Variables non configurées ou mal nommées

**Solution:**
1. Vérifier le nom exact: `REACT_APP_SUPABASE_URL` (pas `SUPABASE_URL`)
2. Redéployer après avoir ajouté les variables
3. Vider le cache Vercel: Settings > Clear cache

### Erreur: "CORS policy blocked"

**Cause:** Backend CORS_ORIGINS mal configuré

**Solution:**
1. Vérifier `CORS_ORIGINS` sur Railway
2. Inclure HTTPS: `https://votre-app.vercel.app`
3. Redéployer le backend

### Erreur: "Invalid API key"

**Cause:** Mauvaise clé Supabase

**Solution:**
1. Vérifier dans Supabase Dashboard > Settings > API
2. Utiliser `anon key` pour frontend
3. Utiliser `service_role key` pour backend UNIQUEMENT
4. Re-copier les clés (elles sont longues!)

### Erreur: "Database connection failed"

**Cause:** RLS policies ou schéma non configuré

**Solution:**
1. Vérifier que le schéma SQL a été exécuté (SUPABASE_SETUP.md section 3)
2. Vérifier que RLS est activé (SUPABASE_SETUP.md section 4)
3. Tester les queries dans Supabase SQL Editor

---

## 🎉 9. DÉPLOIEMENT RAPIDE - COMMANDES

### Déployer Backend sur Railway

```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link project
cd backend
railway link

# 4. Deploy
railway up
```

### Déployer Frontend sur Vercel

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd frontend
vercel --prod
```

---

## 📚 10. RESSOURCES

- **Supabase Dashboard:** https://app.supabase.com
- **Railway Dashboard:** https://railway.app
- **Vercel Dashboard:** https://vercel.com
- **Documentation Supabase:** https://supabase.com/docs
- **Support Nexus Connect:** Voir README.md

---

*Document créé pour Nexus Connect - Migration Supabase v1.0*
*Dernière mise à jour: Janvier 2025*
