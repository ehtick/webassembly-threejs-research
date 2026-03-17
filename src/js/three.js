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
                throw new Error('Renderer already exists!');
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
            this.camera.position.copy(position);
            this.camera.updateProjectionMatrix();

            if (enableControls) {
                this.cameraController = new CameraController({camera: this.camera, renderer: this.renderer});
                this.cameraController.bindEvents();  
            } else {
                this.cameraController = null;
            }
        } else {
            throw new Error('Camera already exists!');
        }
    }

    updateCamera({ fov, aspect, near, far, position, enableControls } = {}) {
        if(!this.camera) {
            throw new Error('Camera does not exists!');
        } else {
            this.setIfFinite(this.camera, 'fov', fov);
            this.setIfFinite(this.camera, 'aspect', aspect);
            this.setIfFinite(this.camera, 'near', near);
            this.setIfFinite(this.camera, 'far', far);

            if(position !== undefined) {
                if (Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z)) {
                    this.camera.position.copy(position);
                } else {
                    throw new Error(`Invalid position: x=${position.x}, y=${position.y}, z=${position.z}. Must be finite numbers.`);
                }
            }

            if(enableControls !== undefined) {
                if (typeof enableControls === "boolean") {
                    if (enableControls) {
                        if (!this.cameraController) {
                            this.cameraController = new CameraController({camera: this.camera, renderer: this.renderer});
                        }
                        this.cameraController.bindEvents(); 
                    } else {
                        this.cameraController = null;
                    }
                } else {
                    throw new Error('enableControls must be a boolean');
                }
            }

            this.camera.updateProjectionMatrix();
        }
    }

    setIfFinite(object, key, value) {
        if(value !== undefined) {
            if (Number.isFinite(value)) {
                object[key] = value;
            } else {
                throw new Error(`Invalid ${key}: ${key}=${value}. Must be finite numbers.`);
            }
        } else {
            return;
        }
    }

    createGeometry(geometry) {
        if (!this.geometry) {
            this.geometry = geometry;
            this.scene.add(this.geometry.mesh);
        } else {
            throw new Error('Geometry already exists!');
        }
    }

    destroyGeometry() {
        if (this.geometry) {
            this.scene.remove(this.geometry.mesh);
            this.geometry.disposeGeometry();
            this.geometry = null;
        } else {
            throw new Error('Geometry does not exists!');
        }
    }

    start() {
        this.setLoop(this.animate);
    }

    stop() {
        this.setLoop(this.animate);
    }

    setLoop(callback) {
        if (!this.renderer) {
            throw new Error("Renderer not created");
        } else {
            this.renderer.setAnimationLoop(callback);
        }
    }

    animate = () => {
        const deltaTime = this.clock.getDelta();
        
        if (this.geometry) {
            this.geometry.update(deltaTime);
        }

        if (this.cameraController) {
            this.cameraController.update(deltaTime);
        }

        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        if (this.debugGUI) {
            const display = this.debugGUI.object.performance.display;
            const rendererInfo = this.renderer.info.render;
            
            if(this.fpsCounter) {
                display.fps = this.fpsCounter.update();
            }
            display.calls = rendererInfo.calls;
            display.triangles = rendererInfo.triangles;
            display.geometries = rendererInfo.geometries;
            display.textures = rendererInfo.textures;
        
            if (performance.memory) {
                display.JsHeapMB = performance.memory.usedJSHeapSize / 1048576;
            }
        }
    }
}

export { ThreeJS }