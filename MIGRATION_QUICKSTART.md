# 🚀 Guide de Migration Rapide - Nexus Connect

*Vous êtes ici: Migration de Firebase/MongoDB vers Supabase/PostgreSQL*

---

## ✅ Ce qui a été fait

### 1. Installation des dépendances ✅
- ✅ Backend: `supabase==2.15.0` installé
- ✅ Frontend: `@supabase/supabase-js@2.39.0` installé

### 2. Remplacement des fichiers ✅
- ✅ `/app/backend/server.py` - Nouvelle version Supabase
- ✅ `/app/backend/requirements.txt` - Sans Firebase/MongoDB
- ✅ `/app/frontend/src/contexts/AuthContext.js` - Version Supabase
- ✅ `/app/frontend/src/lib/supabase.js` - Client Supabase créé

### 3. Fichiers archivés (anciens) ✅
- ✅ `server_old.py` (Firebase + MongoDB)
- ✅ `AuthContext_old.js` (Firebase)
- ✅ `firebase_old.js` (Firebase SDK)
- ✅ `firebase_config_old.py` (Firebase Admin)

---

## ⚠️ ÉTAPE CRITIQUE - À FAIRE MAINTENANT

### 📋 Suivez SUPABASE_SETUP.md

1. **Créer le projet Supabase** (5 min)
   - Aller sur https://supabase.com
   - Créer un projet (région: Europe West)
   - Récupérer les credentials

2. **Exécuter le schéma SQL** (5 min)
   - Copier le SQL de `SUPABASE_SETUP.md` section 3
   - Exécuter dans SQL Editor

3. **Configurer RLS** (3 min)
   - Copier le SQL de `SUPABASE_SETUP.md` section 4
   - Exécuter dans SQL Editor

4. **Configurer Storage** (2 min)
   - Créer le bucket "logos"
   - Exécuter les policies

5. **Google OAuth** (5 min - optionnel)
   - Configurer dans Google Cloud Console
   - Ajouter dans Supabase Auth

**Temps total: ~20 minutes**

---

## 🔑 Après Setup Supabase

### Mettre à jour les .env

**Backend (`/app/backend/.env`):**
```bash
SUPABASE_URL=https://[VOTRE-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[VOTRE-ANON-KEY-COMPLETE]
SUPABASE_SERVICE_ROLE_KEY=[VOTRE-SERVICE-ROLE-KEY-COMPLETE]
```

**Frontend (`/app/frontend/.env`):**
```bash
REACT_APP_SUPABASE_URL=https://[VOTRE-PROJECT-REF].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[VOTRE-ANON-KEY-COMPLETE]
```

### Redémarrer les services

```bash
# Backend
sudo supervisorctl restart backend

# Frontend
sudo supervisorctl restart frontend
```

---

## 🧪 Tests à faire

### 1. Test Backend
```bash
# Health check
curl http://localhost:8001/health

# Test API docs
# Ouvrir: http://localhost:8001/api/docs
```

### 2. Test Frontend
1. Ouvrir l'app dans le navigateur
2. Ouvrir DevTools Console
3. Vérifier: "Supabase client initialized"
4. Tester inscription/connexion

---

## 🆘 En cas d'erreur

### "Missing Supabase environment variables"
→ Vérifier que les .env sont bien remplis avec VOS credentials

### "Invalid API key"
→ Vérifier que vous avez copié les BONNES clés (anon vs service_role)

### "Database connection failed"
→ Vérifier que le schéma SQL a été exécuté dans Supabase

### Autres erreurs
→ Consulter les logs:
```bash
# Backend
tail -f /var/log/supervisor/backend.err.log

# Frontend
tail -f /var/log/supervisor/frontend.err.log
```

---

## 📞 Support

- **Documentation complète:** Voir `SUPABASE_SETUP.md`
- **Variables environnement:** Voir `ENV_VARIABLES.md`
- **Supabase Docs:** https://supabase.com/docs

---

*Document créé pour Nexus Connect - Migration v2.0*
