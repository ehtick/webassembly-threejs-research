import GUI from 'lil-gui';
import { loadFromLocalStorage, removeLocalStorage, saveToLocalStorage } from './localStorage';

class DebugGUI {
    constructor({ container } = {}) {
        this.gui = new GUI({ container });
        this.object = {
            performance: {
                display: {
                    fps: 0,
                    calls: 0,
                    frame: 0,
                    lines: 0,
                    points: 0,
                    triangles: 0
                }
            },

            gpu: {
                display: {
                    geometries: 0,
                    textures: 0
                }
            },
            
            particles: {
                input: {
                    type: {
                        default: 'points',
                        options: ['points','cubes']
                    },
                    count: 100,
                    spread: 50,
                    speed: 5,
                    pushApart: 0.1,
                    size: 0.5,
                    pointcolor: 0x00ff00,
                    boxWireframe: false,
                    boxBounceable: true
                }
            },

            threeApp: {
                input: {
                    backgroundcolor: 0x000000,
                    fov: 75, 
                    near: 0.1, 
                    far: 1000, 
                    cameraX: 0, 
                    cameraY: 0, 
                    cameraZ: 60,
                    cameraSpeed: 10, 
                    enableControls: true,
                    antialias: true,
                    running: true
                }
            },
            
            presets: {
                button: {
                    savePreset: () => {
                        this.#save();
                    },
                    loadPreset: () => {                    
                        this.#load();
                    },
                    deleteAllPresets: () => {
                        this.#deleteAll();
                    }
                }
            }
        }
    }

    #save() {
        saveToLocalStorage( 'preset', this.gui.save() );
        this.loadButton.enable();
        this.deleteButton.enable();
    }

    #load() {
        let preset = loadFromLocalStorage( 'preset' )

        if (preset != null) {
            this.loadButton.enable();
            this.deleteButton.enable();
            this.gui.load(preset);
        } else {
            this.loadButton.disable();
            this.deleteButton.disable();
        } 
    }
    
    #deleteAll() {
        if (confirm( 'Do you want to delete all presets?' )) {
            removeLocalStorage( 'preset' );
            this.loadButton.disable();
            this.deleteButton.disable();
        } 
    }

    start({ onChange, delayOnChange} = {}) {
        const { object } = this;
        let method, params;

        for (let propertyName in object) {
            const folderNameCapitalize = propertyName.charAt(0).toLocaleUpperCase() + propertyName.substring(1);           
            const folder = this.gui.addFolder(folderNameCapitalize);

            for (let type in object[propertyName]) {
                for (let key in object[propertyName][type]) {
                    const capitalize = key.charAt(0).toLocaleUpperCase() + key.substring(1);

                    if (key.startsWith("color") || key.endsWith("color")) {
                        method = "addColor";
                    } else {
                        method = "add";
                    }

                    if (key.startsWith("type") || key.endsWith("type")) {
                        params = [object[propertyName][type][key], 'default', object[propertyName][type][key].options];
                    } else {
                        params = [object[propertyName][type], key];
                    }
                    
                    let control = folder[method](...params).name(capitalize);
                    
                    if (type == "display") {
                        control.listen();
                    } else if (type == "input") {
                        control.onChange(() => {
                            this.#delayOnChange({onChange, object, delay: delayOnChange});
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

    #delayOnChange({onChange, object, delay = 200}) {
        // Cancel the previously scheduled method if it hasn't executed yet
        clearTimeout(this.timeout);
        
        this.timeout = setTimeout(() => {
            if(onChange) {
                onChange(object)
            }

        }, delay)
    }
}

export { DebugGUI }