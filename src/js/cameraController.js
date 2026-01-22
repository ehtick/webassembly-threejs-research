import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

class CameraController {
    constructor({ fov = 75, aspect = 1920/1080, near = 0.1, far = 1000, speed = 10, renderer } = {} ) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.speed = speed;
        this.move = {
            forward: false,
            backward: false,
            right: false,
            left: false,
            up: false,
            down: false
        }
        this.keyMap = {
            KeyW: 'forward',
            KeyS: 'backward',
            KeyD: 'right',
            KeyA: 'left',
            Space: 'up',
            KeyC: 'down'
        }

        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);

        if (!renderer) {
            throw new Error('CameraController requires a renderer');
        } else {
            this.controls = new PointerLockControls(this.camera, renderer.domElement);
        }
    }

    bindEvents() {
        const { controls, move, keyMap } = this;
        
        // Click to lock pointer and start moving
        document.addEventListener('click', () => {
            if (controls.isLocked) {
                controls.unlock();
            } else {
                controls.lock();
            }
        });
        
        document.addEventListener('keydown', (event) => {
            let direction = keyMap[event.code];
            
            if (direction) {
                move[direction] = true;
            }
        });

        document.addEventListener('keyup', (event) => {
            let direction = keyMap[event.code];

            if (direction) {
                move[direction] = false;
            }
        });
    }

    update(deltaTime) {
        const { move, controls, camera } = this;
        let speed = this.speed * deltaTime;

        if(move.forward) {
            controls.moveForward(speed);
        }
        if(move.backward) {
            controls.moveForward(-speed);
        }
        if(move.right) {
            controls.moveRight(speed);
        }
        if(move.left) {
            controls.moveRight(-speed);
        }
        if(move.up) {
            camera.position.y += speed;
        }
        if(move.down) {
            camera.position.y -= speed;
        }
    }
}

export { CameraController }