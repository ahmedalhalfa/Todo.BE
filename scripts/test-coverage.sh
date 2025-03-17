#!/bin/bash

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
    npx jest --coverage --coverageThreshold='{"global":{"branches":'$THRESHOLD',"functions":'$THRESHOLD',"lines":'$THRESHOLD',"statements":'$THRESHOLD'}}'
  else
    npx jest --config $CONFIG --coverage --coverageThreshold='{"global":{"branches":'$THRESHOLD',"functions":'$THRESHOLD',"lines":'$THRESHOLD',"statements":'$THRESHOLD'}}'
  fi
  
  if [ $? -ne 0 ]; then
    echo -e "\n${RED}$TEST_TYPE tests failed${NC}"
    if [ "$TEST_TYPE" == "Unit" ]; then
      exit 1
    fi
  else
    echo -e "\n${GREEN}$TEST_TYPE tests passed${NC}"
  fi
}

print_section "Starting test run"

# Run unit tests
run_tests "Unit" "" 70

# Run e2e tests
run_tests "E2E" "./test/jest-e2e.json" 60

# Generate combined coverage report
print_section "Test Coverage Report"
cat coverage/lcov-report/index.html | grep -E 'percentage|strong'

print_section "Tests completed" 