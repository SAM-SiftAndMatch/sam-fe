#!/bin/bash

# Check for deep imports into features
# Usage: ./scripts/check-features-imports.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "Checking for deep feature imports..."

# Find imports that go deeper than @/features/{name}
# Pattern: @/features/xxx/yyy (more than one level deep)
VIOLATIONS=$(grep -rn --include="*.ts" --include="*.tsx" \
  "from '@/features/[^']*/" src/ 2>/dev/null | \
  grep -v "/index'" | \
  grep -v "index.ts" || true)

if [ -n "$VIOLATIONS" ]; then
  echo -e "${RED}❌ Found deep feature imports:${NC}"
  echo ""
  echo "$VIOLATIONS"
  echo ""
  echo -e "${RED}Fix: Import from feature barrel instead:${NC}"
  echo "  ❌ import { X } from '@/features/dashboard/components/X'"
  echo "  ✅ import { X } from '@/features/dashboard'"
  exit 1
else
  echo -e "${GREEN}✅ No deep feature imports found${NC}"
fi
