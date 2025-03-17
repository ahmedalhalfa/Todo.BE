#!/bin/bash

set -e

echo ""
echo "=============================================="
echo "  Starting test run"
echo "==============================================="
echo ""

echo ""
echo "=============================================="
echo "  Running Unit tests"
echo "==============================================="
echo ""

# Run unit tests with coverage thresholds based on current coverage
npx jest --forceExit --detectOpenHandles --coverage --coverageThreshold='{"global":{"branches":10,"functions":20,"lines":20,"statements":20}}'

if [ $? -eq 0 ]; then
  echo "Unit tests completed successfully"
else
  echo "Unit tests failed with exit code $?"
  exit 1
fi

echo ""
echo "=============================================="
echo "  Running E2E tests"
echo "==============================================="
echo ""

# Run e2e tests with coverage thresholds
npx jest --config ./test/jest-e2e.json --forceExit --detectOpenHandles --coverage --coverageThreshold='{"global":{"branches":10,"functions":10,"lines":10,"statements":10}}'

if [ $? -eq 0 ]; then
  echo "E2E tests completed successfully"
else
  echo "E2E tests failed with exit code $?"
  exit 1
fi

echo ""
echo "All tests completed successfully"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
  echo -e "\n${GREEN}=============================================="
  echo -e "  $1"
  echo -e "===============================================${NC}\n"
}

# Function to run jest with specific config
run_tests() {
  TEST_TYPE=$1
  CONFIG=$2
  THRESHOLD=$3
  
  print_section "Running $TEST_TYPE tests"
  
  if [ -z "$CONFIG" ]; then
    npx jest --coverage --forceExit --detectOpenHandles --coverageThreshold='{"global":{"branches":'$THRESHOLD',"functions":'$THRESHOLD',"lines":'$THRESHOLD',"statements":'$THRESHOLD'}}'
  else
    npx jest --config $CONFIG --coverage --forceExit --detectOpenHandles --coverageThreshold='{"global":{"branches":'$THRESHOLD',"functions":'$THRESHOLD',"lines":'$THRESHOLD',"statements":'$THRESHOLD'}}'
  fi
  
  local EXIT_CODE=$?
  
  if [ $EXIT_CODE -ne 0 ]; then
    echo -e "\n${RED}$TEST_TYPE tests failed with exit code $EXIT_CODE${NC}"
    if [ "$TEST_TYPE" == "Unit" ]; then
      exit 1
    fi
  else
    echo -e "\n${GREEN}$TEST_TYPE tests passed${NC}"
  fi
}

# Generate combined coverage report
print_section "Test Coverage Report"
if [ -f "coverage/lcov-report/index.html" ]; then
  cat coverage/lcov-report/index.html | grep -E 'percentage|strong'
else
  echo -e "${YELLOW}Coverage report not found.${NC}"
fi

print_section "Tests completed" 