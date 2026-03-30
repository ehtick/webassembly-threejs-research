#!/usr/bin/env bash

# Exit when an error occur on command
set -e

# If there is no bild directory, then make build directory
if [ ! -d "build" ]; then
    echo "Make a build directory in the project root..."
    mkdir build
fi

echo "Entering the C++ directory..."
cd src/c++

echo "Compiling C++ to WebAssembly..."
em++ lib.cpp -sMODULARIZE -sEXPORT_ES6 -sENVIRONMENT=web --bind -o ../../build/lib.js

echo "Done! Successfully compiled C++ to WebAssembly in the build directory."