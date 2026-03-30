:: Do not display commands in the terminal
@echo off

:: If there is no bild directory, then make build directory
if not exist build (
    echo Make a build directory in the project root...
    mkdir build
)

echo Entering the C++ directory...
cd src/c++

echo Compiling C++ to WebAssembly...
em++ lib.cpp -sMODULARIZE -sEXPORT_ES6 -sENVIRONMENT=web --bind -o ../../build/lib.js

echo Done! Successfully compiled C++ to WebAssembly in the build directory.