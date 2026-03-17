import * as THREE from 'three';
import { CameraController } from './cameraController';

class ThreeJS {
    constructor({ debugGUI, fpsCounter } = {} ) {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        this.debugGUI = debugGUI;
        this.fpsCounter = fpsCounter;
    }

    createRenderer({ container, width = window.innerWidth, height = window.innerHeight } = {}) {
        if (!container) {
            throw new Error('Container DOM element is required.');
        } else {
            if(!this.renderer) {
                this.renderer = new THREE.WebGLRenderer();
                container.appendChild(this.renderer.domElement);

                this.updateRenderer({ width, height });
            } else {
                throw new Error('Renderer already exists.');
            }
        }
    }
    
    updateRenderer({ width, height } = {}) {
        if(!this.renderer) {
            throw new Error('Renderer does not exists!');
        } else {
            if (Number.isFinite(width) && Number.isFinite(height)){
                this.renderer.setSize(width, height, true);
            } else {
                throw new Error(`Invalid width or height: width=${width}, height=${height}. Must be finite numbers.`);
            }
        }
    }
    
    createCamera({ fov = 75,  aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000, position = new THREE.Vector3(0, 0, 60), enableControls = false } = {}) {
        if(!this.camera) {
            this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        } else {
            throw new Error('Camera already exists!');
        }
        
        if (enableControls) {
            this.cameraController = new CameraController({camera: this.camera, renderer: this.renderer});    
            this.cameraController.bindEvents();
        }

        this.updateCamera({ fov, aspect, near, far, position });
    }

    updateCamera({ fov, aspect, near, far, position } = {}) {
        if(!this.camera) {
            throw new Error('Camera does not exists!');
        } else {
            if (fov !== undefined) {
                this.camera.fov = fov;
            } else {
                throw new Error('FOV is undefined');
            }
            
            if (aspect !== undefined) {
                this.camera.aspect = aspect;
            } else {
                throw new Error('Aspect is undefined');
            }

            if (near !== undefined) {
                this.camera.near = near;
            } else {
                throw new Error('Near is undefined');
            }

            if (far !== undefined) {
                this.camera.far = far;
            } else {
                throw new Error('Far is undefined');
            }

            if (position !== undefined) {
                this.camera.position.copy(position);
            } else {
                throw new Error('Cameras position is undefined');
            }
            this.camera.updateProjectionMatrix();
        }
    }

    createGeometry(geometry) {
        if (this.geometry) {
            this.scene.remove(this.geometry.mesh);
            this.geometry.disposeGeometry?.();
        }

        this.geometry = geometry;
        this.scene.add(this.geometry.mesh);
    }

    update() {
        this.renderer.setAnimationLoop (this.animate);
    }

    animate = () => {
        const deltaTime = this.clock.getDelta();
        
        if (this.geometry) {
        }
        this.geometry.update(deltaTime);

        if (this.cameraController) {
            this.cameraController.update(deltaTime);
        }

        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        const display = this.debugGUI.object.performance.display;
        const rendererInfo = this.renderer.info.render;
        
        display.fps = this.fpsCounter.update();
        display.calls = rendererInfo.calls;
        display.triangles = rendererInfo.triangles;
        display.geometries = rendererInfo.geometries;
        display.textures = rendererInfo.textures;
        
        if (performance.memory) {
            display.JsHeapMB = performance.memory.usedJSHeapSize / 1048576;
        }
    }
}

export { ThreeJS }