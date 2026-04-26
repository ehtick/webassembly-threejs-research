import * as THREE from 'three';

class Particles {
    static #COMPONENTS = 3;

    constructor({ module = null, type = 'cubes', count = 100, spread = 50, speed = 5, pushApart = 0.1, size = 0.5, color = 0x00ff00, wireframe = false, isBounceable = true } = {}) {
        this.#createSetup({module, type, count, spread, speed, pushApart, size, color, wireframe, isBounceable});
    }

    #createSetup({module, type, count, spread, speed, pushApart, size, color, wireframe, isBounceable}) {
        this.module = module;
        this.type = type;
        this.count = count;   
        this.speed = speed;
        this.pushApart = pushApart;
        this.size = size;
        this.isBounceable = isBounceable;
        
        const geometry = this.#createGeometry({type, size, count, spread});
        const material = this.#createMaterial({type, size, color, wireframe});
        this.mesh = this.#createMesh({type, count, geometry, material} );
    }

    #createGeometry({type, size, count, spread} = {}) {
        const particlesIndexLength = count * Particles.#COMPONENTS;
        let positionArray = null;
        let velocityArray = null;

        // If a module (C++/Rust) is available, then allocate memory for position and velocity pointers; otherwise use JS without allocating memory
        if(this.module.myModule) {
            const floatByte = 4;  // 4 bytes per float (Float32Array)
            this.bytes = particlesIndexLength * floatByte;
            let wasmMemoryBuffer = null;
            
            // If C++ module is available, then use its memory; otherwise fallback to Rust implementation
            if(this.module.typeLanguage === "c++") {
                // Allocate the memory bytes
                this.positionOffset = this.module.myModule._malloc(this.bytes);
                this.velocityOffset = this.module.myModule._malloc(this.bytes);
                
                // Get memory buffer from wasm
                wasmMemoryBuffer = this.module.myModule.HEAPF32.buffer; // ~16 MB by default (depends on Emscripten flags like INITIAL_MEMORY or ALLOW_MEMORY_GROWTH)
            } else if(this.module.typeLanguage === "rust") {
                // Allocate the memory bytes
                this.positionOffset = this.module.myModule.malloc(this.bytes);
                this.velocityOffset = this.module.myModule.malloc(this.bytes);
                
                // Get memory buffer from wasm
                // Note: Memory grows automatically as needed (e.g., ~1.125MB for ~1000 particles, ~1.375MB for ~10000 particles). Memory can grow but cannot shrink.
                wasmMemoryBuffer = this.module.myModule.memory.buffer; // WebAssembly linear memory buffer (auto-growing by default)
            }

            // Create views into Wasm memory
            // e.g Buffer: ~16 MB, byteOffset: 71752, length: 30 * 4 = 120 bytes, the array view covers 120 bytes of the buffer
            positionArray = new Float32Array(wasmMemoryBuffer, this.positionOffset, particlesIndexLength); 
            velocityArray = new Float32Array(wasmMemoryBuffer, this.velocityOffset, particlesIndexLength);
        } else {
            positionArray = new Float32Array(particlesIndexLength);
            velocityArray = new Float32Array(particlesIndexLength);
        }
        
        this.boxBounds = spread / 2; // Half the spread. Example: if spread is 10, then box in range is -5 and 5
        for (let i = 0; i < positionArray.length; i++) {
            positionArray[i] = this.#randomRange(-this.boxBounds, this.boxBounds); // Random position in range min and max
        }

        for (let i = 0; i < velocityArray.length; i++) {
            velocityArray[i] = this.#randomRange(-1, 1); // Random velocity in range min and max
        }

        this.positionArray = positionArray;
        this.velocityArray = velocityArray;

        if (type == 'points') {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, Particles.#COMPONENTS));
            return bufferGeometry;
        } else if (type == 'cubes') {            
            return new THREE.BoxGeometry(size, size, size);
        }  
    }

    #createMaterial({type, size, color, wireframe} = {}) {
        if (type == 'points') {
            return new THREE.PointsMaterial({ size, color, sizeAttenuation: true });
        } else if (type == 'cubes') {                
            return new THREE.MeshNormalMaterial({wireframe});
        } 
    }

    #createMesh({type, count, geometry, material} = {}) {
        if (type == 'points') {
            return new THREE.Points(geometry, material);
        } else if (type == 'cubes') {
            const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

            // Set each cube particle's xyz
            for(let particle = 0; particle < count; particle++) {
                this.#updateCubeParticle(particle, this.positionArray, instancedMesh);
            }
            
            return instancedMesh;
        }
    }

    #intersectsBox(aX, aY, aZ, bX, bY, bZ, size) {
        const halfSize = size / 2;

        // If there is no overlap between a and b, return false
        if (aX + halfSize < bX - halfSize || aX - halfSize > bX + halfSize) { return false; };
        if (aY + halfSize < bY - halfSize || aY - halfSize > bY + halfSize) { return false; };
        if (aZ + halfSize < bZ - halfSize || aZ - halfSize > bZ + halfSize) { return false; };

        // If there is overlap between a and b, return true
        return true;
    }

    #randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    updateSetup({module, type, count, spread, speed, pushApart, size, color, wireframe, isBounceable} = {}) {
        this.#disposeMesh();
        this.#disposeWasm();

        this.#createSetup({module, type, count, spread, speed, pushApart, size, color, wireframe, isBounceable})
    }

    #disposeMesh() {
        if(this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
    
    #disposeWasm() {
        if(this.module.myModule) {
            if(this.module.typeLanguage === "c++") {
                // Free WASM memory
                this.module.myModule._free(this.positionOffset);
                this.module.myModule._free(this.velocityOffset);
                
                // Avoid dangling pointer
                this.positionOffset = null;
                this.velocityOffset = null;
            } else if(this.module.typeLanguage === "rust") {
                // Free WASM memory
                this.module.myModule.free(this.positionOffset, this.bytes);
                this.module.myModule.free(this.velocityOffset, this.bytes);

                // Avoid dangling pointer
                this.positionOffset = null;
                this.velocityOffset = null;
            }
        }
    }

    getGeometry() {
        return this.mesh;
    }

    update(deltaTime) {
        const {type, count, speed, pushApart, size, boxBounds, positionArray, mesh, isBounceable} = this;

        const moduleHandler = this.#moduleHandler(this.module);
        moduleHandler.updateParticlePhysics(count, Particles.#COMPONENTS, speed, boxBounds, deltaTime);

        if (type == 'cubes') {
            for (let particle = 0; particle < count; particle++) { 
                moduleHandler.updateCubeParticle(particle, positionArray, mesh);
            }

            if (isBounceable) {
                moduleHandler.updateCubeParticleCollision(size, count, Particles.#COMPONENTS, pushApart);
            }

            mesh.instanceMatrix.needsUpdate = true;
        } else if (type == 'points') {
            mesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    #moduleHandler(module) {
        if(module.typeLanguage === "c++") {
            const {positionOffset, velocityOffset} = this;
            return {
                updateParticlePhysics: (count, maxComponents, speed, boxBounds, deltaTime) => module.myModule.updateParticlePhysics(count, maxComponents, positionOffset, velocityOffset, speed, boxBounds, deltaTime),
                updateCubeParticle: (particle, positionArray, mesh) => this.#updateCubeParticle(particle, positionArray, mesh), // JS method
                updateCubeParticleCollision: (size, count, maxComponents, pushApart) => module.myModule.updateCubeParticleCollision(positionOffset, velocityOffset, size, count, maxComponents, pushApart)
            };
        }

        if(module.typeLanguage === "rust") {
            const {positionOffset, velocityOffset} = this;
            return {
                updateParticlePhysics: (count, maxComponents, speed, boxBounds, deltaTime) => module.myModule.update_particle_physics(count, maxComponents, positionOffset, velocityOffset, speed, boxBounds, deltaTime),
                updateCubeParticle: (particle, positionArray, mesh) => this.#updateCubeParticle(particle, positionArray, mesh), // JS method
                updateCubeParticleCollision: (size, count, maxComponents, pushApart) => module.myModule.update_cube_particle_collision(positionOffset, velocityOffset, size, count, maxComponents, pushApart)
            };
        }
        
        // Fallback (JS)
        const {positionArray, velocityArray} = this;
        return {
            updateParticlePhysics: (count, maxComponents, speed, boxBounds, deltaTime) => this.#updateParticlePhysics(count, maxComponents, positionArray, velocityArray, speed, boxBounds, deltaTime),
            updateCubeParticle: (particle, positionArray, mesh) => this.#updateCubeParticle(particle, positionArray, mesh),
            updateCubeParticleCollision: (size, count, maxComponents, pushApart) => this.#updateCubeParticleCollision(positionArray, velocityArray, size, count, maxComponents, pushApart)
        };
    }

    #updateParticlePhysics(count, maxComponents, positionArray, velocityArray, speed, boxBounds, deltaTime) {
        // Loop through each particle
        for (let particle = 0; particle < count; particle++) {
            const particleIndex = particle * maxComponents;

            // Loop through x, y, z from particle
            for (let component = 0; component < maxComponents; component++) {
                // Get each x, y and z
                const componentIndex = particleIndex + component;

                // Update each x, y and z
                const position = positionArray[componentIndex] + (velocityArray[componentIndex] * speed) * deltaTime;
                positionArray[componentIndex] = position;

                // If particle's x, y or z hits box border, then reverse direction
                if (position <= -boxBounds || position >= boxBounds) {
                    const upperClamped = Math.min(boxBounds, position);
                    const lowerClamped = Math.max(-boxBounds, upperClamped);
                    
                    const reverseDirection = -1.0;
                    positionArray[componentIndex] = lowerClamped;
                    velocityArray[componentIndex] *= reverseDirection;
                }
            }
        }
    }

    #updateCubeParticle(particle, positionArray, mesh) {
        const particleIndex = particle * Particles.#COMPONENTS;
        
        // Get cube particle's xyz
        const x = positionArray[particleIndex + 0];
        const y = positionArray[particleIndex + 1];
        const z = positionArray[particleIndex + 2];
        const position = new THREE.Vector3(x, y, z);

        // Set cube particle's xyz
        const matrix4 = new THREE.Matrix4();
        matrix4.makeTranslation(position);
        mesh.setMatrixAt(particle, matrix4);
    }

    #updateCubeParticleCollision(positionArray, velocityArray, size, count, maxComponents, pushApart) {
        const positionArrayLength = count * maxComponents;
        
        // Loop through all particles A
        for (let particleA = 0; particleA < positionArrayLength; particleA += maxComponents) {
            const nextParticle = maxComponents;

            // Loop through all particles after particles A
            for(let particleB = particleA + nextParticle; particleB < positionArrayLength; particleB += maxComponents) {
                const aX = positionArray[particleA + 0];
                const aY = positionArray[particleA + 1];
                const aZ = positionArray[particleA + 2];

                const bX = positionArray[particleB + 0];
                const bY = positionArray[particleB + 1];
                const bZ = positionArray[particleB + 2];

                // If cube particle hits another particle cube, then reverse direction depending on which componets hits
                if(this.#intersectsBox(aX, aY, aZ, bX, bY, bZ, size)) {
                    const particles = [particleA, particleB];

                    for(let particle = 0; particle < particles.length; particle++) {
                        for (let component = 0; component < maxComponents; component++) {
                            // Get each particle's x, y and z 
                            const componentIndex =  particles[particle] + component;
                            
                            // Make cube particles bounce away from each other
                            // Reverse the cube particle's x, y, z velocity
                            const reverseDirection = -1.0;
                            const particleVel = velocityArray[componentIndex] * reverseDirection;
                            velocityArray[componentIndex] = particleVel;

                            // Prevent two cube particles from sticking together (overlapping)
                            // Move the cube particle along its new velocity (x, y, z)
                            positionArray[componentIndex] += particleVel * pushApart;
                        }
                    } 
                }
            }
        }
    }
}

export { Particles }