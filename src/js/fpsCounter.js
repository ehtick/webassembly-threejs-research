class FPSCounter {
    constructor({ frames = 0, fps = 0, responsiveFps = 1000 } = {}) {
        this.lastTime = performance.now();
        this.frames = frames;
        this.fps = fps;
        this.responsiveFps = responsiveFps;
    }

    update() {
        const nowTime = performance.now();
        const deltaTime = nowTime - this.lastTime;
        
        this.frames++;

        if (deltaTime >= this.responsiveFps) {
            this.fps = Math.round((this.frames * this.responsiveFps) / deltaTime);
            this.frames = 0;
            this.lastTime = nowTime;
        }

        return this.fps;
    }
}

export { FPSCounter }