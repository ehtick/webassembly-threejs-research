#!/usr/bin/env bash

# Exit when an error occur on command
set -e

echo "Make a build/c++ directory in the project root..."
mkdir -p build/c++

echo "Entering the C++ directory..."
cd src/c++

echo "Compiling C++ to WebAssembly..."
em++ -std=c++17 -Os -flto lib.cpp -s ENVIRONMENT=web -s MODULARIZE -s EXPORT_ES6 -s EXPORTED_FUNCTIONS="['_malloc','_free']" -s EXPORTED_RUNTIME_METHODS="['HEAPF32']" -lembind -o ../../build/c++/lib.js

echo "Done! Successfully compiled C++ to WebAssembly in the build/c++ directory."