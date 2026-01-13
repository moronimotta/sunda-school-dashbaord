#!/bin/bash

# Quick Vercel Deployment Script
# Run this after pushing to GitHub

echo "🚀 Sunday School Dashboard - Vercel Deployment"
echo ""
echo "Prerequisites:"
echo "✓ Code pushed to GitHub"
echo "✓ Vercel account created"
echo ""
echo "Steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Add these environment variables:"
echo ""
echo "   DATABASE_URL (from your .env file)"
echo "   JWT_SECRET (from your .env file)"
echo "   GEMINI_API_KEY (from your .env file)"
echo "   GOOGLE_SERVICE_ACCOUNT_JSON (entire JSON from your .env file)"
echo ""
echo "4. Click Deploy!"
echo ""
echo "Or use Vercel CLI:"
echo "  npm i -g vercel"
echo "  vercel login"
echo "  vercel"
echo ""
echo "📖 Full guide: See VERCEL_DEPLOYMENT.md"
