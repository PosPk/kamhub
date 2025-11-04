#!/bin/bash
set -e

echo "🚀 Kamchatour Hub - Starting Server"
echo "=========================================="
echo "Working directory: $(pwd)"
echo "PORT: ${PORT:-8080}"
echo ""

# Ищем server.js в возможных местах
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ Found: .next/standalone/server.js"
    cd .next/standalone
    echo "📂 Changed directory to: $(pwd)"
    echo "🌐 Starting Next.js server on port ${PORT:-8080}..."
    exec node server.js
elif [ -f "server.js" ]; then
    echo "✅ Found: ./server.js"
    echo "🌐 Starting server on port ${PORT:-8080}..."
    exec node server.js
elif [ -d ".next" ] && [ -f ".next/standalone/server.js" ]; then
    echo "✅ Found: .next/standalone/server.js (alternate path)"
    exec node .next/standalone/server.js
else
    echo "❌ ERROR: Cannot find server.js"
    echo ""
    echo "📂 Directory structure:"
    ls -la
    echo ""
    if [ -d ".next" ]; then
        echo "📁 .next/ contents:"
        ls -la .next/
        if [ -d ".next/standalone" ]; then
            echo ""
            echo "📁 .next/standalone/ contents:"
            ls -la .next/standalone/
        fi
    fi
    echo ""
    echo "🔍 Searching for server.js everywhere:"
    find . -name "server.js" 2>/dev/null || echo "Not found"
    exit 1
fi
