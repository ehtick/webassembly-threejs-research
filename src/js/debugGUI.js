import GUI from 'lil-gui';
import { loadFromLocalStorage, removeLocalStorage, saveToLocalStorage } from './localStorage';
import { createGeometry } from './three';

class DebugGUI {
    constructor() {
        this.gui = new GUI(document.body);
        this.loadButton;
        this.deleteButton;

        this.PARAMS = {
            performance: {
                fps: 0,
                calls: 0,
                triangles: 0,
                JsHeapMB: 0,
            },

            gpuMemory: {
                geometries: 0,
                textures: 0
            },
            
            particlesGeometry: {
                type: 'points',
                count: 100,
                size: 0.5,
                color: 0x00ff00,
                posBounds: 50,
                speed: 5,
                wireframe: false
            },
            
            presets: {
                savePreset: () => {
                    saveToLocalStorage( 'preset', this.gui.save() );
                    this.loadButton.enable();
                    this.deleteButton.enable();
                },
                loadPreset: () => {
                    this.gui.load(loadFromLocalStorage( 'preset' ));
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

    init() {
        let { gui } = this;
        const { PARAMS } = this;

        for (let propertyName in PARAMS) {            
            const folder = gui.addFolder( propertyName );

            if (propertyName == "particlesGeometry") {
                for (let key in PARAMS[propertyName]) {
                    const capitalize = key.charAt(0).toLocaleUpperCase() + key.substring(1);
                    
                    if (key == "type") {
                        folder.add( PARAMS[propertyName], key, [ 'points', 'cubes' ] ).name(capitalize).onChange(() => {
                            createGeometry(PARAMS[propertyName]);
                        });
                    } else if (key == "color") {
                        folder.addColor( PARAMS[propertyName], key ).name(capitalize).onChange(() => {
                            createGeometry(PARAMS[propertyName]);
                        });
                    } else {
                        folder.add( PARAMS[propertyName], key ).name(capitalize).onChange(() => {
                            createGeometry(PARAMS[propertyName]);
                        });
                    }
                }
            } else if (propertyName == "presets") {
                folder.add( PARAMS[propertyName], 'savePreset' ).name( 'Save preset' );
                this.loadButton = folder.add( PARAMS[propertyName], 'loadPreset' ).name( 'Load preset' );
                this.deleteButton = folder.add( PARAMS[propertyName], 'deleteAllPresets' ).name( 'Delete all presets' );

                let preset = loadFromLocalStorage( 'preset' )

                if (preset != null) {
                    this.loadButton.enable();
                    this.deleteButton.enable();
                    gui.load(preset);
                } else {
                    this.loadButton.disable();
                    this.deleteButton.disable();
                }
            } else {
                for (let key in PARAMS[propertyName]) {
                    const capitalize = key.charAt(0).toLocaleUpperCase() + key.substring(1);
                    folder.add( PARAMS[propertyName], key ).listen().name(capitalize);
                }
            }
        }
    }
}

export { DebugGUI }