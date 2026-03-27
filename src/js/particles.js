import * as THREE from 'three';

class Particles {
    static #COMPONENTS_PER_VERTEX = 3;

    constructor({ type = 'cubes', count = 100, spread = 50, speed = 5, size = 0.5, color = 0x00ff00, wireframe = false, isBounceable = true } = {}) {
        this.#createSetup({type, count, spread, speed, size, color, wireframe, isBounceable});
    }

    #createSetup({type, count, spread, speed, pushApart, size, color, wireframe, isBounceable}) {
        this.type = type;
        this.count = count;   
        this.speed = speed;
        this.isBounceable = isBounceable;
        this.pushApart = pushApart;
        
        const geometry = this.#createGeometry({type, size, count, spread});
        const material = this.#createMaterial({type, size, color, wireframe});
        this.mesh = this.#createMesh({type, size, count, geometry, material, isBounceable} );
    }

    #createGeometry({type, size, count, spread} = {}) {
        const particlesIndexLength = count * Particles.#COMPONENTS_PER_VERTEX;
        const positionArray = new Float32Array(particlesIndexLength);
        const velocityArray = new Float32Array(particlesIndexLength);
        
        this.boxBounds = spread / 2; // Half the spread. Example: if spread is 10, then box range from -5 to 5
        for (let i = 0; i < positionArray.length; i++) {
            const random = (Math.random() * 2) - 1; // Range from -1 to 1 
            positionArray[i] = random * this.boxBounds; // If spread is 10, then all particles will be spread in the range from -5 to 5
        }

        for (let i = 0; i < velocityArray.length; i++) {
            const random = (Math.random() * 2) - 1; // Range from -1 to 1 
            velocityArray[i] = random;
        }

        this.positionArray = positionArray;
        this.velocityArray = velocityArray;

        if (type == 'points') {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, Particles.#COMPONENTS_PER_VERTEX));
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
            this.hitBoxes = [];

            // Set each cube particle's xyz
            for(let i = 0; i < count; i++) {
                const particleIndex = i * Particles.#COMPONENTS_PER_VERTEX;
                
                const x = this.positionArray[particleIndex + 0];
                const y = this.positionArray[particleIndex + 1];
                const z = this.positionArray[particleIndex + 2];
                const position = new THREE.Vector3(x, y, z);

                // Set each hitBox's xyz
                if(isBounceable) {
                    const box = new THREE.Box3();
                    box.setFromCenterAndSize(position, new THREE.Vector3(size, size, size));
                    this.hitBoxes.push(box);
                }

                // Set cube particle's xyz
                const matrix4 = new THREE.Matrix4();
                matrix4.makeTranslation(position);
                instancedMesh.setMatrixAt(i, matrix4);
            }

            return instancedMesh;
        }
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
        const {type, count, speed, boxBounds, positionArray, velocityArray, mesh, hitBoxes, isBounceable, pushApart} = this;
        
        // Loop through each particle
        for (let i = 0; i < count; i++) {
            const particleIndex = i * Particles.#COMPONENTS_PER_VERTEX;

            // Get particle's xyz
            const particleX = particleIndex + 0;
            const particleY = particleIndex + 1;
            const particleZ = particleIndex + 2;

            // Update geometry particle's xyz
            const x = positionArray[particleX] += (velocityArray[particleX] * speed) * deltaTime;
            const y = positionArray[particleY] += (velocityArray[particleY] * speed) * deltaTime;
            const z = positionArray[particleZ] += (velocityArray[particleZ] * speed) * deltaTime;
            
            // Update cube particle's xyz
            if (type == 'cubes') {
                const position = new THREE.Vector3(x, y, z);

                const width = mesh.geometry.parameters.width;
                const height = mesh.geometry.parameters.height;
                const depth = mesh.geometry.parameters.depth;
                const size = new THREE.Vector3(width, height, depth);

                const matrix4 = new THREE.Matrix4();
                matrix4.makeTranslation(position);
                mesh.setMatrixAt(i, matrix4);
                
                // Update hitBox's xyz
                if(isBounceable) {
                    const box = hitBoxes[i];
                    box.setFromCenterAndSize(position, size);
                    hitBoxes[i] = box;
                }
            }

            // Loop through x, y, z from particle
            for (let j = 0; j < Particles.#COMPONENTS_PER_VERTEX; j++) {
                const posIndex = particleIndex + j;
                const particlePos = positionArray[posIndex];

                // If particle's x, y or z hits box border, then reverse direction
                if (particlePos <= -boxBounds || particlePos >= boxBounds) {
                    const upperClamped = Math.min(boxBounds, particlePos);
                    const lowerClamped = Math.max(-boxBounds, upperClamped);
                    
                    const reverseDirection = -1;
                    positionArray[posIndex] = lowerClamped;
                    velocityArray[posIndex] *= reverseDirection;
                }
            }
        }

        if (type == 'cubes' && isBounceable) {
            for(let firstHitBox = 0; firstHitBox < hitBoxes.length; firstHitBox++) {
                const nextHitBox = 1;
                for(let secondHitBox = firstHitBox + nextHitBox; secondHitBox < hitBoxes.length; secondHitBox++) {
                    // If cube particle hits another particle cube, then reverse direction
                    if(hitBoxes[firstHitBox].intersectsBox(hitBoxes[secondHitBox])) {
                        const firstHitBoxIndex = firstHitBox * Particles.#COMPONENTS_PER_VERTEX;
                        const secondHitBoxIndex = secondHitBox * Particles.#COMPONENTS_PER_VERTEX;

                        // Get first hitBox's x, y and z 
                        const firstHitBoxX = firstHitBoxIndex + 0;
                        const firstHitBoxY = firstHitBoxIndex + 1;
                        const firstHitBoxZ = firstHitBoxIndex + 2;

                        // Get second hitBox's x, y and z 
                        const secondHitBoxX = secondHitBoxIndex + 0;
                        const secondHitBoxY = secondHitBoxIndex + 1;
                        const secondHitBoxZ = secondHitBoxIndex + 2;
                        
                        // Make cube particles bounce away from each other
                        // Reverse the first cube particle's x, y, z velocity
                        const reverseDirection = -1;
                        const firstCubeVelX = velocityArray[firstHitBoxX] *= reverseDirection;
                        const firstCubeVelY = velocityArray[firstHitBoxY] *= reverseDirection;
                        const firstCubeVelZ = velocityArray[firstHitBoxZ] *= reverseDirection;

                        // Reverse the second cube particle's x, y, z velocity
                        const secondCubeVelX = velocityArray[secondHitBoxX] *= reverseDirection;
                        const secondCubeVelY = velocityArray[secondHitBoxY] *= reverseDirection;
                        const secondCubeVelZ = velocityArray[secondHitBoxZ] *= reverseDirection;

                        // Prevent two cube particles from sticking together (overlapping)
                        // Move the first cube particle along its new velocity (x, y, z)
                        positionArray[firstHitBoxX] += firstCubeVelX * pushApart;
                        positionArray[firstHitBoxY] += firstCubeVelY * pushApart;
                        positionArray[firstHitBoxZ] += firstCubeVelZ * pushApart;
                        
                        // Move the second cube particle along its new velocity (x, y, z)
                        positionArray[secondHitBoxX] += secondCubeVelX * pushApart;
                        positionArray[secondHitBoxY] += secondCubeVelY * pushApart;
                        positionArray[secondHitBoxZ] += secondCubeVelZ * pushApart;
                    }
                }
            }
        }

        if (type == 'points') {
            mesh.geometry.attributes.position.needsUpdate = true;
        } else if (type == 'cubes') {
            mesh.instanceMatrix.needsUpdate = true;
        }
    }
}

export { Particles }