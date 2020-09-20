#!/bin/bash
# run from repo root!

echo 'building server files'

# transpile files needed for the back end server
tsc --esModuleInterop -outDir server src/Elements.tsx
tsc --esModuleInterop -outDir server src/secrets.tsx

echo 'done - start back end server manually'
