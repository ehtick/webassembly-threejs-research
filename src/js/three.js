import * as THREE from 'three';
import { PARAMS } from './gui';

let lastTime = performance.now();
let frames = 0;
let fps = 0;
const RESPONSIVE_FPS = 1000;

function initThreeJS() {
    // Set the scene size
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    // Set the camera attributes
    const FOV = 75;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1;
    const FAR = 1000;

    // Set up the geometry
    const BOX_SIZE = new THREE.Vector3( 1, 1, 1);
    const BOX_COLOR = 0x00ff00;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT, true);
    renderer.setAnimationLoop ( animate );
    document.body.appendChild( renderer.domElement );

    const boxGeometry = new THREE.BoxGeometry( BOX_SIZE.x, BOX_SIZE.y, BOX_SIZE.z );
    const material = new THREE.MeshBasicMaterial( { color: BOX_COLOR } );
    const cube = new THREE.Mesh( boxGeometry, material );
    scene.add( cube );
    
    // Particles
    const PARTICLE_COUNT = 100;
    const COMPONENTS_PER_PARTICLE = 3; // x, y, z

    const ARRAY_LENGTH = PARTICLE_COUNT * COMPONENTS_PER_PARTICLE;

    const POINT_SIZE = 0.5;
    const POINT_COLOR = 0x00ff00;
    
    const POSITION_ARRAY = new Float32Array(ARRAY_LENGTH);
    const VELOCITY_ARRAY = new Float32Array(ARRAY_LENGTH);

    const POS_SCALE = 50;
    const VEL_SCALE = 2;
    // Set a random number in each posistion and velocity
    for (let i = 0; i < ARRAY_LENGTH; i++) {
        // Range: -0.5, +0.5
        const POS_RANGE = (Math.random() - 0.5); 
        const VEL_RANGE = (Math.random() - 0.5);
            
        POSITION_ARRAY[i] = POS_RANGE * POS_SCALE;
        VELOCITY_ARRAY[i] = VEL_RANGE * VEL_SCALE;
    }
    
    const GEOMETRY = new THREE.BufferGeometry();
    GEOMETRY.setAttribute('position', new THREE.BufferAttribute(POSITION_ARRAY, 3));

    const MATERIAL = new THREE.PointsMaterial({ size: POINT_SIZE, color: POINT_COLOR  });
    const POINTS = new THREE.Points(GEOMETRY, MATERIAL);
    scene.add(POINTS);

    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.material.color.set(PARAMS.cubeColor);
        cube.material.wireframe = PARAMS.wireframe;

        renderer.render( scene, camera );

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