import WebGL from 'three/addons/capabilities/WebGL.js';
import { ThreeApp } from './threeApp';
import { DebugGUI } from './debugGUI';
import { FPSCounter } from './fpsCounter';
import { Particles } from './particles';

const container = document.body;

if (WebGL.isWebGL2Available()) {  
  const debugGUI = new DebugGUI({container: container.canvas});
  const fpsCounter = new FPSCounter();
  let particles = new Particles();

  if(debugGUI) {
    const { type, count, size, color, posBounds, speed } = debugGUI.object.particlesGeometry.input;
    particles = new Particles({ type: type.default, count, size, color, posBounds, speed });
  } 

  const threeApp = new ThreeApp({debugGUI, fpsCounter});
  threeApp.createRenderer({container, width: window.innerWidth, height: window.innerHeight});
  threeApp.createCamera({aspect: window.innerWidth / window.innerHeight, enableControls: true});
  threeApp.setGeometry(particles);
  threeApp.start();
  
  window.addEventListener("resize", (event) => {
    threeApp.updateRenderer({width: window.innerWidth, height: window.innerHeight});
    threeApp.updateCamera({aspect: window.innerWidth / window.innerHeight});
  })

  debugGUI.start({onChange: update})
  
  function update(object) {
    const { type, count, size, color, posBounds, speed } = object.particlesGeometry.input;
    particles = new Particles({ type: type.default, count, size, color, posBounds, speed });
    threeApp.setGeometry(particles);
  }
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  container.appendChild(warning);
}