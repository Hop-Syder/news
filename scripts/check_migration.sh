#!/bin/bash

echo "🔍 Vérification de la migration Nexus Connect..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier les fichiers
echo "📁 Vérification des fichiers..."

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
    else
        echo -e "${RED}❌${NC} $1 - MANQUANT"
    fi
}

# Backend
check_file "/app/backend/server.py"
check_file "/app/backend/config.py"
check_file "/app/backend/services/supabase_client.py"
check_file "/app/backend/dependencies.py"
check_file "/app/backend/.env"

# Frontend
check_file "/app/frontend/src/lib/supabase.js"
check_file "/app/frontend/src/contexts/AuthContext.js"
check_file "/app/frontend/.env"

echo ""

# 2. Vérifier les dépendances
echo "📦 Vérification des dépendances..."

# Backend
if python3 -c "import supabase" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Backend: supabase installé"
else
    echo -e "${RED}❌${NC} Backend: supabase NON installé"
fi

# Frontend
if grep -q "@supabase/supabase-js" /app/frontend/package.json; then
    echo -e "${GREEN}✅${NC} Frontend: @supabase/supabase-js dans package.json"
else
    echo -e "${RED}❌${NC} Frontend: @supabase/supabase-js NON trouvé"
fi

echo ""

# 3. Vérifier les .env
echo "🔑 Vérification des variables d'environnement..."

check_env() {
    local file=$1
    local var=$2
    
    if [ -f "$file" ]; then
        if grep -q "$var=" "$file"; then
            local value=$(grep "$var=" "$file" | cut -d'=' -f2)
            if [[ "$value" == *"your-"* ]] || [[ "$value" == *"here"* ]]; then
                echo -e "${YELLOW}⚠️${NC}  $var dans $file - ${YELLOW}À CONFIGURER${NC}"
            else
                echo -e "${GREEN}✅${NC} $var dans $file"
            fi
        else
            echo -e "${RED}❌${NC} $var manquant dans $file"
        fi
    else
        echo -e "${RED}❌${NC} $file manquant"
    fi
}

# Backend .env
check_env "/app/backend/.env" "SUPABASE_URL"
check_env "/app/backend/.env" "SUPABASE_ANON_KEY"
check_env "/app/backend/.env" "SUPABASE_SERVICE_KEY"

# Frontend .env
check_env "/app/frontend/.env" "REACT_APP_SUPABASE_URL"
check_env "/app/frontend/.env" "REACT_APP_SUPABASE_ANON_KEY"

echo ""

# 4. Vérifier l'ancienne configuration
echo "🗑️  Vérification des anciens fichiers..."

if [ -f "/app/backend/firebase_config_old.py" ]; then
    echo -e "${GREEN}✅${NC} Firebase config archivé"
else
    echo -e "${YELLOW}⚠️${NC}  Firebase config non archivé (normal si pas présent)"
fi

if [ -f "/app/frontend/src/lib/firebase_old.js" ]; then
    echo -e "${GREEN}✅${NC} Firebase JS archivé"
else
    echo -e "${YELLOW}⚠️${NC}  Firebase JS non archivé (normal si pas présent)"
fi

echo ""

# 5. Test de syntaxe Python
echo "🐍 Test de syntaxe Python..."

if python3 -m py_compile /app/backend/server.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} server.py - Syntaxe valide"
else
    echo -e "${RED}❌${NC} server.py - Erreur de syntaxe"
    python3 -m py_compile /app/backend/server.py
fi

echo ""

# 6. Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si Supabase est configuré
if grep -q "your-project-ref" /app/backend/.env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  SUPABASE NON CONFIGURÉ${NC}"
    echo ""
    echo "📋 ACTIONS REQUISES:"
    echo "1. Suivre SUPABASE_SETUP.md pour créer le projet"
    echo "2. Récupérer les credentials (URL, anon key, service_role key)"
    echo "3. Mettre à jour /app/backend/.env"
    echo "4. Mettre à jour /app/frontend/.env"
    echo "5. Redémarrer les services:"
    echo "   sudo supervisorctl restart backend"
    echo "   sudo supervisorctl restart frontend"
else
    echo -e "${GREEN}✅ Migration des fichiers terminée!${NC}"
    echo ""
    echo "🚀 PROCHAINES ÉTAPES:"
    echo "1. Vérifier que Supabase est bien configuré"
    echo "2. Tester l'application"
    echo "3. Déployer sur Railway + Vercel (voir ENV_VARIABLES.md)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
