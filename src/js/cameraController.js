import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

class CameraController {
    constructor({ camera, renderer, speed = 10 } = {}) {
        this.camera = camera;
        this.renderer = renderer;
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

        if (!this.camera || !this.renderer) {
            throw new Error('CameraController requires a camera and renderer');
        } else {
            this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        }
    }

    setSpeed(speed) {
        if(speed) {
            this.speed = speed;
        }
    }

    bindEvents() {
        const { controls, move, keyMap } = this;
        
        // Click to lock pointer and start moving
        this.renderer.domElement.addEventListener('click', () => {
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