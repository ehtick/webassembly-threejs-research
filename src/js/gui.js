import GUI from 'lil-gui';

let gui; 

const PARAMS = {
    // Performance
    fps: 0,
    calls: 0,
    triangles: 0,
    JsHeapMB: 0,
    
    // GPU Memory
    geometries: 0,
    textures: 0,
    
    // Geometry
    cubeColor: 0x00ff00,
    wireframe: false
}

function initGUI() {
    gui = new GUI(document.body);

    // Controller properties

    const PERF_FOLDER = gui.addFolder( 'Performance' );
    PERF_FOLDER.add( PARAMS, 'fps' ).listen();
    PERF_FOLDER.add( PARAMS, 'calls' ).listen();
    PERF_FOLDER.add( PARAMS, 'triangles' ).listen();
    PERF_FOLDER.add(PARAMS, 'JsHeapMB').listen();
    
    const GPU_MEMORY_FOLDER = gui.addFolder( 'GPU Memory' );
    GPU_MEMORY_FOLDER.add( PARAMS, 'geometries' ).listen();
    GPU_MEMORY_FOLDER.add( PARAMS, 'textures' ).listen();
    
    const GEOMETRY_FOLDER = gui.addFolder( 'Geometry' );
    GEOMETRY_FOLDER.addColor( PARAMS, 'cubeColor' ).name( 'Cube color' );
    GEOMETRY_FOLDER.add( PARAMS, 'wireframe' );
}

export { PARAMS, initGUI }