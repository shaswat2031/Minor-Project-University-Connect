@echo off
echo "----------------------------------------"
echo "    University Connect AI Roadmap Fix   "
echo "----------------------------------------"
echo.

echo "1. Creating backup of current files..."
copy controllers\aiRoadmapController.js controllers\aiRoadmapController.js.bak
copy routes\aiRoadmapRoutes.js routes\aiRoadmapRoutes.js.bak
echo "✅ Backups created"

echo.
echo "2. Installing new fixed controller and routes..."
copy controllers\aiRoadmapController.js.new controllers\aiRoadmapController.js
copy routes\aiRoadmapRoutes.js.new routes\aiRoadmapRoutes.js 
echo "✅ New files installed"

echo.
echo "3. Testing the API with Python as the subject..."
echo "   Running test-roadmap.js..."
node test-roadmap.js
echo.

echo "4. Ready to test in your application!"
echo "   Try these endpoints:"
echo "   - POST /api/ai-roadmap/generate (with 'Python' in interests)"
echo "   - POST /api/ai-roadmap/test-perplexity-fixed?subject=Python"
echo.

echo "If you need to restore the original files:"
echo "copy controllers\aiRoadmapController.js.bak controllers\aiRoadmapController.js"
echo "copy routes\aiRoadmapRoutes.js.bak routes\aiRoadmapRoutes.js"
echo.

echo "----------------------------------------"
echo "              Complete                  "
echo "----------------------------------------"
