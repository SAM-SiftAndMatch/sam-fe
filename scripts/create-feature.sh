#!/bin/bash

# Create a new feature following the feature-based architecture pattern
# Usage: ./scripts/create-feature.sh <feature-name>
# Example: ./scripts/create-feature.sh users

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAME=$1

if [ -z "$NAME" ]; then
  echo -e "${RED}Error: Feature name is required${NC}"
  echo "Usage: ./scripts/create-feature.sh <feature-name>"
  echo "Example: ./scripts/create-feature.sh users"
  exit 1
fi

# Convert to lowercase and validate
NAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')
if [[ ! "$NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo -e "${RED}Error: Feature name must be lowercase alphanumeric (can contain hyphens)${NC}"
  exit 1
fi

# Convert kebab-case to PascalCase for component names
PASCAL_NAME=$(echo "$NAME" | sed -r 's/(^|-)([a-z])/\U\2/g')

FEATURE_DIR="src/features/$NAME"

# Check if feature already exists
if [ -d "$FEATURE_DIR" ]; then
  echo -e "${YELLOW}Warning: Feature '$NAME' already exists at $FEATURE_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}Creating feature: $NAME${NC}"

# Create directory structure
mkdir -p "$FEATURE_DIR"/{pages,components,types,hooks,api}

# Create barrel export
cat > "$FEATURE_DIR/index.ts" << EOF
// Public API for $NAME feature

// Pages
export { ${PASCAL_NAME}Page } from './pages/${PASCAL_NAME}Page';

// Components
// export { ${PASCAL_NAME}Component } from './components/${PASCAL_NAME}Component';

// Types
// export type { ${PASCAL_NAME}Type } from './types/${NAME}.types';
EOF

# Create placeholder page
cat > "$FEATURE_DIR/pages/${PASCAL_NAME}Page.tsx" << EOF
/**
 * ${PASCAL_NAME} page component
 */
export function ${PASCAL_NAME}Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">${PASCAL_NAME}</h1>
      <p className="mt-1 text-muted-foreground">
        ${PASCAL_NAME} feature page
      </p>
    </div>
  );
}
EOF

# Create placeholder types
cat > "$FEATURE_DIR/types/${NAME}.types.ts" << EOF
/**
 * ${PASCAL_NAME} types
 */
export interface ${PASCAL_NAME}Type {
  id: string;
  // Add your type properties here
}
EOF

echo -e "${GREEN}✓ Created feature at $FEATURE_DIR${NC}"
echo ""
echo "Next steps:"
echo ""
echo -e "${YELLOW}1. Add route in src/routes/routes.tsx:${NC}"
echo ""
echo "   // Add lazy import"
echo "   const ${PASCAL_NAME}Page = lazy(() =>"
echo "     import('@/features/$NAME').then((m) => ({ default: m.${PASCAL_NAME}Page }))"
echo "   );"
echo ""
echo "   // Add to children array"
echo "   { path: '/$NAME', element: <${PASCAL_NAME}Page /> },"
echo ""
echo -e "${YELLOW}2. Add nav item in src/config/navigation.config.ts:${NC}"
echo ""
echo "   {"
echo "     id: '$NAME',"
echo "     label: '${PASCAL_NAME}',"
echo "     path: '/$NAME',"
echo "     icon: YourIcon,"
echo "   },"
echo ""
