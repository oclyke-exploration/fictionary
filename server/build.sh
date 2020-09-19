#!/bin/bash
# run from repo root!

echo 'building server files'

# transpile files needed for the back end server
tsc -outDir server src/Elements.tsx

echo 'done - start back end server manually'
