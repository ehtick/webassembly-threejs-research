import * as THREE from 'three';
import { CameraController } from './cameraController';

class ThreeApp {
    constructor({ debugGUI, profiler } = {} ) {
        this.clock = new THREE.Clock();
        this.debugGUI = debugGUI;
        this.profiler = profiler;
    }

    createScene({ backgroundcolor = 0x000000 } = {}) {
        if(!this.scene) {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(backgroundcolor);
        } else {
            throw new Error('Scene already exists!');
        }
    }

    updateScene({ backgroundcolor } = {}) {
        if(!this.scene) {
            throw new Error('Scene does not exists!');
        } else {
            this.scene.background = new THREE.Color(backgroundcolor);
        }
    }

    createRenderer({ container, width = window.innerWidth, height = window.innerHeight, antialias = true } = {}) {
        if (!container) {
            throw new Error('Container DOM element is required.');
        } else {
            if(!this.renderer) {
                this.renderer = new THREE.WebGLRenderer({antialias});
                this.renderer.setSize(width, height, true);
                container.appendChild(this.renderer.domElement);
            } else {
                throw new Error('Renderer already exists!');
            }
        }
    }
    
    updateRenderer({ width, height, antialias} = {}) {
        if(!this.renderer) {
            throw new Error('Renderer does not exists!');
        } else {
            if(width !== undefined && height !== undefined) { 
                if (Number.isFinite(width) && Number.isFinite(height)){
                    this.renderer.setSize(width, height, true);
                } else {
                    throw new Error(`Invalid width or height: width=${width}, height=${height}. Must be finite numbers.`);
                }
            }

            if(antialias !== undefined) { 
                if (typeof antialias === "boolean") {
                    this.renderer.antialias = antialias;
                } else {
                    throw new Error('antialias must be a boolean');
                }
            }
        }
    }
    
    createCamera({ fov = 75,  aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000, cameraX = 0, cameraY = 0, cameraZ = 60, speed = 10, enableControls = false } = {}) {
        if(!this.camera) {
            this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            const position = new THREE.Vector3(cameraX, cameraY, cameraZ)
            this.camera.position.copy(position);
            this.camera.updateProjectionMatrix();

            if (enableControls) {
                this.cameraController = new CameraController({camera: this.camera, renderer: this.renderer, speed});
                this.cameraController.bindEvents(true);  
            } else {
                this.cameraController.bindEvents(false);  
                this.cameraController = null;
            }
        } else {
            throw new Error('Camera already exists!');
        }
    }

    updateCamera({ fov, aspect, near, far, cameraX, cameraY, cameraZ, speed, enableControls } = {}) {
        if(!this.camera) {
            throw new Error('Camera does not exists!');
        } else {
            this.#setIfFinite(this.camera, 'fov', fov);
            this.#setIfFinite(this.camera, 'aspect', aspect);
            this.#setIfFinite(this.camera, 'near', near);
            this.#setIfFinite(this.camera, 'far', far);

            if(cameraX !== undefined && cameraY !== undefined && cameraZ !== undefined) {
                const position = new THREE.Vector3(cameraX, cameraY, cameraZ)
                if (Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z)) {
                    this.camera.position.copy(position);
                } else {
                    throw new Error(`Invalid position: x=${position.x}, y=${position.y}, z=${position.z}. Must be finite numbers.`);
                }
            }

            if(enableControls !== undefined) {
                if (typeof enableControls === "boolean") {
                    if (!this.cameraController) {
                        this.cameraController = new CameraController({camera: this.camera, renderer: this.renderer});
                    }
                    
                    if (enableControls) {
                        this.cameraController.setSpeed(speed);
                        this.cameraController.bindEvents(true); 
                    } else {
                        this.cameraController.bindEvents(false); 
                        this.cameraController = null;
                    }
                } else {
                    throw new Error('enableControls must be a boolean');
                }
            }

            this.camera.updateProjectionMatrix();
        }
    }

    #setIfFinite(object, key, value) {
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

    removeScene() {
        if (this.geometry) {
            this.scene.remove(this.geometry.getGeometry());
            this.geometry = null;
        }
    }

    addScene(geometry) {
        if (geometry) {
            this.geometry = geometry;
            this.scene.add(this.geometry.getGeometry());
        }
    }

    setRunning(isRunning) {
        if(isRunning) {
            this.#setLoop(this.#animate);
        } else {
            this.#setLoop(null);
        }
    }

    #setLoop(callback) {
        if (!this.renderer) {
            throw new Error("Renderer not created");
        } else {
            this.renderer.setAnimationLoop(callback);
        }
    }

    #animate = () => {
        const fps = this.profiler.measureFPS();
        const deltaTime = this.clock.getDelta();
        
        if (this.geometry) {
            if(this.profiler) {
                this.profiler.startFrame();

                this.profiler.startExec("geometry");
                this.geometry.update(deltaTime);
                this.profiler.endExec();

                this.profiler.endFrame();
            } else {
                this.geometry.update(deltaTime);
            }
        }

        if (this.cameraController) {
            this.cameraController.update(deltaTime);
        }

        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        if (this.debugGUI) {
            const performanceDisplay = this.debugGUI.object.performance.display;
            const gpuDisplay = this.debugGUI.object.gpu.display;
            const rendererInfo = this.renderer.info;
            
            if(this.profiler) {
                performanceDisplay.fps = fps;
            }
            performanceDisplay.calls = rendererInfo.render.calls;
            performanceDisplay.frame = rendererInfo.render.frame;
            performanceDisplay.lines = rendererInfo.render.lines;
            performanceDisplay.points = rendererInfo.render.points;
            performanceDisplay.triangles = rendererInfo.render.triangles;
            performanceDisplay.textures = rendererInfo.render.textures;
            
            gpuDisplay.geometries = rendererInfo.memory.geometries;
            gpuDisplay.textures = rendererInfo.memory.textures;
        }
    }
}

export { ThreeApp }