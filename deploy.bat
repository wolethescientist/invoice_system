@echo off
REM Dashboard Update Deployment Script for Windows

echo.
echo 🚀 Deploying Dashboard Updates...
echo.

REM Check if git is initialized
if not exist .git (
    echo ❌ Error: Not a git repository
    echo    Run: git init
    exit /b 1
)

REM Check for uncommitted changes
git status --short > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Git not available
    exit /b 1
)

REM Show status
echo 📝 Checking for changes...
git status -s
echo.

REM Ask for confirmation
set /p REPLY="Commit and push changes? (y/n): "
if /i "%REPLY%"=="y" (
    echo.
    echo 📦 Adding files...
    git add .
    
    echo 💾 Committing changes...
    git commit -m "Add comprehensive dashboard with sidebar navigation and Hikey branding"
    
    echo 🌐 Pushing to remote...
    git push origin main
    
    echo.
    echo ✅ Deployment initiated!
    echo.
    echo Next steps:
    echo 1. Go to https://dashboard.render.com
    echo 2. Check your backend service status
    echo 3. Wait for deployment to complete (5-10 minutes)
    echo 4. Refresh your frontend to see the new dashboard
    echo.
) else (
    echo ❌ Deployment cancelled
    exit /b 1
)

echo 📊 Dashboard Features:
echo    • Sidebar navigation with Hikey branding
echo    • Comprehensive metrics from all features
echo    • Interactive charts and visualizations
echo    • Empty states with helpful guidance
echo.
echo 🔗 Useful Links:
echo    • Render Dashboard: https://dashboard.render.com
echo    • Deployment Guide: DEPLOY_DASHBOARD_UPDATE.md
echo    • Features Guide: DASHBOARD_FEATURES.md
echo.

pause
