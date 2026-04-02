# webassembly-threejs-research

**This project is an experimental research project focused on 3D Particle System using WebAssembly and Three.js.**  

*Note: This research prototype is not production-ready.*  

## Tested with

This project was tested with the following tools and versions:
- **Emscipten** 5.0.4 (em++)
- **wasm-pack** 0.14.0
- **wasm-bindgen** 0.2.117
- **three.js** 0.182.0
- **vite** 7.3.1
- **lil-gui** 0.21.0
- **cargo** 1.89.0
- **npm** 11.6.2
- **node.js** 24.13.0
- **C++17**
- **Rust** 1.89.0

## Cloning This Repository  

The repository can be cloned in two ways:

- **Using Git:** Run the following command in a terminal.
```sh 
git clone https://github.com/a23dilel/webassembly-threejs-research.git
```

- **Download ZIP:** On the GitHub page, click the green **Code** button and select **Download ZIP**.

## Installation and Setup

### Emscripten

1. To run and build this project using Emscripten 5.0.4, you need to install the following:  
- **Node.js** (18.3.0 or above) 
- **Python** (3.8 or above) 
- **Git** (for cloning and managing repositories)

*Note: To learn more about Emscripten requirements, you can see the official documentation:   [Emscripten Toolchain Requirements](https://emscripten.org/docs/building_from_source/toolchain_what_is_needed.html#toolchain-what-you-need) and [Test which tools are installed](https://emscripten.org/docs/building_from_source/toolchain_what_is_needed.html#toolchain-test-which-dependencies-are-installed)*

1. Navigate to the root directory of the project, which called the **webassembly-threejs-research** folder.
```sh
cd webassembly-threejs-research/
```

2. Install the Emscripten SDK (emsdk) version 5.0.4 and activate it for the current user.
- **Linux/MacOS:**
```sh
./scripts/setup_emsdk.sh 
```

- **Windows:**
```sh
scripts/setup_emsdk.bat 
```
*Note: The shell and batch files are set to install Emscripten SDK version 5.0.4.*

3. Next is activate the PATH and other environment variables in the current terminal.
- **Linux/MacOS:**
```sh
source ./emsdk/emsdk_env.sh 
```

- **Windows:**
```sh
emsdk/emsdk_env.bat
```
*Note: You need to activate the PATH on Linux/macOS or Windows every time you open a new terminal to use Emscripten commands. Otherwise, the commands will not work.*

4. Now check that the Emscripten command is working.
```sh
em++ -v
```

5. Now, compile the C++ code (**lib.cpp**) to WebAssembly, which will generate **lib.js** and **lib.wasm** in the `build/c++` directory.
- **Linux/MacOS:**
```sh
./scripts/compile_cpp_to_wasm.sh 
```

- **Windows:**
```sh
scripts/compile_cpp_to_wasm.bat 
```
*Note: The shell and batch files are set to compile C++17 using em++ with flags such as ENVIRONMENT, MODULARIZE and others.*

6. Done! JavaScript will now import the **lib.js** file from the `build/c++` directory.

### Wasm-pack

1. Navigate to the root directory of the project, which called the **webassembly-threejs-research** folder.
```sh
cd webassembly-threejs-research/
```

2. Install wasm-pack version 0.14.0.
```sh
cargo install wasm-pack --version 0.14.0
```

3. Now, compile the Rust code (**lib.rs**) to WebAssembly, which will generate **lib.js** and **lib_bg.wasm** in the `build/rust` directory.
- **Linux/MacOS:**
```sh
./scripts/compile_rust_to_wasm.sh 
```

- **Windows:**
```sh
scripts/compile_rust_to_wasm.bat 
```

6. Done! JavaScript will now import the **lib.js** file from the `build/rust` directory.

### Three.js

1. Navigate to the root directory of the project, which called the **webassembly-threejs-research** folder.
```sh
cd webassembly-threejs-research/
```

2. Install the required dependencies. The project depends on Three.js, Vite and lil-gui, which are listed in package-lock.json.
```sh
npm install
```

3. After installing all dependencies, then start the project.
- **Linux/MacOS:**
```sh
npx vite ./src/
```

- **Windows:**
```sh
npx vite src/
```

4. After running the command, a local HTTP address will show in the terminal, which need to click the link or copy and paste it into your web browser's address bar, then press **Enter** to open the project. Here is an example of what a local HTTP address should look like in the terminal.
```sh
http:localhost:5173/
```

5. The setup is now complete and you can start using the project.