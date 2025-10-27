# 🌍 Nexus Connect - Plateforme de Networking Ouest-Africaine

## ✅ VERSION 2.0 - ARCHITECTURE SUPABASE

### 🎯 Fonctionnalités Implémentées

#### 1. **Backend FastAPI avec Supabase**
- ✅ Authentification Supabase (Email/Password + Google OAuth)
- ✅ CRUD complet pour les entrepreneurs via PostgreSQL
- ✅ Protection anti-scraping avec Row Level Security (RLS)
- ✅ Recherche avancée avec full-text search PostgreSQL
- ✅ Système de statistiques en temps réel
- ✅ API REST auto-générée par Supabase
- ✅ Storage intégré pour logos/images

**Endpoints disponibles:**
- `POST /api/auth/register` - Inscription email/password
- `POST /api/auth/login` - Connexion email/password
- `GET /api/auth/me` - Profil utilisateur actuel
- `GET /api/entrepreneurs` - Liste publique (profils publiés uniquement)
- `GET /api/entrepreneurs/:id` - Détails profil public (sans contacts)
- `GET /api/entrepreneurs/:id/contact` - Récupération contacts (protégée par RLS)
- `GET /api/entrepreneurs/me` - Profil entrepreneur de l'utilisateur connecté
- `POST /api/entrepreneurs/me` - Création de carte entrepreneur
- `PUT /api/entrepreneurs/me` - Mise à jour des champs modifiables
- `PATCH /api/entrepreneurs/me/status` - Changement de statut (draft/published/deactivated)
- `DELETE /api/entrepreneurs/:id` - Suppression (propriétaire uniquement)
- `POST /api/contact` - Formulaire contact
- `GET /api/contact/stats` - Statistiques globales

#### 2. **Frontend React avec Supabase SDK**

**Pages implémentées:**
- ✅ **Page d'accueil** (`/`) - Hero, statistiques en temps réel, services, témoignages
- ✅ **Annuaire** (`/annuaire`) - Recherche full-text, filtres PostgreSQL, cartes entrepreneurs
- ✅ **Ma Carte** (`/ma-carte`) - Gestion complète de la carte entrepreneur (création, édition, publication)
- ✅ **Mon Profil** (`/mon-profil`) - Paramètres du compte, mot de passe, suppression
- ✅ **Contact** (`/contact`) - Formulaire + FAQ

**Composants:**
- ✅ Navbar avec navigation responsive
- ✅ Footer complet
- ✅ AuthModal avec Supabase Auth + Google OAuth
- ✅ Système de routing React Router v7
- ✅ Real-time subscriptions (optionnel)

#### 3. **Authentification Supabase**
- ✅ Inscription Email/Password native Supabase
- ✅ Google OAuth intégré
- ✅ Sessions gérées automatiquement (JWT + Refresh tokens)
- ✅ Row Level Security pour protection données
- ✅ Création automatique des profils utilisateurs

**Configuration Supabase:**
- Project: `nexus-connect` (votre nom de projet)
- Méthodes auth activées: Email/Password, Google OAuth
- RLS activé sur toutes les tables sensibles
- Database: PostgreSQL 15+

#### 4. **Base de Données PostgreSQL**

**Tables principales:**
```
auth.users (Supabase Auth)
├── Gestion automatique des utilisateurs
└── Intégration avec public.user_profiles

public.user_profiles
├── Profil utilisateur basique
├── Lien vers auth.users
└── Flag has_profile

public.entrepreneurs
├── Profils entrepreneurs complets
├── Protection RLS sur contacts
├── Full-text search indexé
├── Array PostgreSQL pour tags
└── JSONB pour portfolio

public.contact_messages
├── Messages de contact
└── Gestion des statuts

```

**Indexes pour performance:**
- Full-text search sur nom, entreprise, description
- Index GIN sur array tags
- Index B-tree sur country_code, city, rating
- Index composés pour recherches complexes

#### 5. **Design System Nexus Connect**

**Couleurs de la marque:**
```javascript
'jaune-soleil': '#FAD02E'    // Primaire
'bleu-marine': '#002F6C'     // Accent
'vert-emeraude': '#00796B'   // Succès
'pourpre-royal': '#4A235A'   // Premium
'rose-pastel': '#FFCCCC'     // CTA secondaires
'gris-chaud': '#7E7E7E'      // Neutre
'charbon': '#36454F'         // Base sombre
```

#### 6. **Données de Démonstration**
- ✅ **20 profils entrepreneurs africains** migrés
- ✅ Tous les 8 pays couverts (Bénin, Togo, Nigeria, Ghana, Sénégal, CI, Burkina, Mali)
- ✅ Variété de types: entreprise, freelance, PME, artisan, ONG, cabinet, etc.
- ✅ Mix premium/standard
- ✅ Ratings et avis

#### 7. **Images Professionnelles**
- ✅ Stockage via Supabase Storage
- ✅ Upload direct depuis dashboard
- ✅ Compression et redimensionnement automatiques
- ✅ CDN intégré pour performance

### 📊 Statistiques Actuelles

```
Utilisateurs inscrits: 20+
Profils publiés: 20+
Pays couverts: 8
Villes: 48+
```

### 🔐 Comptes de Test

**Note:** Après migration, les utilisateurs doivent réinitialiser leur mot de passe via "Mot de passe oublié"

**Exemples de comptes (après reset password):**
- `amina.diallo@example.com` - Designer (Sénégal) - Premium ⭐
- `kofi.mensah@example.com` - TechStart (Ghana) - Premium ⭐
- `fatou.toure@example.com` - Artisan (Mali)
- `ada.okonkwo@example.com` - Marketing (Nigeria) - Premium ⭐
- `pierre.soglo@example.com` - Cabinet Juridique (Bénin) - Premium ⭐

### 🚀 Fonctionnalités Clés

#### Ma Carte Entrepreneur

- ⚠️ Champs verrouillés après première sauvegarde : prénom, nom, entreprise, email, téléphone
- ✅ Statuts gérés côté PostgreSQL (`draft`, `published`, `deactivated`)
- ✅ Aperçu visuel de la carte (badges statut, tags, localisation)
- ✅ Actions rapides : modifier, sauvegarder, publier, désactiver
- ✅ Sélection assistée des compétences (max 5) et préfiltrage par pays/ville
- 💾 Autosave via API `/api/entrepreneurs/me`

#### Protection Anti-Scraping avec RLS

Les coordonnées (téléphone, email) sont **protégées au niveau base de données** via Row Level Security.

**Fonctionnement:**
1. Vue publique `entrepreneurs_public` **ne contient pas** les contacts
2. Annuaire utilise cette vue publique
3. Boutons "Numéro" et "Email" appellent la fonction PostgreSQL `get_entrepreneur_contacts()`
4. La fonction retourne les contacts (et peut logger l'accès)
5. RLS empêche l'accès direct aux données sensibles

**Avantage:** Protection au niveau base de données, impossible à contourner côté frontend

#### Annuaire Avancé

**Recherche:**
- 🔍 Full-text search PostgreSQL (français optimisé)
- Recherche dans: nom, entreprise, compétences, description
- Tri par pertinence avec ts_rank

**Filtres disponibles:**
- 🌍 Pays (8 pays d'Afrique de l'Ouest)
- 🏙️ Ville (chargement dynamique selon pays)
- 💼 Type de profil (8 types)
- ⭐ Note minimale
- 🏷️ Tags/compétences (recherche dans array PostgreSQL)

**Affichage:**
- Cartes standard avec informations publiques
- Cartes premium avec badge doré 👑
- Pagination efficace avec LIMIT/OFFSET
- Tri: pertinence, note, date

### 🔧 Technologies Utilisées

**Backend:**
- FastAPI 0.110.1
- Supabase Python SDK
- PostgreSQL 15+ (via Supabase)
- Pydantic v2 pour validation

**Frontend:**
- React 19
- React Router DOM v7
- Tailwind CSS v3 + couleurs custom
- shadcn/ui components
- Supabase JS SDK v2
- Axios (pour endpoints custom backend)

**Infrastructure:**
- Supabase (Auth + Database + Storage + Real-time)
- Railway (Backend FastAPI)
- Vercel (Frontend React)

### 📁 Structure du Projet

```
/
├── backend/
│   ├── main.py                     # FastAPI app principale
│   ├── config.py                   # Configuration Supabase
│   ├── dependencies.py             # Auth dependencies
│   ├── models/
│   │   ├── entrepreneur.py         # Pydantic models
│   │   └── contact.py
│   ├── routers/
│   │   ├── auth.py                 # Auth endpoints
│   │   ├── entrepreneurs.py        # CRUD entrepreneurs
│   │   └── contact.py              # Contact form
│   ├── services/
│   │   ├── supabase_client.py      # Client Supabase
│   │   └── storage.py              # Gestion fichiers
│   ├── requirements.txt
│   └── .env                        # Variables d'environnement
│
├── frontend/
│   ├── src/
│   │   ├── pages/                  # Home, Annuaire, Dashboard, Contact
│   │   ├── components/             # Navbar, Footer, AuthModal
│   │   ├── contexts/               # AuthContext (Supabase)
│   │   ├── data/                   # countries.js, profileTypes.js, tags.js
│   │   ├── lib/                    # supabase.js
│   │   ├── config/                 # images.js
│   │   └── App.js                  # Router principal
│   └── .env                        # Config Supabase frontend
│
├── database/
│   ├── schema.sql                  # Schéma PostgreSQL complet
│   ├── rls_policies.sql            # Row Level Security
│   ├── functions.sql               # Functions PostgreSQL
│   └── seed_data.sql               # Données démo
│
└── scripts/
    ├── migrate_from_mongodb.py     # Migration MongoDB → PostgreSQL
    └── seed_supabase.py            # Peupler la base

```

### 🌐 URLs

**Production:**
- Frontend: `https://nexus-connect.vercel.app`
- Backend API: `https://nexus-connect.up.railway.app`
- Supabase Dashboard: `https://app.supabase.com/project/[votre-project-ref]`

**API Endpoints:**
- API Docs: `https://nexus-connect.up.railway.app/docs` (Swagger UI)
- API Redoc: `https://nexus-connect.up.railway.app/redoc`

### 🔐 Sécurité

#### Row Level Security (RLS)

**user_profiles:**
- ✅ Lecture: Tout le monde
- ✅ Écriture: Seulement son propre profil

**entrepreneurs:**
- ✅ Lecture publique via `entrepreneurs_public` VIEW (sans contacts)
- ✅ Création: Seulement si user_id = auth.uid()
- ✅ Mise à jour: Seulement son propre profil
- ✅ Suppression: Seulement son propre profil
- ✅ Contacts protégés via function `get_entrepreneur_contacts()`

**contact_messages:**
- ✅ Création: Tout le monde
- ✅ Lecture: Admin uniquement (via service_role key)

#### Authentification

- JWT automatique géré par Supabase
- Refresh tokens automatiques
- Sessions persistantes
- OAuth2 standard pour Google

### 📝 Configuration Requise

#### Variables d'Environnement Backend

```bash
# .env backend
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

#### Variables d'Environnement Frontend

```bash
# .env frontend
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 🚀 Installation et Démarrage

#### 1. Setup Supabase

```bash
# Créer un projet sur https://supabase.com
# Récupérer les credentials (URL + anon key + service_role key)

# Exécuter le schéma SQL dans le SQL Editor Supabase
# 1. database/schema.sql
# 2. database/rls_policies.sql
# 3. database/functions.sql

# Configurer l'authentification
# Dashboard > Authentication > Providers
# - Activer Email/Password
# - Configurer Google OAuth (Client ID + Secret)
```

#### 2. Backend Local

```bash
cd backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer dépendances
pip install -r requirements.txt

# Créer .env avec les variables Supabase
cp .env.example .env
# Éditer .env avec vos credentials

# Lancer le serveur
uvicorn main:app --reload --port 8000

# API accessible sur http://localhost:8000
# Docs sur http://localhost:8000/docs
```

#### 3. Frontend Local

```bash
cd frontend

# Installer dépendances
yarn install

# Créer .env avec les variables Supabase
cp .env.example .env
# Éditer .env avec vos credentials

# Lancer le dev server
yarn start

# App accessible sur http://localhost:3000
```

#### 4. Migration des Données (si nécessaire)

```bash
# Depuis MongoDB vers Supabase PostgreSQL
cd scripts
python migrate_from_mongodb.py

# Ou charger les données de démo
python seed_supabase.py
```

### 📊 Requêtes SQL Utiles

#### Statistiques

```sql
-- Nombre total d'utilisateurs
SELECT COUNT(*) FROM auth.users;

-- Nombre de profils entrepreneurs
SELECT COUNT(*) FROM public.entrepreneurs;

-- Profils par pays
SELECT country_code, COUNT(*) 
FROM public.entrepreneurs 
GROUP BY country_code 
ORDER BY COUNT(*) DESC;

-- Top tags utilisés
SELECT unnest(tags) as tag, COUNT(*) 
FROM public.entrepreneurs 
GROUP BY tag 
ORDER BY COUNT(*) DESC 
LIMIT 10;

-- Profils premium
SELECT COUNT(*) 
FROM public.entrepreneurs 
WHERE is_premium = true;
```

#### Recherche Avancée

```sql
-- Full-text search
SELECT * FROM entrepreneurs_public
WHERE to_tsvector('french', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(company_name, '') || ' ' || 
    COALESCE(description, '')
) @@ plainto_tsquery('french', 'développeur web');

-- Recherche par tags
SELECT * FROM entrepreneurs_public
WHERE tags && ARRAY['Design', 'UI/UX'];

-- Filtres combinés
SELECT * FROM entrepreneurs_public
WHERE country_code = 'BJ'
  AND rating >= 4.5
  AND is_premium = true
ORDER BY rating DESC, review_count DESC;
```

### 🎉 Prochaines Étapes (Roadmap)

#### Phase 1 - Features Avancées
- [ ] Système de notation/avis par utilisateurs
- [ ] Messagerie interne (utiliser Supabase Real-time)
- [ ] Notifications push (Supabase notifications)
- [ ] Favoris/Bookmarks
- [ ] Partage social (Open Graph)

#### Phase 2 - Premium Features
- [ ] Profils vérifiés avec badges
- [ ] Analytics pour entrepreneurs (vues, clics)
- [ ] Portfolio multi-images (Supabase Storage)
- [ ] Calendrier de disponibilité
- [ ] Demandes de devis

#### Phase 3 - Optimisations
- [ ] Cache Redis pour recherches fréquentes
- [ ] CDN pour images (Supabase CDN déjà intégré)
- [ ] SEO avancé (SSR avec Next.js)
- [ ] PWA pour mode hors-ligne
- [ ] Multi-langue (FR/EN)

#### Phase 4 - Intégrations
- [ ] Intégration paiement mobile (Orange Money, MTN, Moov)
- [ ] Système d'abonnement premium (Stripe)
- [ ] API publique pour partenaires
- [ ] Widget embeddable pour sites externes

### 🐛 Debugging & Monitoring

#### Logs Supabase

```bash
# Logs en temps réel
supabase logs

# Logs spécifiques
supabase logs -t postgres
supabase logs -t auth
supabase logs -t realtime
```

#### Monitoring Performance

```sql
-- Requêtes lentes
SELECT 
    query,
    mean_exec_time,
    calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Taille des tables
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Health Checks

```bash
# Backend health
curl https://your-backend.railway.app/api/health

# Supabase health
curl https://your-project.supabase.co/rest/v1/

# Database connection
psql postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 💰 Coûts Estimés

#### Free Tier (Recommandé pour démarrer)

| Service | Plan | Limites | Coût |
|---------|------|---------|------|
| Supabase | Free | 500 MB database, 1 GB storage, 2 GB bandwidth | **Gratuit** |
| Railway | Trial | 500h/mois, $5 credit | **$5/mois** après trial |
| Vercel | Hobby | 100 GB bandwidth/mois | **Gratuit** |
| **TOTAL** | | | **$5/mois** |

#### Production Scale

| Service | Plan | Limites | Coût |
|---------|------|---------|------|
| Supabase | Pro | 8 GB database, 100 GB storage, 250 GB bandwidth | **$25/mois** |
| Railway | Developer | 8GB RAM, 100GB bandwidth | **$20/mois** |
| Vercel | Pro | 1TB bandwidth/mois | **$20/mois** |
| **TOTAL** | | | **$65/mois** |

### 🎓 Ressources et Documentation

**Supabase:**
- Documentation: https://supabase.com/docs
- Python SDK: https://supabase.com/docs/reference/python
- JavaScript SDK: https://supabase.com/docs/reference/javascript
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

**FastAPI:**
- Documentation: https://fastapi.tiangolo.com
- Tutorial: https://fastapi.tiangolo.com/tutorial

**React + Supabase:**
- Guide complet: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- Authentication: https://supabase.com/docs/guides/auth/auth-helpers/react

**PostgreSQL:**
- Full-text search: https://www.postgresql.org/docs/current/textsearch.html
- Array types: https://www.postgresql.org/docs/current/arrays.html
- JSONB: https://www.postgresql.org/docs/current/datatype-json.html

### 🤝 Contribution

**Guidelines:**
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

**Code Style:**
- Backend: Black formatter + Flake8
- Frontend: ESLint + Prettier
- Commits: Conventional Commits

### 📄 Licence

**Propriété:** Nexus Partners  
**Usage:** Commercial  
**Développé avec ❤️ au Bénin**

### 📞 Support

**Contact:**
- Email: contact@nexusconnect.com
- WhatsApp: +229 0196701733
- Site: https://nexusconnect.com

**Communauté:**
- Discord Supabase: https://discord.supabase.com
- GitHub Issues: [Lien vers votre repo]

---

## ✅ Application Prête à Déployer !

L'application **Nexus Connect v2.0** est maintenant basée sur une architecture moderne et scalable :

- ✅ **Authentification unifiée** avec Supabase (Email + Google OAuth)
- ✅ **Base de données relationnelle** PostgreSQL avec RLS
- ✅ **API REST** optimisée avec FastAPI
- ✅ **Protection native** des données sensibles
- ✅ **Real-time** ready pour features avancées
- ✅ **Storage intégré** pour fichiers
- ✅ **Free tier généreux** pour démarrer
- ✅ **Scalable** jusqu'à des millions d'utilisateurs

**Vous pouvez maintenant:**
1. Créer votre compte Supabase
2. Déployer votre base de données
3. Configurer l'authentification
4. Déployer le backend sur Railway
5. Déployer le frontend sur Vercel
6. Commencer à utiliser la plateforme !

---

**Version:** 2.0.0  
**Dernière mise à jour:** Janvier 2025  
**Architecture:** Supabase + PostgreSQL + FastAPI + React  
**Développé avec ❤️ pour Nexus Partners**
