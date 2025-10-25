#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST COMPLET - NEXUS CONNECT v2.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass_count=0
fail_count=0

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    echo -n "Testing $name... "
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((pass_count++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $response"
        ((fail_count++))
    fi
}

# 1. Test Backend Health
echo "${BLUE}📡 BACKEND TESTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Root endpoint" "http://localhost:8001/" "Nexus Connect API"
test_endpoint "Health check" "http://localhost:8001/health" "healthy"
test_endpoint "API root" "http://localhost:8001/api" "operational"
test_endpoint "API health" "http://localhost:8001/api/health" "healthy"

echo ""

# 2. Test Stats endpoint (ne nécessite pas auth)
echo "${BLUE}📊 API ENDPOINTS (No Auth)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Stats endpoint" "http://localhost:8001/api/contact/stats" "total_users"

echo ""

# 3. Check Services Status
echo "${BLUE}🔧 SERVICES STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

services=("backend" "frontend")
for service in "${services[@]}"; do
    if sudo supervisorctl status $service | grep -q "RUNNING"; then
        echo -e "$service: ${GREEN}✅ RUNNING${NC}"
        ((pass_count++))
    else
        echo -e "$service: ${RED}❌ NOT RUNNING${NC}"
        ((fail_count++))
    fi
done

echo ""

# 4. Check Files
echo "${BLUE}📁 FILES CHECK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

files=(
    "/app/backend/server.py:Backend server"
    "/app/backend/config.py:Backend config"
    "/app/backend/services/supabase_client.py:Supabase client"
    "/app/frontend/src/lib/supabase.js:Frontend Supabase"
    "/app/frontend/src/contexts/AuthContext.js:Auth context"
    "/app/backend/.env:Backend .env"
    "/app/frontend/.env:Frontend .env"
)

for item in "${files[@]}"; do
    IFS=':' read -r file desc <<< "$item"
    if [ -f "$file" ]; then
        echo -e "$desc: ${GREEN}✅ EXISTS${NC}"
        ((pass_count++))
    else
        echo -e "$desc: ${RED}❌ MISSING${NC}"
        ((fail_count++))
    fi
done

echo ""

# 5. Check Supabase Configuration
echo "${BLUE}🔑 SUPABASE CONFIGURATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "temp-placeholder" /app/backend/.env; then
    echo -e "Status: ${YELLOW}⚠️  TEMPORARY CREDENTIALS${NC}"
    echo "Action: Configure Supabase (see SUPABASE_SETUP.md)"
else
    echo -e "Status: ${GREEN}✅ CONFIGURED${NC}"
    ((pass_count++))
fi

echo ""

# 6. Test API Documentation
echo "${BLUE}📖 API DOCUMENTATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s http://localhost:8001/api/docs | grep -q "Swagger"; then
    echo -e "Swagger UI: ${GREEN}✅ AVAILABLE${NC} at http://localhost:8001/api/docs"
    ((pass_count++))
else
    echo -e "Swagger UI: ${YELLOW}⚠️  CHECK MANUALLY${NC}"
fi

echo ""

# 7. Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

total=$((pass_count + fail_count))
echo -e "${GREEN}✅ Passed: $pass_count${NC}"
echo -e "${RED}❌ Failed: $fail_count${NC}"
echo "Total: $total"

echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✅ Application is running correctly!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure Supabase (see SUPABASE_SETUP.md)"
    echo "2. Update .env files with real credentials"
    echo "3. Restart services: sudo supervisorctl restart all"
    echo "4. Test registration/login"
    echo ""
    exit 0
else
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "📋 Troubleshooting:"
    echo "1. Check logs: tail -f /var/log/supervisor/backend.err.log"
    echo "2. Restart services: sudo supervisorctl restart all"
    echo "3. See README_MIGRATION.md for help"
    echo ""
    exit 1
fi
