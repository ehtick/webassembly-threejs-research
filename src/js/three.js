import * as THREE from 'three';
import { CameraController } from './cameraController';

class ThreeJS {
    constructor({ debugGUI, fpsCounter } = {} ) {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        this.debugGUI = debugGUI;
        this.fpsCounter = fpsCounter;
    }
    
    createRenderer({ container, width = 1920, height = 1080 } = {}) {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height, true);
        container.appendChild(this.renderer.domElement);
    }
    
    createCamera({ fov = 75, aspect = 1920/1080, near = 0.1, far = 1000, enableControls = false } = {}) {
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.z = 60;

        if (enableControls) {
            this.cameraController = new CameraController({camera: this.camera, renderer: this.renderer});    
            this.cameraController.bindEvents();
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