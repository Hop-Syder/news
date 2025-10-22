#!/bin/bash

# Script de vérification pré-déploiement pour Nexus Connect
# Usage: bash check_deploy_ready.sh

echo "🔍 Vérification de l'environnement Nexus Connect..."
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if files exist
echo "📁 Vérification des fichiers critiques..."

if [ -f "backend/server.py" ]; then
    echo -e "${GREEN}✓${NC} backend/server.py existe"
else
    echo -e "${RED}✗${NC} backend/server.py manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "backend/requirements.txt" ]; then
    echo -e "${GREEN}✓${NC} backend/requirements.txt existe"
else
    echo -e "${RED}✗${NC} backend/requirements.txt manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "backend/firebase_config.py" ]; then
    echo -e "${GREEN}✓${NC} backend/firebase_config.py existe"
else
    echo -e "${YELLOW}⚠${NC} backend/firebase_config.py manquant (requis pour Firebase)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "backend/firebase-admin.json" ]; then
    echo -e "${GREEN}✓${NC} backend/firebase-admin.json existe"
else
    echo -e "${RED}✗${NC} backend/firebase-admin.json manquant (requis)"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC} frontend/package.json existe"
else
    echo -e "${RED}✗${NC} frontend/package.json manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/src/App.js" ]; then
    echo -e "${GREEN}✓${NC} frontend/src/App.js existe"
else
    echo -e "${RED}✗${NC} frontend/src/App.js manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/vercel.json" ]; then
    echo -e "${GREEN}✓${NC} frontend/vercel.json existe (optimisé pour Vercel)"
else
    echo -e "${YELLOW}⚠${NC} frontend/vercel.json manquant (recommandé)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "🔐 Vérification de la sécurité..."

# Check if sensitive files are in .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "firebase-admin.json" .gitignore; then
        echo -e "${GREEN}✓${NC} firebase-admin.json est dans .gitignore"
    else
        echo -e "${RED}✗${NC} firebase-admin.json n'est PAS dans .gitignore (CRITIQUE)"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q ".env" .gitignore; then
        echo -e "${GREEN}✓${NC} .env est dans .gitignore"
    else
        echo -e "${RED}✗${NC} .env n'est PAS dans .gitignore (CRITIQUE)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} .gitignore manquant (CRITIQUE)"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📦 Vérification des dépendances backend..."

if [ -f "backend/requirements.txt" ]; then
    REQUIRED_PACKAGES=("fastapi" "motor" "firebase-admin" "passlib" "python-jose")
    
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if grep -q "$package" backend/requirements.txt; then
            echo -e "${GREEN}✓${NC} $package trouvé"
        else
            echo -e "${YELLOW}⚠${NC} $package non trouvé dans requirements.txt"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
fi

echo ""
echo "📦 Vérification des dépendances frontend..."

if [ -f "frontend/package.json" ]; then
    REQUIRED_PACKAGES=("react" "react-router-dom" "firebase" "axios")
    
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if grep -q "\"$package\"" frontend/package.json; then
            echo -e "${GREEN}✓${NC} $package trouvé"
        else
            echo -e "${YELLOW}⚠${NC} $package non trouvé dans package.json"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
fi

echo ""
echo "⚙️ Vérification des variables d'environnement..."

# Check backend .env.example or docs
if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} backend/.env existe (ne devrait pas être commité)"
    
    # Check critical variables
    if grep -q "MONGO_URL" backend/.env; then
        echo -e "${GREEN}  ✓${NC} MONGO_URL défini"
    else
        echo -e "${RED}  ✗${NC} MONGO_URL manquant"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "SECRET_KEY" backend/.env; then
        echo -e "${GREEN}  ✓${NC} SECRET_KEY défini"
    else
        echo -e "${YELLOW}  ⚠${NC} SECRET_KEY manquant (recommandé)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} backend/.env non trouvé (créez-le avant de tester localement)"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} frontend/.env existe (ne devrait pas être commité)"
    
    if grep -q "REACT_APP_BACKEND_URL" frontend/.env; then
        echo -e "${GREEN}  ✓${NC} REACT_APP_BACKEND_URL défini"
    else
        echo -e "${RED}  ✗${NC} REACT_APP_BACKEND_URL manquant"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "REACT_APP_FIREBASE_API_KEY" frontend/.env; then
        echo -e "${GREEN}  ✓${NC} REACT_APP_FIREBASE_API_KEY défini"
    else
        echo -e "${RED}  ✗${NC} REACT_APP_FIREBASE_API_KEY manquant"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} frontend/.env non trouvé (créez-le avant de tester localement)"
fi

# Check for .env.production.example
if [ -f "frontend/.env.production.example" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.production.example existe (guide pour déploiement)"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env.production.example manquant (recommandé)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "📄 Vérification de la documentation..."

if [ -f "NEXUS_CONNECT_README.md" ]; then
    echo -e "${GREEN}✓${NC} NEXUS_CONNECT_README.md existe"
else
    echo -e "${YELLOW}⚠${NC} NEXUS_CONNECT_README.md manquant"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "READMEVERCEL.md" ]; then
    echo -e "${GREEN}✓${NC} READMEVERCEL.md existe (guide de déploiement)"
else
    echo -e "${YELLOW}⚠${NC} READMEVERCEL.md manquant"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "QUICKSTART_DEPLOY.md" ]; then
    echo -e "${GREEN}✓${NC} QUICKSTART_DEPLOY.md existe (quick start)"
else
    echo -e "${YELLOW}⚠${NC} QUICKSTART_DEPLOY.md manquant"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "=================================================="
echo "📊 RÉSUMÉ"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Tout est prêt pour le déploiement !${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Lisez QUICKSTART_DEPLOY.md pour un déploiement rapide"
    echo "2. Ou lisez READMEVERCEL.md pour un guide complet"
    echo "3. Assurez-vous d'avoir configuré MongoDB Atlas et Firebase"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS avertissement(s) détecté(s)${NC}"
    echo "Le déploiement peut continuer, mais vérifiez les warnings ci-dessus"
    exit 0
else
    echo -e "${RED}✗ $ERRORS erreur(s) critique(s) détectée(s)${NC}"
    echo -e "${YELLOW}⚠ $WARNINGS avertissement(s)${NC}"
    echo ""
    echo "Corrigez les erreurs avant de déployer !"
    exit 1
fi
