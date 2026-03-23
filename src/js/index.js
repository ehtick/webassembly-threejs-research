import WebGL from 'three/addons/capabilities/WebGL.js';
import { ThreeApp } from './threeApp';
import { DebugGUI } from './debugGUI';
import { FPSCounter } from './fpsCounter';
import { Particles } from './particles';

const container = document.body;

if (WebGL.isWebGL2Available()) {  
  const debugGUI = new DebugGUI({container: container.canvas});
  const { type, count, spread, speed, size, color, wireframe, bounceable: isBounceable} = debugGUI.object.particles.input;
  const { running: isRunning } = debugGUI.object.threeApp.input;
  
  let particles = new Particles({ type: type.default, count, spread, speed, size, color, wireframe, isBounceable });
  
  const fpsCounter = new FPSCounter();
  const threeApp = new ThreeApp({debugGUI, fpsCounter});

  threeApp.createRenderer({container, width: window.innerWidth, height: window.innerHeight});
  threeApp.createCamera({aspect: window.innerWidth / window.innerHeight, enableControls: true});
  threeApp.addScene(particles);
  threeApp.setRunning(isRunning);

  window.addEventListener("resize", (event) => {
    threeApp.updateRenderer({width: window.innerWidth, height: window.innerHeight});
    threeApp.updateCamera({aspect: window.innerWidth / window.innerHeight});
  })

  function update(object) {
    const { type, count, spread, speed, size, color, wireframe, bounceable: isBounceable } = object.particles.input;
    const { running: isRunning } = object.threeApp.input;

    threeApp.removeScene();
    particles.updateSetup({ type: type.default, count, spread, speed, size, color, wireframe, isBounceable });
    threeApp.addScene(particles);
    
    threeApp.setRunning(isRunning);
  }

  debugGUI.start({onChange: update});
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  container.appendChild(warning);
}