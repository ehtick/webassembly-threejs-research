import * as THREE from 'three';
import { PARAMS } from './gui';
import { Particles } from './particles';
import { CameraController } from './cameraController';
import { FPSCounter } from './fpsCounter';

let fpsCounter = new FPSCounter();
let scene;
let particles; 

function createGeometry(params = {}) {
    const {type, count, size, color, posBounds, speed} = params;
    
    scene = new THREE.Scene();
    
    if (particles) {
        scene.remove(particles.mesh);
        particles.disposeGeometry?.();
    } 
    particles = new Particles({ type, count, size, color, posBounds, speed });
    scene.add( particles.mesh );
}

function initThreeJS() {
    // Set the scene size
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT, true);
    renderer.setAnimationLoop ( animate );
    document.body.appendChild( renderer.domElement );

    let cameraController = new CameraController({ renderer, aspect: WIDTH/HEIGHT});
    cameraController.bindEvents();
    cameraController.camera.position.z = 60;
    
    createGeometry(PARAMS);

    const clock = new THREE.Clock();
    function animate() {
        let deltaTime = clock.getDelta();

        particles.update(deltaTime);
        cameraController.update(deltaTime);

        renderer.render( scene, cameraController.camera );

        PARAMS.fps = fpsCounter.update();
        PARAMS.calls = renderer.info.render.calls;
        PARAMS.triangles = renderer.info.render.triangles;
        PARAMS.geometries = renderer.info.memory.geometries;
        PARAMS.textures = renderer.info.memory.textures;
        
        if (performance.memory) {
            PARAMS.JsHeapMB = performance.memory.usedJSHeapSize / 1048576;
        }
    }
}

export { initThreeJS, createGeometry }