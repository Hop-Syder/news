# 🔧 Configuration des Variables d'Environnement Vercel

## ⚡ Solution Rapide

Vous avez rencontré l'erreur: `Environment Variable "REACT_APP_BACKEND_URL" references Secret "backend_url", which does not exist.`

**C'est corrigé !** Le fichier `vercel.json` a été mis à jour.

---

## 📝 Comment Configurer les Variables dans Vercel Dashboard

### Méthode 1: Via le Dashboard Vercel (Recommandé)

1. **Allez sur votre projet Vercel**
   - https://vercel.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez les Settings**
   - Cliquez sur "Settings" (en haut)

3. **Allez dans Environment Variables**
   - Menu de gauche → "Environment Variables"

4. **Ajoutez chaque variable UNE PAR UNE:**

#### Variables à ajouter:

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_BACKEND_URL` | `https://nexus-connects-production.up.railway.app` | Production, Preview, Development |
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyAwX72obWD17oNzxlT1y-IxxJVYKFgBqY0` | Production, Preview, Development |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `nexuspartners-connect.firebaseapp.com` | Production, Preview, Development |
| `REACT_APP_FIREBASE_PROJECT_ID` | `nexuspartners-connect` | Production, Preview, Development |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `nexuspartners-connect.firebasestorage.app` | Production, Preview, Development |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `905049465425` | Production, Preview, Development |
| `REACT_APP_FIREBASE_APP_ID` | `1:905049465425:web:b1115bdbcbbf8f5a7c0e70` | Production, Preview, Development |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | `G-LN4RFK73TM` | Production, Preview, Development |

**Pour chaque variable:**
1. Cliquez sur "Add New"
2. Name: `REACT_APP_BACKEND_URL`
3. Value: `https://nexus-connects-production.up.railway.app`
4. Cochez: ✅ Production ✅ Preview ✅ Development
5. Cliquez "Save"
6. Répétez pour toutes les variables

5. **Redéployez**
   - Allez dans "Deployments"
   - Cliquez sur les 3 points (...) du dernier déploiement
   - Cliquez "Redeploy"

---

### Méthode 2: Via Vercel CLI (Alternatif)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Dans le dossier frontend
cd /app/frontend

# Ajouter les variables
vercel env add REACT_APP_BACKEND_URL production
# Entrez: https://nexus-connects-production.up.railway.app

vercel env add REACT_APP_FIREBASE_API_KEY production
# Entrez: AIzaSyAwX72obWD17oNzxlT1y-IxxJVYKFgBqY0

# Répétez pour toutes les variables...

# Déployer
vercel --prod
```

---

## ✅ Checklist de Vérification

Avant de redéployer, vérifiez:

- [ ] Le fichier `vercel.json` ne contient PAS de section `"env"` avec des `@secrets`
- [ ] Toutes les 8 variables sont ajoutées dans Vercel Dashboard
- [ ] Chaque variable est cochée pour Production, Preview, Development
- [ ] L'URL du backend est correcte: `https://nexus-connects-production.up.railway.app`
- [ ] Le backend Railway est accessible (testez: curl l'URL/api/)

---

## 🧪 Tester le Backend Railway

Avant de déployer sur Vercel, vérifiez que votre backend fonctionne:

```bash
# Test API
curl https://nexus-connects-production.up.railway.app/api/

# Devrait retourner:
{
  "message": "Nexus Connect API",
  "version": "1.0.0",
  "status": "operational"
}

# Test Stats
curl https://nexus-connects-production.up.railway.app/api/stats

# Test Entrepreneurs
curl https://nexus-connects-production.up.railway.app/api/entrepreneurs?limit=2
```

Si ces commandes ne fonctionnent pas, votre backend Railway a un problème.

---

## 🔥 Mettre à Jour Firebase Authorized Domains

N'oubliez pas d'ajouter votre domaine Vercel à Firebase:

1. **Allez sur Firebase Console**: https://console.firebase.google.com/
2. **Sélectionnez votre projet**: nexuspartners-connect
3. **Authentication → Settings → Authorized domains**
4. **Ajoutez votre domaine Vercel**:
   - Format: `votre-app.vercel.app`
   - Exemple: `nexus-connect-chi.vercel.app`

---

## 🚀 Processus de Déploiement Complet

### 1. Backend déjà déployé sur Railway ✅
   - URL: `https://nexus-connects-production.up.railway.app`

### 2. Configurer Variables Vercel
   - Via Dashboard (voir ci-dessus)

### 3. Pousser les Changements
```bash
# Si vous avez modifié le code localement
git add .
git commit -m "Fix: Update vercel.json - remove env secrets"
git push
```

### 4. Déployer sur Vercel
   - Vercel détecte automatiquement le push
   - Ou cliquez "Redeploy" dans Dashboard

### 5. Vérifier le Déploiement
   - Ouvrez l'URL Vercel
   - Testez la connexion
   - Testez Google Sign-In
   - Testez la création de profil

---

## ❌ Erreurs Courantes

### Erreur: "Failed to compile"
**Solution**: Vérifiez les logs de build dans Vercel Dashboard → Deployments → Voir les logs

### Erreur: "Cannot connect to backend"
**Solution**: 
1. Vérifiez que `REACT_APP_BACKEND_URL` est correct
2. Testez le backend avec curl
3. Vérifiez les CORS dans Railway (doit autoriser votre domaine Vercel)

### Erreur: "Firebase auth domain"
**Solution**: Ajoutez votre domaine Vercel dans Firebase → Authorized domains

---

## 💡 Astuces Pro

### Vérifier les Variables Actuelles
Dans Vercel Dashboard → Settings → Environment Variables, vous pouvez voir toutes vos variables.

### Copier depuis .env.production
Vous pouvez copier-coller directement depuis votre fichier `.env.production` dans le dashboard.

### Variables Sensibles
Les variables Firebase (API keys publiques) ne sont PAS sensibles - elles sont visibles dans le code frontend de toute façon.

---

## 📞 Besoin d'Aide ?

**Erreur persiste ?**
1. Vérifiez que `vercel.json` ne contient PAS de section `"env"`
2. Supprimez toutes les variables dans Vercel et réajoutez-les une par une
3. Essayez un "Clean Build" dans Vercel (Settings → General → Clear Cache)

**Backend Railway ne répond pas ?**
1. Vérifiez les logs dans Railway Dashboard
2. Vérifiez que MongoDB Atlas autorise les connexions
3. Vérifiez que firebase-admin.json est bien dans Railway

---

## ✅ Résultat Attendu

Après configuration correcte:

```
✓ Build completed
✓ Deployment successful
✓ Application accessible sur https://votre-app.vercel.app
✓ Backend connecté
✓ Firebase Auth fonctionne
✓ Google Sign-In fonctionne
```

**Bonne chance avec votre déploiement ! 🚀**
