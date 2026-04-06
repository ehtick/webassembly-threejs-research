import * as THREE from 'three';

class Particles {
    static #COMPONENTS = 3;

    constructor({ type = 'cubes', count = 100, spread = 50, speed = 5, size = 0.5, color = 0x00ff00, wireframe = false, isBounceable = true } = {}) {
        this.#createSetup({type, count, spread, speed, size, color, wireframe, isBounceable});
    }

    #createSetup({type, count, spread, speed, pushApart, size, color, wireframe, isBounceable}) {
        this.type = type;
        this.count = count;   
        this.speed = speed;
        this.pushApart = pushApart;
        this.size = size;
        this.isBounceable = isBounceable;
        
        const geometry = this.#createGeometry({type, size, count, spread});
        const material = this.#createMaterial({type, size, color, wireframe});
        this.mesh = this.#createMesh({type, size, count, geometry, material, isBounceable} );
    }

    #createGeometry({type, size, count, spread} = {}) {
        const particlesIndexLength = count * Particles.#COMPONENTS;
        const positionArray = new Float32Array(particlesIndexLength);
        const velocityArray = new Float32Array(particlesIndexLength);
        
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

    #createMesh({type, size, count, geometry, material, isBounceable} = {}) {
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

    updateSetup({type, count, spread, speed, pushApart, size, color, wireframe, isBounceable} = {}) {
        if(this.mesh) {
            this.#disposeMesh();
        }

        this.#createSetup({type, count, spread, speed, pushApart, size, color, wireframe, isBounceable})
    }

    #disposeMesh() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }

    getGeometry() {
        return this.mesh;
    }

    update(deltaTime) {
        const {type, count, speed, pushApart, size, boxBounds, positionArray, velocityArray, mesh, isBounceable} = this;

        this.#updateParticlePhysics(count, Particles.#COMPONENTS, positionArray, velocityArray, speed, boxBounds, deltaTime)
            
        if (type == 'cubes') {
            for (let particle = 0; particle < count; particle++) { 
                this.#updateCubeParticle(particle, positionArray, mesh);
            }

            if (isBounceable) {
                this.#updateCubeParticleCollision(positionArray, velocityArray, size, count, Particles.#COMPONENTS, pushApart);
            }

            mesh.instanceMatrix.needsUpdate = true;
        } else if (type == 'points') {
            mesh.geometry.attributes.position.needsUpdate = true;
        }
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