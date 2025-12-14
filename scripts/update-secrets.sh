#!/bin/bash
# update-secrets.sh - Update secrets across all environments after key rotation
# SAFE TO COMMIT - Reads from local .env files, never hardcodes secrets

set -e  # Exit on error

echo "🔄 Updating Secrets Across All Environments"
echo "==========================================="
echo ""
echo "⚠️  Prerequisites:"
echo "  1. Update your local .env files with new secrets first"
echo "  2. Ensure you're authenticated: heroku auth:whoami, gh auth status, vercel whoami"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Source environment files
echo "📖 Reading secrets from local .env files..."
if [ ! -f "apps/api/.env" ]; then
    echo "❌ Error: apps/api/.env not found"
    exit 1
fi
source apps/api/.env

if [ ! -f "apps/web-v2/.env" ]; then
    echo "❌ Error: apps/web-v2/.env not found"
    exit 1
fi
source apps/web-v2/.env

# Configuration
QA_BACKEND_APP="logosil-backend"
PROD_BACKEND_APP="vibesapp"
VERCEL_PROJECT="dist"
GITHUB_REPO="Dinoraptor101/vibesapp"

echo "✅ Secrets loaded from .env files"
echo ""

# ===== 1. HEROKU QA BACKEND =====
echo "📦 1/4 Updating Heroku QA Backend ($QA_BACKEND_APP)..."
echo "------------------------------------------------"

heroku config:set \
  NODE_ENV=production \
  PORT=5001 \
  FRONTEND_URL=https://qa.vibesapp.net \
  MONGO_URI="$MONGO_URI" \
  AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  AWS_REGION="$AWS_REGION" \
  AWS_S3_BUCKET="$AWS_S3_BUCKET" \
  API_KEY="$API_KEY" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  RECAPTCHA_SECRET="$RECAPTCHA_SECRET" \
  ENABLE_RECAPTCHA=true \
  E2E_BYPASS_TOKEN="$E2E_BYPASS_TOKEN" \
  QA_TEST_PIGEON_ID="$QA_TEST_PIGEON_ID" \
  QA_TEST_2_PIGEON_ID="$QA_TEST_2_PIGEON_ID" \
  QA_TEST_USER_ID="$QA_TEST_USER_ID" \
  QA_TEST_USER_2_ID="$QA_TEST_USER_2_ID" \
  GH_PAT="$GH_PAT" \
  CLOUDFRONT_URL="$CLOUDFRONT_URL" \
  --app $QA_BACKEND_APP

echo "✅ QA Backend updated"
echo ""

# ===== 2. HEROKU PRODUCTION BACKEND =====
echo "📦 2/4 Updating Heroku Production Backend ($PROD_BACKEND_APP)..."
echo "-----------------------------------------------------------"

# Read production MONGO_URI separately if you have a different .env for prod
# For now, assuming you'll update MONGO_URI in apps/api/.env before running this
read -p "⚠️  Is MONGO_URI in apps/api/.env set to /prod database? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please update MONGO_URI to use /prod database before continuing"
    exit 1
fi

heroku config:set \
  NODE_ENV=production \
  PORT=5001 \
  FRONTEND_URL=https://vibesapp.net \
  MONGO_URI="$MONGO_URI" \
  AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  AWS_REGION="$AWS_REGION" \
  AWS_S3_BUCKET="$AWS_S3_BUCKET" \
  API_KEY="$API_KEY" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  RECAPTCHA_SECRET="$RECAPTCHA_SECRET" \
  ENABLE_RECAPTCHA=true \
  E2E_BYPASS_TOKEN="$E2E_BYPASS_TOKEN" \
  QA_TEST_PIGEON_ID="$QA_TEST_PIGEON_ID" \
  QA_TEST_2_PIGEON_ID="$QA_TEST_2_PIGEON_ID" \
  QA_TEST_USER_ID="$QA_TEST_USER_ID" \
  QA_TEST_USER_2_ID="$QA_TEST_USER_2_ID" \
  GH_PAT="$GH_PAT" \
  CLOUDFRONT_URL="$CLOUDFRONT_URL" \
  --app $PROD_BACKEND_APP

echo "✅ Production Backend updated"
echo ""

# ===== 3. VERCEL FRONTEND (QA) =====
echo "📦 3/4 Updating Vercel Frontend ($VERCEL_PROJECT)..."
echo "----------------------------------------------"

cd apps/web-v2

# Remove existing env vars first (Vercel doesn't have update, only add/remove)
echo "  Removing old env vars..."
vercel env rm VITE_CDN_URL production --yes 2>/dev/null || true
vercel env rm VITE_S3_BUCKET production --yes 2>/dev/null || true
vercel env rm VITE_S3_REGION production --yes 2>/dev/null || true
vercel env rm VITE_RECAPTCHA_SITE_KEY production --yes 2>/dev/null || true
vercel env rm VITE_ENABLE_RECAPTCHA production --yes 2>/dev/null || true
vercel env rm VITE_USE_SSE production --yes 2>/dev/null || true
vercel env rm VITE_DEBUG production --yes 2>/dev/null || true
vercel env rm VITE_MAINTENANCE_MODE production --yes 2>/dev/null || true
# SECURITY FIX: Remove VITE_BACKEND_API_KEY from Vercel (was exposing server API key)
vercel env rm VITE_BACKEND_API_KEY production --yes 2>/dev/null || true

echo "  Adding new env vars..."
echo "$VITE_CDN_URL" | vercel env add VITE_CDN_URL production
echo "$VITE_S3_BUCKET" | vercel env add VITE_S3_BUCKET production
echo "$VITE_S3_REGION" | vercel env add VITE_S3_REGION production
echo "$VITE_RECAPTCHA_SITE_KEY" | vercel env add VITE_RECAPTCHA_SITE_KEY production
echo "true" | vercel env add VITE_ENABLE_RECAPTCHA production
echo "true" | vercel env add VITE_USE_SSE production
echo "false" | vercel env add VITE_DEBUG production
echo "false" | vercel env add VITE_MAINTENANCE_MODE production
# SECURITY FIX: Do NOT add VITE_BACKEND_API_KEY - API key should never be in browser

cd ../..

echo "✅ Vercel Frontend updated"
echo ""

# ===== 4. GITHUB SECRETS (CI/CD) =====
echo "📦 4/4 Updating GitHub Secrets ($GITHUB_REPO)..."
echo "----------------------------------------------------"

gh secret set MONGO_URI --body "$MONGO_URI" --repo "$GITHUB_REPO"
gh secret set AWS_ACCESS_KEY_ID --body "$AWS_ACCESS_KEY_ID" --repo "$GITHUB_REPO"
gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY" --repo "$GITHUB_REPO"
gh secret set AWS_S3_BUCKET --body "$AWS_S3_BUCKET" --repo "$GITHUB_REPO"
gh secret set AWS_REGION --body "$AWS_REGION" --repo "$GITHUB_REPO"
gh secret set CLOUDFRONT_URL --body "$CLOUDFRONT_URL" --repo "$GITHUB_REPO"
gh secret set API_KEY --body "$API_KEY" --repo "$GITHUB_REPO"
# SECURITY FIX: Do NOT set VITE_BACKEND_API_KEY - API key should never be in browser
# gh secret set VITE_BACKEND_API_KEY --body "$API_KEY" --repo "$GITHUB_REPO"
gh secret set RECAPTCHA_SECRET --body "$RECAPTCHA_SECRET" --repo "$GITHUB_REPO"
gh secret set VITE_RECAPTCHA_SITE_KEY --body "$VITE_RECAPTCHA_SITE_KEY" --repo "$GITHUB_REPO"
gh secret set QA_TEST_PIGEON_ID --body "$QA_TEST_PIGEON_ID" --repo "$GITHUB_REPO"
gh secret set QA_TEST_2_PIGEON_ID --body "$QA_TEST_2_PIGEON_ID" --repo "$GITHUB_REPO"

echo "✅ GitHub Secrets updated"
echo ""

# ===== SUMMARY =====
echo "🎉 All secrets updated successfully!"
echo ""
echo "📋 Updated environments:"
echo "  ✅ Heroku QA Backend ($QA_BACKEND_APP)"
echo "  ✅ Heroku Production Backend ($PROD_BACKEND_APP)"
echo "  ✅ Vercel Frontend ($VERCEL_PROJECT)"
echo "  ✅ GitHub Secrets ($GITHUB_REPO)"
echo ""
echo "⚠️  Next steps:"
echo "  1. Verify services are running: heroku logs --tail --app $QA_BACKEND_APP"
echo "  2. Test QA environment: https://qa.vibesapp.net"
echo "  3. Test Production: https://vibesapp.net"
echo "  4. Trigger CI/CD: Push to a PR branch to test E2E workflow"
echo ""
