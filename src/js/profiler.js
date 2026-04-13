class Profiler {
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
        this.fpsRows = [];
        this.isPromptable = false;

        // Execution time tracking
        this.currentExec = {};
        this.execRows = [];
    }

    setHours(hours) {
        this.durationMs = Number(hours) * 60 * 60 * 1000;
        this.isPromptable = true;
    }

    measureFPS() {
        this.frames++;
        const nowTime = performance.now();
        const deltaTime = nowTime - this.lastTime;
        
        if (deltaTime >= this.responsiveFps) {
            const seconds = deltaTime / 1000;

            this.fps = Math.round(this.frames / seconds);
            
            this.fpsRows.push({
                fps: this.fps
            })

            // Reset counters
            this.frames = 0;
            this.lastTime = nowTime;
        }

        if(this.isPromptable) {
            if (!this.isStopped && (nowTime - this.initStartTime >= this.durationMs)) {
                this.#stop();
                return;
            }
        }

        return this.fps;
    }

    startFrame() {
        this.currentExec = {};
    }

    startExec(label) {
        this.execStart = performance.now();
        this.execLabel = label;
    }

    endExec() {
        const time = performance.now() - this.execStart;
        this.currentExec[this.execLabel] = time;
    }

    endFrame() {
        this.execRows.push({ ...this.currentExec });
    }

    start() {
        this.initStartTime = performance.now();
        this.lastTime = performance.now();
        this.isStopped = false;
    }

    #stop() {
        this.isStopped = true;
        this.#exportFPS();
        this.#exportExecution();
    }

    #exportFPS() {
        let csv = "fps\n";

        // FPS rows
        this.fpsRows.forEach(row => {
            csv += `${row.fps}\n`;
        });

        this.#exportCSV(csv, "fps.csv");
    }

    #exportExecution() {
        const headers = Object.keys(this.execRows[0]);

        let csv = headers.join(",") + "\n";
        
        // Execution time rows
        this.execRows.forEach(row => {
            const line = headers.map(header => 
                row[header].toFixed(3)
            ).join(",");

            csv += line + `\n`;
        });

        this.#exportCSV(csv, "execution.csv");
    }

    #exportCSV(csv, filename) {
        // Create a blob
        const blob = new Blob([csv], { type: "text/csv" });
        const objUrl = URL.createObjectURL(blob);

        // Create a link
        const link = document.createElement("a");
        link.href = objUrl;
        link.download = filename;

        // Call download
        link.click();

        // Release the object
        URL.revokeObjectURL(objUrl);
    }

    #getTimeLeftMS() {
        const nowTime = performance.now();
        const elapsed = nowTime - this.initStartTime;
        const left = this.durationMs - elapsed;
        const limitLeft = Math.max(0, left);

        return limitLeft;
    }

    getTimeLeft() {
        const ms = this.#getTimeLeftMS();
        
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hoursString = String(hours).padStart(2, "0");
        const minutesString = String(minutes).padStart(2, "0");
        const secondsString = String(seconds).padStart(2, "0");

        return `${hoursString}:${minutesString}:${secondsString}`;
    }
}

export { Profiler }