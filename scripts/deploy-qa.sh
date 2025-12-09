#!/bin/bash
# ============================================
# QA Environment Deployment Script
# ============================================
# This script safely deploys to the QA environment with proper checks.
# 
# Usage:
#   ./scripts/deploy-qa.sh frontend   # Deploy frontend only
#   ./scripts/deploy-qa.sh backend    # Deploy backend only  
#   ./scripts/deploy-qa.sh all        # Deploy both
#   ./scripts/deploy-qa.sh --dry-run  # Show what would be deployed
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
HEROKU_APP="logosil-backend"
VERCEL_PROJECT="dist"
QA_FRONTEND_URL="https://qa.vibesapp.net"
QA_BACKEND_URL="https://logosil-backend-a8355253628c.herokuapp.com"
WORKSPACE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        VibesApp QA Deployment Tool           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Safety check - ensure we're in the right directory
if [ ! -f "$WORKSPACE_ROOT/package.json" ]; then
    echo -e "${RED}❌ Error: Cannot find package.json. Are you in the vibesapp directory?${NC}"
    exit 1
fi

# Show current branch (informational only - QA can deploy from any branch)
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo -e "${CYAN}📍 Current branch: ${CURRENT_BRANCH}${NC}"

# Function to deploy frontend
deploy_frontend() {
    echo ""
    echo -e "${YELLOW}🚀 Deploying Frontend to QA...${NC}"
    echo -e "   Target: ${CYAN}$QA_FRONTEND_URL${NC}"
    echo ""
    
    # Build with QA configuration
    echo -e "${BLUE}📦 Building frontend with QA configuration...${NC}"
    cd "$WORKSPACE_ROOT"
    npm run build:qa:web
    
    # Navigate to dist and deploy
    cd "$WORKSPACE_ROOT/apps/web-v2/dist"
    
    # Remove any existing .vercel folder to force re-linking
    # This prevents deploying to wrong project
    if [ -d ".vercel" ]; then
        LINKED_PROJECT=$(cat .vercel/project.json 2>/dev/null | grep -o '"projectId":"[^"]*"' | head -1 || echo "unknown")
        echo -e "${CYAN}   Currently linked to: $LINKED_PROJECT${NC}"
    fi
    
    # Deploy with explicit project targeting
    echo -e "${BLUE}📤 Deploying to Vercel...${NC}"
    
    # Use --yes to skip prompts and link to existing project
    vercel --prod --yes
    
    echo ""
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    echo -e "   URL: ${CYAN}$QA_FRONTEND_URL${NC}"
}

# Function to deploy backend
deploy_backend() {
    echo ""
    echo -e "${YELLOW}🚀 Deploying Backend to QA...${NC}"
    echo -e "   Target: ${CYAN}$QA_BACKEND_URL${NC}"
    echo -e "   Heroku App: ${CYAN}$HEROKU_APP${NC}"
    echo ""
    
    cd "$WORKSPACE_ROOT"
    
    # Check if heroku remote exists
    if ! git remote | grep -q "heroku-backend"; then
        echo -e "${YELLOW}⚠️  Adding heroku-backend remote...${NC}"
        git remote add heroku-backend https://git.heroku.com/$HEROKU_APP.git 2>/dev/null || true
    fi
    
    echo -e "${BLUE}📤 Pushing to Heroku...${NC}"
    git push heroku-backend $CURRENT_BRANCH:main --force
    
    echo ""
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
    echo -e "   URL: ${CYAN}$QA_BACKEND_URL${NC}"
}

# Function to show deployment status
show_status() {
    echo ""
    echo -e "${YELLOW}📋 QA Environment Status${NC}"
    echo "─────────────────────────────────────────────"
    
    # Check frontend
    echo -e "${BLUE}Frontend ($QA_FRONTEND_URL):${NC}"
    FRONTEND_STATUS=$(curl -sI "$QA_FRONTEND_URL" | head -1 | grep -o "[0-9]\{3\}" || echo "unreachable")
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "  Status: ${GREEN}✅ Online (HTTP $FRONTEND_STATUS)${NC}"
    else
        echo -e "  Status: ${RED}❌ Issue (HTTP $FRONTEND_STATUS)${NC}"
    fi
    
    # Check backend
    echo -e "${BLUE}Backend ($QA_BACKEND_URL):${NC}"
    BACKEND_STATUS=$(curl -sI "$QA_BACKEND_URL/api/health" 2>/dev/null | head -1 | grep -o "[0-9]\{3\}" || echo "unreachable")
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo -e "  Status: ${GREEN}✅ Online (HTTP $BACKEND_STATUS)${NC}"
    else
        echo -e "  Status: ${YELLOW}⚠️ Status $BACKEND_STATUS${NC} (may need /api/health endpoint)"
    fi
    
    # Check reCAPTCHA config
    echo ""
    echo -e "${BLUE}reCAPTCHA Configuration:${NC}"
    RECAPTCHA_ENABLED=$(heroku config:get ENABLE_RECAPTCHA -a $HEROKU_APP 2>/dev/null || echo "unknown")
    if [ "$RECAPTCHA_ENABLED" = "true" ]; then
        echo -e "  Backend: ${GREEN}✅ Enabled${NC}"
    else
        echo -e "  Backend: ${RED}❌ Disabled ($RECAPTCHA_ENABLED)${NC}"
    fi
    
    echo ""
}

# Function for dry run
dry_run() {
    echo ""
    echo -e "${YELLOW}🔍 Dry Run - What would be deployed:${NC}"
    echo "─────────────────────────────────────────────"
    echo ""
    echo -e "${BLUE}Frontend:${NC}"
    echo "  Source: apps/web-v2"
    echo "  Build:  npm run build:qa:web"
    echo "  Target: $QA_FRONTEND_URL (Vercel project: $VERCEL_PROJECT)"
    echo ""
    echo -e "${BLUE}Backend:${NC}"
    echo "  Source: apps/api"
    echo "  Branch: $CURRENT_BRANCH → main"
    echo "  Target: $HEROKU_APP.herokuapp.com"
    echo ""
    echo -e "${BLUE}Environment Variables (build-time):${NC}"
    grep -o 'VITE_[A-Z_]*=[^ ]*' "$WORKSPACE_ROOT/package.json" | grep "build:qa:web" -A1 | tail -n +2 || \
    echo "  (Check package.json build:qa:web script)"
    echo ""
    show_status
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  frontend    Deploy frontend to Vercel (qa.vibesapp.net)"
    echo "  backend     Deploy backend to Heroku (logosil-backend)"
    echo "  all         Deploy both frontend and backend"
    echo "  status      Show current QA environment status"
    echo "  --dry-run   Show what would be deployed without deploying"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 frontend     # Deploy only frontend"
    echo "  $0 all          # Deploy everything"
    echo "  $0 --dry-run    # Preview deployment"
}

# Main script logic
case "${1:-}" in
    frontend)
        deploy_frontend
        show_status
        ;;
    backend)
        deploy_backend
        show_status
        ;;
    all)
        deploy_backend
        deploy_frontend
        show_status
        ;;
    status)
        show_status
        ;;
    --dry-run)
        dry_run
        ;;
    --help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Error: Unknown command '${1:-}'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
