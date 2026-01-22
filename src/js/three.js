import * as THREE from 'three';
import { PARAMS } from './gui';
import { Particles } from './particles';
import { CameraController } from './cameraController';

let lastTime = performance.now();
let frames = 0;
let fps = 0;
const RESPONSIVE_FPS = 1000;

function initThreeJS() {
    // Set the scene size
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    // Set up the geometry
    const BOX_SIZE = new THREE.Vector3( 1, 1, 1);
    const BOX_COLOR = 0x00ff00;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT, true);
    renderer.setAnimationLoop ( animate );
    document.body.appendChild( renderer.domElement );

    let cameraController = new CameraController({ renderer, aspect: WIDTH/HEIGHT});
    cameraController.bindEvents();
    cameraController.camera.position.z = 60;

    const boxGeometry = new THREE.BoxGeometry( BOX_SIZE.x, BOX_SIZE.y, BOX_SIZE.z );
    const material = new THREE.MeshBasicMaterial( { color: BOX_COLOR } );
    const cube = new THREE.Mesh( boxGeometry, material );
    scene.add( cube );
    
    const particles = new Particles();
    scene.add( particles.mesh );

    const clock = new THREE.Clock();

    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.material.color.set(PARAMS.cubeColor);
        cube.material.wireframe = PARAMS.wireframe;

let deltaTime = clock.getDelta();

        particles.update();
        cameraController.update(deltaTime);

        renderer.render( scene, cameraController.camera );

        // FPS calculation
        frames++;
        const now = performance.now();
        if (now - lastTime >= RESPONSIVE_FPS) {
            fps = Math.round((frames * 1000) / (now - lastTime));
            frames = 0;
            lastTime = now;
        }

        PARAMS.fps = fps;
        PARAMS.calls = renderer.info.render.calls;
        PARAMS.triangles = renderer.info.render.triangles;
        PARAMS.geometries = renderer.info.memory.geometries;
        PARAMS.textures = renderer.info.memory.textures;
    }
}

export { initThreeJS }