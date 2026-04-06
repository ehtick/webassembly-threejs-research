#!/usr/bin/env bash

# Exit when an error occur on command
set -e

echo "Make a build/rust directory in the project root..."
mkdir -p build/rust

echo "Compiling Rust to WebAssembly..."
# release flag will call cargo file in [profile.release]
wasm-pack build --target web --out-dir build/rust --out-name lib --no-pack --no-typescript --release

# Remove .gitignore in the build/rust directory
rm build/rust/.gitignore

echo "Done!"