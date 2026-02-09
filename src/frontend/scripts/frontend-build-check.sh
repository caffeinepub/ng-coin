#!/bin/bash
set -e

echo "=========================================="
echo "Frontend Build Check - Starting"
echo "=========================================="
echo ""

# Phase 1: TypeScript Type Check
echo "Phase 1: TypeScript Type Check"
echo "------------------------------------------"
cd "$(dirname "$0")/.."
if npm run typescript-check; then
  echo "✓ TypeScript type check passed"
else
  echo "✗ TypeScript type check FAILED"
  echo ""
  echo "ERROR: Frontend TypeScript compilation errors detected."
  echo "Fix the TypeScript errors above and try again."
  exit 1
fi
echo ""

# Phase 2: Vite Build
echo "Phase 2: Vite Build"
echo "------------------------------------------"
if npm run build:skip-bindings; then
  echo "✓ Vite build passed"
else
  echo "✗ Vite build FAILED"
  echo ""
  echo "ERROR: Frontend Vite build failed."
  echo "Check the build errors above for details."
  exit 1
fi
echo ""

echo "=========================================="
echo "Frontend Build Check - SUCCESS"
echo "=========================================="
