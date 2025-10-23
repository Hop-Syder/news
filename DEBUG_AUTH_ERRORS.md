# 🔍 Guide de Diagnostic - Erreurs d'Authentification

## 🐛 Erreurs Rencontrées

1. **`Request failed with status code 405`**
   - Code HTTP 405 = Method Not Allowed
   
2. **`Firebase: Error (auth/network-request-failed)`**
   - Firebase ne peut pas communiquer avec ses serveurs

---

## 📊 Diagnostic en Cours

### Étape 1: Ouvrir la Console du Navigateur

1. **Ouvrez votre application** sur Vercel
2. **Appuyez sur F12** (ou clic droit → Inspecter)
3. **Allez dans l'onglet "Console"**
4. **Essayez de vous inscrire/connecter**

Vous devriez voir des messages comme:
```
🔵 [AUTH] Starting registration with Firebase...
✅ [AUTH] Firebase registration successful
❌ [AUTH] Registration error: ...
```

### Étape 2: Identifier Où Ça Bloque

Les logs vous diront exactement où l'erreur se produit:

#### Cas A: Erreur avant "Firebase registration successful"
**→ Problème: Firebase n'est pas correctement configuré**

**Solutions:**
1. Vérifiez que toutes les variables REACT_APP_FIREBASE_* sont dans Vercel
2. Vérifiez que Firebase Auth est activé dans Firebase Console
3. Vérifiez que votre domaine Vercel est dans "Authorized domains"

#### Cas B: Erreur après "Firebase ID token obtained" 
**→ Problème: Backend ne répond pas ou CORS**

**Solutions:**
1. Vérifiez que REACT_APP_BACKEND_URL est correct
2. Vérifiez que le backend Railway est accessible
3. Vérifiez les CORS du backend

---

## ✅ Solutions par Cas

### Solution 1: Firebase Configuration (Cas le plus probable)

#### A. Vérifier Firebase Auth est Activé

1. **Allez sur**: https://console.firebase.google.com/
2. **Projet**: nexuspartners-connect
3. **Authentication** → **Sign-in method**
4. **Vérifiez**:
   - ✅ Email/Password: **Activé**
   - ✅ Google: **Activé**

#### B. Vérifier Authorized Domains

Dans Firebase Console → Authentication → **Settings** → **Authorized domains**

**Domaines requis:**
- ✅ `localhost` (pour dev local)
- ✅ `votre-app.vercel.app` (votre domaine Vercel)
- ✅ `nexuspartners-connect.firebaseapp.com` (auto)

**Comment trouver votre domaine Vercel:**
- Vercel Dashboard → Votre projet → Domains
- Format: `nexus-connect-chi.vercel.app` ou similaire

#### C. Ajouter le Domaine Manquant

Si votre domaine Vercel n'est PAS dans la liste:

1. Cliquez sur "Add domain"
2. Entrez: `votre-app.vercel.app` (sans https://)
3. Cliquez "Add"

**⚠️ C'EST PROBABLEMENT ÇA LE PROBLÈME !**

---

### Solution 2: Variables d'Environnement Vercel

Vérifiez dans **Vercel Dashboard** → Settings → Environment Variables:

```bash
✅ REACT_APP_BACKEND_URL
✅ REACT_APP_FIREBASE_API_KEY
✅ REACT_APP_FIREBASE_AUTH_DOMAIN
✅ REACT_APP_FIREBASE_PROJECT_ID
✅ REACT_APP_FIREBASE_STORAGE_BUCKET
✅ REACT_APP_FIREBASE_MESSAGING_SENDER_ID
✅ REACT_APP_FIREBASE_APP_ID
✅ REACT_APP_FIREBASE_MEASUREMENT_ID
```

Si une variable manque → Ajoutez-la (voir VERCEL_VARIABLES.txt)

**Après ajout:** Redéployez (Deployments → Redeploy)

---

### Solution 3: Backend CORS (Moins probable)

Si l'erreur arrive **après** "Sending to backend", c'est CORS.

**Sur Railway:**

1. Allez dans votre projet backend
2. Variables → Vérifiez `CORS_ORIGINS`
3. Si différent de `*`, ajoutez votre domaine Vercel:

```bash
CORS_ORIGINS=https://votre-app.vercel.app,https://www.votre-app.vercel.app,*
```

4. Redéployez Railway

---

## 🧪 Tests de Vérification

### Test 1: Backend Accessible

```bash
curl https://nexus-connects-production.up.railway.app/api/
```

**Attendu:**
```json
{"message":"Nexus Connect API","version":"1.0.0","status":"operational"}
```

### Test 2: Firebase Auth (dans Console navigateur)

```javascript
// Ouvrez la console (F12) sur votre app Vercel
// Copiez-collez:

console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
console.log('Firebase Config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});
```

**Vérifiez:**
- Backend URL n'est pas `undefined`
- Firebase config n'est pas `undefined`

### Test 3: Network Tab

1. F12 → Onglet **Network**
2. Essayez de vous inscrire
3. Regardez les requêtes:
   - Requêtes vers `identitytoolkit.googleapis.com` → Firebase
   - Requêtes vers `nexus-connects-production.up.railway.app` → Backend

**Cliquez sur une requête en erreur:**
- Regardez Status Code (405, 403, etc.)
- Regardez Response body (message d'erreur)

---

## 🎯 Checklist de Résolution

Faites dans l'ordre:

- [ ] **1. Ouvrir Console navigateur** (F12) et tester inscription
- [ ] **2. Noter les logs** 🔵/✅/❌ pour voir où ça bloque
- [ ] **3. Si erreur avant Firebase success:**
  - [ ] Vérifier Email/Password activé dans Firebase
  - [ ] **Ajouter domaine Vercel dans Authorized domains**
  - [ ] Vérifier variables REACT_APP_FIREBASE_* dans Vercel
  - [ ] Redéployer Vercel
- [ ] **4. Si erreur après "Sending to backend":**
  - [ ] Tester backend: `curl URL/api/`
  - [ ] Vérifier CORS_ORIGINS dans Railway
  - [ ] Vérifier REACT_APP_BACKEND_URL dans Vercel
- [ ] **5. Retester** après chaque modification

---

## 💡 Solution Rapide (80% des cas)

**Le problème est probablement:**

👉 **Votre domaine Vercel n'est PAS dans Firebase Authorized domains**

**Solution en 2 minutes:**

1. Firebase Console → nexuspartners-connect
2. Authentication → Settings → Authorized domains
3. Add domain → Entrez `votre-app.vercel.app`
4. Retestez votre app

---

## 📞 Toujours Bloqué ?

**Partagez les informations suivantes:**

1. **Logs de la console** (copier-coller les messages 🔵/✅/❌)
2. **Network tab** - Screenshot de la requête en erreur
3. **Domaines dans Firebase Authorized domains**
4. **Variables d'environnement Vercel** (juste les noms, pas les valeurs)

**Fichiers de référence:**
- `VERCEL_ENV_SETUP.md` - Configuration complète
- `VERCEL_VARIABLES.txt` - Valeurs des variables

---

## ✅ Après Résolution

Une fois que ça marche, vous devriez voir:

```
🔵 [AUTH] Starting registration with Firebase...
✅ [AUTH] Firebase registration successful
✅ [AUTH] Firebase ID token obtained
🔵 [AUTH] Sending to backend: https://nexus-connects-production.up.railway.app/api/auth/firebase
✅ [AUTH] Backend response received
```

Et être redirigé vers le dashboard ! 🎉
