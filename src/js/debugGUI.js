import GUI from 'lil-gui';
import { loadFromLocalStorage, removeLocalStorage, saveToLocalStorage } from './localStorage';
import { createGeometry } from './three';

class DebugGUI {
    constructor() {
        this.gui = new GUI(document.body);

        this.object = {
            performance: {
                display: {
                    fps: 0,
                    calls: 0,
                    triangles: 0,
                    JsHeapMB: 0
                }
            },

            gpuMemory: {
                display: {
                    geometries: 0,
                    textures: 0
                }
            },
            
            particlesGeometry: {
                input: {
                    type: 'points',
                    count: 100,
                    size: 0.5,
                    color: 0x00ff00,
                    posBounds: 50,
                    speed: 5,
                    wireframe: false
                }
            },
            
            presets: {
                button: {
                    savePreset: () => {
                        saveToLocalStorage( 'preset', this.gui.save() );
                        this.loadButton.enable();
                        this.deleteButton.enable();
                    },
                    loadPreset: () => {                    
                        let preset = loadFromLocalStorage( 'preset' )

                        if (preset != null) {
                            this.loadButton.enable();
                            this.deleteButton.enable();
                            this.gui.load(preset);
                        } else {
                            this.loadButton.disable();
                            this.deleteButton.disable();
                        } 
                    },
                    deleteAllPresets: () => {
                        if (confirm( 'Do you want to delete all presets?' )) {
                            removeLocalStorage( 'preset' );
                            this.loadButton.disable();
                            this.deleteButton.disable();
                        } 
                    }
                }
            }
        }
    }

    init() {
        const { object } = this;
        let { gui } = this;
        let method, params;

        for (let propertyName in object) {            
            const folder = gui.addFolder( propertyName );

            for (let type in object[propertyName]) {
                for (let key in object[propertyName][type]) {
                    const capitalize = key.charAt(0).toLocaleUpperCase() + key.substring(1);

                    if (key == "color") {
                        method = "addColor";
                    } else {
                        method = "add";
                    }

                    if (key == "type") {
                        params = [object[propertyName][type], key, ['points', 'cubes']];
                    } else {
                        params = [object[propertyName][type], key];
                    }
                    
                    let control = folder[method](...params).name(capitalize);
                    
                    if (type == "display") {
                        control.listen();
                    } else if (type == "input") {
                        control.onChange(() => {
                            createGeometry(object[propertyName][type]);
                        });
                    }
                    
                    if (key == "loadPreset") {
                        this.loadButton = control;
                    } else if (key == "deleteAllPresets") {
                        this.deleteButton = control;
                    }
                }
            }
        }
        // If there are preset values, then load them into the GUI; otherwise, do not load any values
        object.presets.button.loadPreset();
    }
}

export { DebugGUI }