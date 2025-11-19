#!/bin/bash

# Dashboard Update Deployment Script

echo "🚀 Deploying Dashboard Updates..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "   Run: git init"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes detected"
    echo ""
    
    # Show changes
    echo "Changed files:"
    git status -s
    echo ""
    
    # Ask for confirmation
    read -p "Commit and push these changes? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Add all changes
        echo "📦 Adding files..."
        git add .
        
        # Commit with message
        echo "💾 Committing changes..."
        git commit -m "Add comprehensive dashboard with sidebar navigation and Hikey branding"
        
        # Push to remote
        echo "🌐 Pushing to remote..."
        git push origin main
        
        echo ""
        echo "✅ Deployment initiated!"
        echo ""
        echo "Next steps:"
        echo "1. Go to https://dashboard.render.com"
        echo "2. Check your backend service status"
        echo "3. Wait for deployment to complete (5-10 minutes)"
        echo "4. Refresh your frontend to see the new dashboard"
        echo ""
    else
        echo "❌ Deployment cancelled"
        exit 1
    fi
else
    echo "✅ No uncommitted changes"
    echo "📤 Pushing to remote..."
    git push origin main
    echo ""
    echo "✅ Deployment initiated!"
fi

echo "📊 Dashboard Features:"
echo "   • Sidebar navigation with Hikey branding"
echo "   • Comprehensive metrics from all features"
echo "   • Interactive charts and visualizations"
echo "   • Empty states with helpful guidance"
echo ""
echo "🔗 Useful Links:"
echo "   • Render Dashboard: https://dashboard.render.com"
echo "   • Deployment Guide: DEPLOY_DASHBOARD_UPDATE.md"
echo "   • Features Guide: DASHBOARD_FEATURES.md"
echo ""
