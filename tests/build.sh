#!/bin/bash
# run from repo root!


# transpile elements files
echo 'building elements files for testing'
tsc --esModuleInterop -outDir tests src/Elements.tsx

echo "done - run tests with 'node tests/test_elements.js'"
