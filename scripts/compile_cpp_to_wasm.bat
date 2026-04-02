:: Do not display commands in the terminal
@echo off

echo Make a build/c++ directory in the project root...
mkdir build/c++

echo Entering the C++ directory...
cd src/c++

echo Compiling C++ to WebAssembly...
em++ -std=c++17 lib.cpp -s ENVIRONMENT=web -s MODULARIZE -s EXPORT_ES6 -lembind -o ../../build/c++/lib.js

echo Done! Successfully compiled C++ to WebAssembly in the build/c++ directory.