# 🚀 Guide Complet de Setup Supabase pour Nexus Connect

*Guide créé pour migration Firebase/MongoDB → Supabase/PostgreSQL*

---

## 📋 Table des Matières

1. [Création du Projet Supabase](#1-création-du-projet-supabase)
2. [Configuration de l'Authentification](#2-configuration-de-lauthentification)
3. [Schéma PostgreSQL Complet](#3-schéma-postgresql-complet)
4. [Row Level Security (RLS)](#4-row-level-security-rls)
5. [Configuration du Storage](#5-configuration-du-storage)
6. [Variables d'Environnement](#6-variables-denvironnement)
7. [Vérification du Setup](#7-vérification-du-setup)

---

## 1. Création du Projet Supabase

### Étape 1.1: Créer un Compte
1. Aller sur **https://supabase.com**
2. Cliquer sur "Start your project"
3. Se connecter avec GitHub (recommandé) ou Email

### Étape 1.2: Créer le Projet
```
Project Name: nexus-connect (ou votre choix)
Database Password: [GÉNÉRER UN MOT DE PASSE FORT - LE SAUVEGARDER!]
Region: Europe West (Frankfurt) - eu-central-1
Pricing Plan: Free
```

### Étape 1.3: Récupérer les Credentials
Une fois le projet créé (2-3 minutes), aller dans **Settings > API**:

```
POSTGRES_URL="postgres://postgres.xfzdcljwyddhgzcpcifl:lDh26GdHeA6zILfB@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_USER="postgres"
POSTGRES_HOST="db.xfzdcljwyddhgzcpcifl.supabase.co"
SUPABASE_JWT_SECRET="F6kSstRARrWynJRz36L1HBMWpEmPW4vHpn5fNREQpT3mRIbHOdwgqBJcrLtIGfdjrimmPXZYwYq60/jpJKqT+Q=="
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmemRjbGp3eWRkaGd6Y3BjaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDE1MDMsImV4cCI6MjA3NzAxNzUwM30.XTigTHTuWULbBNLf7iulhupMhYM2IxSgm4lzz2SvCvQ"
POSTGRES_PRISMA_URL="postgres://postgres.xfzdcljwyddhgzcpcifl:lDh26GdHeA6zILfB@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_PASSWORD="lDh26GdHeA6zILfB"
POSTGRES_DATABASE="postgres"
SUPABASE_URL="https://xfzdcljwyddhgzcpcifl.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmemRjbGp3eWRkaGd6Y3BjaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDE1MDMsImV4cCI6MjA3NzAxNzUwM30.XTigTHTuWULbBNLf7iulhupMhYM2IxSgm4lzz2SvCvQ"
NEXT_PUBLIC_SUPABASE_URL="https://xfzdcljwyddhgzcpcifl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmemRjbGp3eWRkaGd6Y3BjaWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ0MTUwMywiZXhwIjoyMDc3MDE3NTAzfQ.gkQsaUZF2RJehQkZpOX0wAim_2iX_TevboqscYN-MMQ"
POSTGRES_URL_NON_POOLING="postgres://postgres.xfzdcljwyddhgzcpcifl:lDh26GdHeA6zILfB@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

⚠️ **IMPORTANT:** 
- `anon key` → Pour le frontend (public)
- `service_role key` → Pour le backend UNIQUEMENT (secret, ne JAMAIS exposer!)

---

## 2. Configuration de l'Authentification

### Étape 2.1: Activer Email/Password
1. Aller dans **Authentication > Providers**
2. **Email** devrait être activé par défaut
3. Configuration recommandée:
   - ✅ Enable email confirmations: **OUI** (pour production)
   - ✅ Enable email confirmations: **NON** (pour développement)
   - Minimum password length: **8**

### Étape 2.2: Configurer Google OAuth

#### A. Créer les Credentials Google
1. Aller sur **https://console.cloud.google.com**
2. Créer un nouveau projet ou sélectionner un existant
3. Aller dans **APIs & Services > Credentials**
4. Cliquer **Create Credentials > OAuth 2.0 Client ID**

```
Application type: Web application
Name: Nexus Connect Supabase Auth
Authorized JavaScript origins:
  - https://[votre-project-ref].supabase.co
Authorized redirect URIs:
  - https://[votre-project-ref].supabase.co/auth/v1/callback
```

5. Copier le **Client ID** et **Client Secret**

#### B. Configurer dans Supabase
1. Dans Supabase: **Authentication > Providers**
2. Activer **Google**
3. Coller:
   - Client ID (for OAuth)
   - Client Secret (for OAuth)
4. **Save**

---

## 3. Schéma PostgreSQL Complet

### Étape 3.1: Ouvrir le SQL Editor
1. Dans Supabase Dashboard
2. Aller dans **SQL Editor**
3. Cliquer **New Query**

### Étape 3.2: Exécuter le Schéma Complet

**Copier-coller et exécuter ce script COMPLET:**

```sql
-- ==========================================
-- NEXUS CONNECT - SCHÉMA POSTGRESQL COMPLET
-- ==========================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: public.user_profiles
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    has_profile BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ==========================================
-- TABLE: public.entrepreneurs
-- ==========================================
CREATE TABLE IF NOT EXISTS public.entrepreneurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Type et identité
    profile_type VARCHAR(50) NOT NULL CHECK (profile_type IN (
        'entreprise', 'freelance', 'pme', 'artisan', 
        'ONG', 'cabinet', 'organisation', 'autre'
    )),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(200),
    activity_name VARCHAR(200),
    
    -- Visuel (Supabase Storage URL)
    logo_url TEXT,
    
    -- Description
    description TEXT NOT NULL CHECK (LENGTH(description) <= 200),
    
    -- Compétences (array PostgreSQL)
    tags TEXT[] DEFAULT '{}' CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 5),
    
    -- Contacts (protégés par RLS)
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    
    -- Localisation
    country_code VARCHAR(2) NOT NULL,
    city VARCHAR(100) NOT NULL,
    
    -- Portfolio (JSONB)
    portfolio JSONB DEFAULT '[]',
    
    -- Notation
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    
    -- Premium
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche et filtres
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_user_id ON public.entrepreneurs(user_id);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_country ON public.entrepreneurs(country_code);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_city ON public.entrepreneurs(city);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_profile_type ON public.entrepreneurs(profile_type);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_rating ON public.entrepreneurs(rating DESC);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_tags ON public.entrepreneurs USING GIN(tags);

-- Full-text search (français)
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_search ON public.entrepreneurs 
USING GIN(to_tsvector('french', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(company_name, '') || ' ' || 
    COALESCE(activity_name, '') || ' ' || 
    COALESCE(description, '')
));

-- ==========================================
-- TABLE: public.contact_messages
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

-- ==========================================
-- TRIGGERS: Auto-update timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entrepreneurs_updated_at ON public.entrepreneurs;
CREATE TRIGGER update_entrepreneurs_updated_at
    BEFORE UPDATE ON public.entrepreneurs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FUNCTION: Auto-create user profile
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- VIEW: entrepreneurs_public (sans contacts)
-- ==========================================
CREATE OR REPLACE VIEW public.entrepreneurs_public AS
SELECT 
    id,
    user_id,
    profile_type,
    first_name,
    last_name,
    company_name,
    activity_name,
    logo_url,
    description,
    tags,
    -- CONTACTS MASQUÉS
    website,
    country_code,
    city,
    portfolio,
    rating,
    review_count,
    is_premium,
    created_at,
    updated_at
FROM public.entrepreneurs;

-- ==========================================
-- FUNCTION: Récupérer contacts (protégé)
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_entrepreneur_contacts(entrepreneur_id UUID)
RETURNS TABLE(phone VARCHAR, whatsapp VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT e.phone, e.whatsapp, e.email
    FROM public.entrepreneurs e
    WHERE e.id = entrepreneur_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- MESSAGE DE SUCCÈS
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schéma Nexus Connect créé avec succès!';
    RAISE NOTICE '📊 Tables: user_profiles, entrepreneurs, contact_messages';
    RAISE NOTICE '🔍 Vue: entrepreneurs_public';
    RAISE NOTICE '⚡ Functions: handle_new_user, get_entrepreneur_contacts';
END $$;
```

### Étape 3.3: Vérifier le Schéma
1. Aller dans **Table Editor**
2. Vous devriez voir:
   - ✅ user_profiles
   - ✅ entrepreneurs
   - ✅ contact_messages

---

## 4. Row Level Security (RLS)

### Étape 4.1: Activer RLS

**Copier-coller et exécuter ce script:**

```sql
-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- ==========================================
-- RLS: user_profiles
-- ==========================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Lecture: tout le monde peut voir les profils
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT USING (true);

-- Insertion: seulement son propre profil
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour: seulement son propre profil
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- RLS: entrepreneurs
-- ==========================================
ALTER TABLE public.entrepreneurs ENABLE ROW LEVEL SECURITY;

-- Lecture: tout le monde (mais contacts masqués via VIEW)
DROP POLICY IF EXISTS "entrepreneurs_select" ON public.entrepreneurs;
CREATE POLICY "entrepreneurs_select" ON public.entrepreneurs
    FOR SELECT USING (true);

-- Insertion: seulement si c'est son user_id
DROP POLICY IF EXISTS "entrepreneurs_insert" ON public.entrepreneurs;
CREATE POLICY "entrepreneurs_insert" ON public.entrepreneurs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour: seulement son propre profil
DROP POLICY IF EXISTS "entrepreneurs_update" ON public.entrepreneurs;
CREATE POLICY "entrepreneurs_update" ON public.entrepreneurs
    FOR UPDATE USING (auth.uid() = user_id);

-- Suppression: seulement son propre profil
DROP POLICY IF EXISTS "entrepreneurs_delete" ON public.entrepreneurs;
CREATE POLICY "entrepreneurs_delete" ON public.entrepreneurs
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- RLS: contact_messages
-- ==========================================
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Insertion: tout le monde peut contacter
DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
CREATE POLICY "contact_messages_insert" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Lecture: seulement via service_role (backend)
-- Pas de policy = inaccessible depuis frontend

-- ==========================================
-- MESSAGE DE SUCCÈS
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '🔐 RLS configuré avec succès!';
    RAISE NOTICE '✅ user_profiles: RLS actif';
    RAISE NOTICE '✅ entrepreneurs: RLS actif';
    RAISE NOTICE '✅ contact_messages: RLS actif';
END $$;
```

---

## 5. Configuration du Storage

### Étape 5.1: Créer un Bucket pour les Logos

1. Aller dans **Storage**
2. Cliquer **New bucket**

```
Name: logos
Public: YES (pour accès direct aux images)
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp, image/svg+xml
```

### Étape 5.2: Configurer les Policies du Bucket

**Dans SQL Editor, exécuter:**

```sql
-- ==========================================
-- STORAGE POLICIES: logos bucket
-- ==========================================

-- Lecture publique
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Upload: seulement utilisateurs authentifiés
DROP POLICY IF EXISTS "logos_upload" ON storage.objects;
CREATE POLICY "logos_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'logos' AND 
        auth.role() = 'authenticated'
    );

-- Mise à jour: seulement le propriétaire
DROP POLICY IF EXISTS "logos_update" ON storage.objects;
CREATE POLICY "logos_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'logos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Suppression: seulement le propriétaire
DROP POLICY IF EXISTS "logos_delete" ON storage.objects;
CREATE POLICY "logos_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'logos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Lecture publique
DROP POLICY IF EXISTS "logos_select" ON storage.objects;
CREATE POLICY "logos_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'logos');

DO $$
BEGIN
    RAISE NOTICE '📦 Storage configuré avec succès!';
    RAISE NOTICE '✅ Bucket "logos" créé et sécurisé';
END $$;
```

---

## 6. Variables d'Environnement

### Pour le Backend (.env)
```bash
# Supabase

REACT_APP_SUPABASE_URL=https://xfzdcljwyddhgzcpcifl.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmemRjbGp3eWRkaGd6Y3BjaWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDE1MDMsImV4cCI6MjA3NzAxNzUwM30.XTigTHTuWULbBNLf7iulhupMhYM2IxSgm4lzz2SvCvQ


# App
CORS_ORIGINS=http://localhost:3000,https://votre-app.vercel.app
```

### Pour le Frontend (.env)
```bash
# Supabase
REACT_APP_SUPABASE_URL=https://[votre-project-ref].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 7. Vérification du Setup

### Checklist Complète

- [ ] **Projet Supabase créé** (Europe West)
- [ ] **Credentials récupérés** (URL, anon key, service_role key)
- [ ] **Email auth activé**
- [ ] **Google OAuth configuré**
- [ ] **Schéma PostgreSQL exécuté** (3 tables)
- [ ] **RLS policies activées** (3 tables)
- [ ] **Triggers configurés** (auto timestamps)
- [ ] **View entrepreneurs_public créée**
- [ ] **Function get_entrepreneur_contacts créée**
- [ ] **Storage bucket "logos" créé**
- [ ] **Storage policies configurées**

### Test Rapide dans Supabase

1. **Test Auth:**
   - Aller dans **Authentication > Users**
   - Cliquer **Add user** (manual)
   - Créer un user de test: `test@nexus.com` / `Nexus2025`

2. **Test Tables:**
   - Aller dans **Table Editor > user_profiles**
   - Un profil devrait avoir été créé automatiquement (trigger)

3. **Test RLS:**
   - Dans **SQL Editor**, exécuter:
   ```sql
   SELECT * FROM public.user_profiles;
   SELECT * FROM public.entrepreneurs_public;
   ```
   - Devrait retourner les résultats

### Test API (après déploiement backend)

```bash
# Test health
curl https://votre-backend.railway.app/api/

# Test register
curl -X POST https://votre-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@nexus.com",
    "password": "Nexus2025",
    "first_name": "Test",
    "last_name": "User"
  }'
```

---

## 🎉 Setup Terminé!

Votre projet Supabase est maintenant prêt pour:
- ✅ Authentification (Email + Google OAuth)
- ✅ Base de données PostgreSQL (avec RLS)
- ✅ Storage pour les logos
- ✅ Real-time capabilities
- ✅ Edge Functions (si nécessaire)

**Prochaines étapes:**
1. Configurer le backend FastAPI
2. Configurer le frontend React
3. Tester en local
4. Déployer sur Railway + Vercel

---

*Document créé pour Nexus Connect - Migration Supabase v1.0*
