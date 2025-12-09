#!/bin/bash
# ============================================
# QA reCAPTCHA Deployment Script
# ============================================
# This script helps deploy reCAPTCHA to the QA environment.
# 
# Prerequisites:
# 1. Heroku CLI installed and logged in
# 2. Vercel CLI installed and logged in
# 3. Google reCAPTCHA keys for qa.vibesapp.net domain
#
# Usage:
#   ./scripts/deploy-recaptcha-qa.sh --check    # Check current config
#   ./scripts/deploy-recaptcha-qa.sh --enable   # Enable reCAPTCHA
#   ./scripts/deploy-recaptcha-qa.sh --disable  # Disable reCAPTCHA
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Heroku app name
HEROKU_APP="logosil-backend"

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     VibesApp QA reCAPTCHA Deployment Tool    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Function to check current configuration
check_config() {
    echo -e "${YELLOW}📋 Checking current reCAPTCHA configuration...${NC}"
    echo ""
    
    echo -e "${BLUE}Heroku Backend (${HEROKU_APP}):${NC}"
    echo "-------------------------------------------"
    
    ENABLE_RECAPTCHA=$(heroku config:get ENABLE_RECAPTCHA -a $HEROKU_APP 2>/dev/null || echo "NOT SET")
    RECAPTCHA_SECRET=$(heroku config:get RECAPTCHA_SECRET -a $HEROKU_APP 2>/dev/null || echo "NOT SET")
    
    if [ "$ENABLE_RECAPTCHA" = "true" ]; then
        echo -e "  ENABLE_RECAPTCHA: ${GREEN}$ENABLE_RECAPTCHA${NC} ✅"
    elif [ "$ENABLE_RECAPTCHA" = "false" ]; then
        echo -e "  ENABLE_RECAPTCHA: ${RED}$ENABLE_RECAPTCHA${NC} (disabled)"
    else
        echo -e "  ENABLE_RECAPTCHA: ${RED}$ENABLE_RECAPTCHA${NC}"
    fi
    
    if [ "$RECAPTCHA_SECRET" != "NOT SET" ] && [ -n "$RECAPTCHA_SECRET" ]; then
        # Only show first 10 chars for security
        echo -e "  RECAPTCHA_SECRET: ${GREEN}${RECAPTCHA_SECRET:0:10}...${NC} ✅"
    else
        echo -e "  RECAPTCHA_SECRET: ${RED}NOT SET${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Build Script Configuration (package.json):${NC}"
    echo "-------------------------------------------"
    
    # Check if VITE_ENABLE_RECAPTCHA=true is in build:qa:web script
    if grep -q "VITE_ENABLE_RECAPTCHA=true" package.json; then
        echo -e "  build:qa:web: ${GREEN}reCAPTCHA ENABLED${NC} ✅"
    else
        echo -e "  build:qa:web: ${RED}reCAPTCHA DISABLED${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}ℹ️  Note: Frontend keys are set at build time via build:qa:web script.${NC}"
    echo -e "${YELLOW}   Run 'npm run deploy:qa:web' after enabling to deploy frontend.${NC}"
}

# Function to enable reCAPTCHA
enable_recaptcha() {
    echo -e "${YELLOW}🔐 Enabling reCAPTCHA on QA environment...${NC}"
    echo ""
    
    # Check if RECAPTCHA_SECRET is already set
    RECAPTCHA_SECRET=$(heroku config:get RECAPTCHA_SECRET -a $HEROKU_APP 2>/dev/null || echo "")
    
    if [ -z "$RECAPTCHA_SECRET" ]; then
        echo -e "${RED}❌ Error: RECAPTCHA_SECRET is not configured on Heroku.${NC}"
        echo ""
        echo "Please set it first with:"
        echo -e "  ${BLUE}heroku config:set RECAPTCHA_SECRET=<your-secret-key> -a $HEROKU_APP${NC}"
        echo ""
        echo "You can get your secret key from: https://www.google.com/recaptcha/admin"
        exit 1
    fi
    
    echo -e "${GREEN}✓ RECAPTCHA_SECRET is configured${NC}"
    echo ""
    
    # Enable reCAPTCHA on Heroku
    echo "Setting ENABLE_RECAPTCHA=true on Heroku..."
    heroku config:set ENABLE_RECAPTCHA=true -a $HEROKU_APP
    
    echo ""
    echo -e "${GREEN}✅ Backend reCAPTCHA enabled!${NC}"
    echo ""
    echo -e "${YELLOW}📦 Next steps:${NC}"
    echo "  1. Deploy the frontend with reCAPTCHA enabled:"
    echo -e "     ${BLUE}npm run deploy:qa:web${NC}"
    echo ""
    echo "  2. Test the QA environment:"
    echo -e "     ${BLUE}https://qa.vibesapp.net${NC}"
    echo ""
    echo "  3. Follow the manual test scenarios in:"
    echo -e "     ${BLUE}libs/e2e-testing/QA-RECAPTCHA-MANUAL-TESTS.md${NC}"
}

# Function to disable reCAPTCHA
disable_recaptcha() {
    echo -e "${YELLOW}🔓 Disabling reCAPTCHA on QA environment...${NC}"
    echo ""
    
    # Disable reCAPTCHA on Heroku
    echo "Setting ENABLE_RECAPTCHA=false on Heroku..."
    heroku config:set ENABLE_RECAPTCHA=false -a $HEROKU_APP
    
    echo ""
    echo -e "${GREEN}✅ Backend reCAPTCHA disabled!${NC}"
    echo ""
    echo -e "${YELLOW}📦 To fully disable on frontend, update package.json:${NC}"
    echo "  Change VITE_ENABLE_RECAPTCHA=true to VITE_ENABLE_RECAPTCHA=false"
    echo "  in the build:qa:web script, then run:"
    echo -e "     ${BLUE}npm run deploy:qa:web${NC}"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --check     Check current reCAPTCHA configuration"
    echo "  --enable    Enable reCAPTCHA on QA environment"
    echo "  --disable   Disable reCAPTCHA on QA environment"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --check   # View current config status"
    echo "  $0 --enable  # Turn on reCAPTCHA for QA"
}

# Main script logic
case "${1:-}" in
    --check)
        check_config
        ;;
    --enable)
        enable_recaptcha
        ;;
    --disable)
        disable_recaptcha
        ;;
    --help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Error: Unknown option '${1:-}'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
