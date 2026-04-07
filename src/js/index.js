import WebGL from 'three/addons/capabilities/WebGL.js';
import { ThreeApp } from './threeApp';
import { DebugGUI } from './debugGUI';
import { FPSCounter } from './fpsCounter';
import { Particles } from './particles';
import createModule from "../../build/c++/lib.js";
import init from "../../build/rust/lib.js";

const container = document.body;

if (WebGL.isWebGL2Available()) {  
  const debugGUI = new DebugGUI({container: container.canvas});
  const { typeLanguage, type, count, spread, speed, cubePushApart: pushApart, size, pointcolor: color, cubeWireframe: wireframe, cubeBounceable: isBounceable } = debugGUI.object.particles.input;
  const { cameraSpeed, enableControls, antialias, running: isRunning } = debugGUI.object.threeApp.input;
  const { fps: isFPS, hours } = debugGUI.object.measure.input;
  const module = await getModule(typeLanguage);
  
  let particles = new Particles({ module, type: type.default, count, spread, speed, pushApart, size, color, wireframe, isBounceable });
  const fpsCounter = new FPSCounter();
  
  if(isFPS) {
    fpsCounter.setHours(hours);
    fpsCounter.start();

    // Check time left every second
    setInterval(() => {
      debugGUI.object.measure.display.timeLeftDisplay = fpsCounter.getTimeLeft();
    }, 1000);
  } else {
    fpsCounter.start();
  }

  const threeApp = new ThreeApp({debugGUI, fpsCounter});

  threeApp.createScene();
  threeApp.createRenderer({container, width: window.innerWidth, height: window.innerHeight, antialias});
  threeApp.createCamera({aspect: window.innerWidth / window.innerHeight, speed: cameraSpeed, enableControls});
  threeApp.addScene(particles);
  threeApp.setRunning(isRunning);

  window.addEventListener("resize", (event) => {
    threeApp.updateRenderer({width: window.innerWidth, height: window.innerHeight});
    threeApp.updateCamera({aspect: window.innerWidth / window.innerHeight});
  })

  async function getModule(typeLanguage) {
    let module = {};
    
    if(typeLanguage.default === 'c++') {
      module.typeLanguage = typeLanguage.default;
      module.myModule = await createModule(); // Initialize the WASM module
    } else if(typeLanguage.default === 'rust') {
      module.typeLanguage = typeLanguage.default;
      module.myModule = await init(); // Initialize the WASM module
    } else if (typeLanguage.default === 'js') {
      module.typeLanguage = typeLanguage.default;
      module.myModule = null;
    }
    return module;
  }

  async function update(object) {
    const { typeLanguage, type, count, spread, speed, cubePushApart: pushApart, size, pointcolor: color, cubeWireframe: wireframe, cubeBounceable: isBounceable } = object.particles.input;
    const { backgroundcolor, fov, near, far, cameraX, cameraY, cameraZ, cameraSpeed, enableControls, antialias, running: isRunning } = object.threeApp.input;
    const { fps: isFPS, hours } = debugGUI.object.measure.input;
    const module = await getModule(typeLanguage);

    fpsCounter.clear();
    if(isFPS) {
      fpsCounter.setHours(hours);
      fpsCounter.start();
      
      // Check time left every second
      setInterval(() => {
        debugGUI.object.measure.display.timeLeftDisplay = fpsCounter.getTimeLeft();
      }, 1000);
    } else {
      fpsCounter.start();
    }

    // Update Particles
    threeApp.removeScene();
    particles.updateSetup({ module, type: type.default, count, spread, speed, pushApart, size, color, wireframe, isBounceable });
    threeApp.addScene(particles);

    // Update ThreeApp
    threeApp.updateScene({backgroundcolor});
    threeApp.updateRenderer({antialias})
    threeApp.updateCamera({fov, near, far, cameraX, cameraY, cameraZ, speed: cameraSpeed, enableControls})
    threeApp.setRunning(isRunning);
  }

  debugGUI.start({onChange: update, delayOnChange: 5});
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  container.appendChild(warning);
}