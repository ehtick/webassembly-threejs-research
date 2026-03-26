import WebGL from 'three/addons/capabilities/WebGL.js';
import { ThreeApp } from './threeApp';
import { DebugGUI } from './debugGUI';
import { FPSCounter } from './fpsCounter';
import { Particles } from './particles';

const container = document.body;

if (WebGL.isWebGL2Available()) {  
  const debugGUI = new DebugGUI({container: container.canvas});
  const { type, count, spread, speed, pushApart, size, pointcolor: color, boxWireframe: wireframe, boxBounceable: isBounceable } = debugGUI.object.particles.input;
  const { cameraSpeed, enableControls, antialias, running: isRunning } = debugGUI.object.threeApp.input;
  
  let particles = new Particles({ type: type.default, count, spread, speed, pushApart, size, color, wireframe, isBounceable });
  const fpsCounter = new FPSCounter();
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

  function update(object) {
    const { type, count, spread, speed, pushApart, size, pointcolor: color, boxWireframe: wireframe, boxBounceable: isBounceable } = object.particles.input;
    const { backgroundcolor, fov, near, far, cameraX, cameraY, cameraZ, cameraSpeed, enableControls, antialias, running: isRunning } = object.threeApp.input;

    // Update Particles
    threeApp.removeScene();
    particles.updateSetup({ type: type.default, count, spread, speed, pushApart, size, color, wireframe, isBounceable });
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