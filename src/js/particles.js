import * as THREE from 'three';

class Particles {
    static #COMPONENTS_PER_VERTEX = 3;

    constructor({ type = 'cubes', count = 100, spread = 50, speed = 5, size = 0.5, color = 0x00ff00, wireframe = false, isBounceable = true } = {}) {
        this.#createSetup({type, count, spread, speed, size, color, wireframe, isBounceable});
    }

    #createSetup({type, count, spread, speed, size, color, wireframe, isBounceable}) {
        this.type = type;
        this.count = count;
        this.boxBounds = spread / 2;       
        this.speed = speed;
        this.isBounceable = isBounceable;
        
        const geometry = this.#createGeometry({type, size, count, spread});
        const material = this.#createMaterial({type, size, color, wireframe});
        this.mesh = this.#createMesh({type, count, geometry, material} );
    }

    #createGeometry({type, size, count, spread} = {}) {
        const particlesIndexLength = count * Particles.#COMPONENTS_PER_VERTEX;
        const positionArray = new Float32Array(particlesIndexLength);
        const velocityArray = new Float32Array(particlesIndexLength);
        
        for (let i = 0; i < positionArray.length; i++) {
            const random = Math.random() - 0.5;
            positionArray[i] = random * spread;
        }

        for (let i = 0; i < velocityArray.length; i++) {
            const random = Math.random() - 0.5;
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
            return new THREE.MeshBasicMaterial({color, wireframe});
        } 
    }

    #createMesh({type, count, geometry, material} = {}) {
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

                const width = instancedMesh.geometry.parameters.width;
                const height = instancedMesh.geometry.parameters.height;
                const depth = instancedMesh.geometry.parameters.depth;
                const size = new THREE.Vector3(width, height, depth);

                const matrix4 = new THREE.Matrix4();
                matrix4.makeTranslation(position);
                instancedMesh.setMatrixAt(i, matrix4);

                if(this.isBounceable) {
                    const box = new THREE.Box3();
                    box.setFromCenterAndSize(position, size)
                    this.hitBoxes.push(box);
                }
            }

            return instancedMesh;
        }
    }

    updateSetup({type, count, spread, speed, size, color, wireframe, isBounceable} = {}) {
        if(this.mesh) {
            this.#disposeMesh();
        }

        this.#createSetup({type, count, spread, speed, size, color, wireframe, isBounceable})
    }

    #disposeMesh() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }

    getGeometry() {
        return this.mesh;
    }

    update(deltaTime) {
        const {type, count, speed, boxBounds, positionArray, velocityArray, mesh, hitBoxes, isBounceable} = this;
        
        // Loop through each particle
        for (let i = 0; i < count; i++) {
            const particleIndex = i * Particles.#COMPONENTS_PER_VERTEX;

            const particleX = particleIndex + 0;
            const particleY = particleIndex + 1;
            const particleZ = particleIndex + 2;

            // Update point particle's xyz
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
                matrix4.makeTranslation(x, y, z);
                mesh.setMatrixAt(i, matrix4);
                
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

                if (type == 'cubes' && isBounceable) {
                    for(let firstHitBox = 0; firstHitBox < hitBoxes.length; firstHitBox++) {
                        const nextHitBox = 1;
                        
                        for(let secondHitBox = firstHitBox + nextHitBox; secondHitBox < hitBoxes.length; secondHitBox++) {

                            // If cube particle hits another particle cube, then reverse direction
                            if(hitBoxes[firstHitBox].intersectsBox(hitBoxes[secondHitBox])) {
                                console.log(firstHitBox, secondHitBox)
                                const firstHitBoxIndex = firstHitBox * Particles.#COMPONENTS_PER_VERTEX;
                                const secondHitBoxIndex = secondHitBox * Particles.#COMPONENTS_PER_VERTEX;
                                
                                const reverseDirection = -1;
                                velocityArray[firstHitBoxIndex] *= reverseDirection;
                                velocityArray[secondHitBoxIndex] *= reverseDirection;
                                
                                // Prevent two cubes overlap
                                const pushApart = 0.8;
                                positionArray[firstHitBoxIndex] += velocityArray[firstHitBoxIndex] * pushApart;
                                positionArray[secondHitBoxIndex] += velocityArray[secondHitBoxIndex] * pushApart;
                            }
                        }
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