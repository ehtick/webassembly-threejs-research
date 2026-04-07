class FPSCounter {
    constructor({ responsiveFps = 1000 } = {}) {
        this.responsiveFps = responsiveFps;
        this.clear();
    }

    clear() {
        this.durationMs = 0;
        this.initStartTime = 0;
        this.lastTime = 0;
        this.frames = 0;
        this.fps = 0;
        this.fpsResults = [];
        this.isPromptable = false;
    }

    showPrompt() {
        const hours = prompt("How many hours to mesure FPS?");
        this.durationMs = Number(hours) * 60 * 60 * 1000;
        this.isPromptable = true;
    }

    measureFPS() {
        this.frames++;
        const nowTime = performance.now();
        const deltaTime = nowTime - this.lastTime;
        
        if (deltaTime >= this.responsiveFps) {
            this.fps = Math.round((this.frames * this.responsiveFps) / deltaTime);

            this.fpsResults.push({
                result: this.fps
            })

            // Reset counters
            this.frames = 0;
            this.lastTime = nowTime;
        }

        if(this.isPromptable) {
            if (!this.isStopped && (nowTime - this.initStartTime >= this.durationMs)) {
                this.stop();
                return;
            }
        }

        return this.fps;
    }

    start() {
        this.initStartTime = performance.now();
        this.lastTime = performance.now();
        this.isStopped = false;
    }

    stop() {
        this.isStopped = true;
        this.exportCSV();
    }

    exportCSV() {
        let csv = "result\n";

        // Add rows
        this.fpsResults.forEach(row => {
            csv += `${row.result}\n`;
        });

        // Create a blob
        const blob = new Blob([csv], { type: "text/csv" });
        const objUrl = URL.createObjectURL(blob);

        // Create a link
        const link = document.createElement("a");
        link.href = objUrl;
        link.download = "fps_results.csv";

        // Call download
        link.click();

        // Release the object
        URL.revokeObjectURL(objUrl);
    }
}

export { FPSCounter }