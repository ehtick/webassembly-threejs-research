import * as THREE from 'three';

class Particles {
    static COMPONENTS_PER_PARTICLE = 3;

    constructor({ type = 'cubes', particleCount = 100, size = 0.5, color = 0x00ff00, positionBounds = 50, velocitySpeed = 5 } = {} ) {
        this.type = type;
        this.particleCount = particleCount;
        this.size = size;
        this.color = color;
        this.positionBounds = positionBounds;
        this.velocitySpeed = velocitySpeed;

        this.particleLength = this.particleCount * Particles.COMPONENTS_PER_PARTICLE;
        this.positionArray = new Float32Array(this.particleLength);
        this.velocityArray = new Float32Array(this.particleLength);
        this.boxBounds = this.positionBounds / 2;
        
        this.generateParticles();
    }

    generateParticles() {
        const {positionArray, velocityArray, positionBounds, velocitySpeed} = this;

        // Set a random number in each position and velocity
        for (let i = 0; i < positionArray.length; i++) {
            // Range: -0.5, +0.5
            const posRange = (Math.random() - 0.5); 
            const velRange = (Math.random() - 0.5);
                
            positionArray[i] = posRange * positionBounds;
            velocityArray[i] = velRange * velocitySpeed;
        }

        this.createGeometry();
    }

    createGeometry() {
        const {type, positionArray, size, color, particleCount} = this;

        if (type == 'points') {
            const geometry = new THREE.BufferGeometry();
            this.posBufferAttr = new THREE.BufferAttribute(positionArray, 3);
            geometry.setAttribute('position', this.posBufferAttr);
    
            const material = new THREE.PointsMaterial({ size: size, color: color, sizeAttenuation: true});
            this.mesh = new THREE.Points(geometry, material);

        } else if (type == 'cubes') {
            const boxGeometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshBasicMaterial({ color: color });
            this.mesh = new THREE.InstancedMesh(boxGeometry, material, particleCount);

            this.object3D = new THREE.Object3D();
    
            for (let i = 0; i < particleCount; i++) {
                const particleIndex = i * Particles.COMPONENTS_PER_PARTICLE;
    
                this.object3D.position.set(positionArray[particleIndex + 0], positionArray[particleIndex + 1], positionArray[particleIndex + 2])           
                this.object3D.updateMatrix();
                this.mesh.setMatrixAt(i, this.object3D.matrix);
            }
        }

    }

    update(deltaTime) {
        const {type, particleCount, positionArray, velocityArray, boxBounds} = this;

        if (type == 'points') {
            this.posBufferAttr.needsUpdate = true;
        } else if (type == 'cubes') {
            this.mesh.instanceMatrix.needsUpdate = true;
        }

        // Loop through each particle
        for (let i = 0; i < particleCount; i++) {
            const particleIndex = i * Particles.COMPONENTS_PER_PARTICLE;

            // Loop through x, y, z from particle
            for (let j = 0; j < Particles.COMPONENTS_PER_PARTICLE; j++) {
                
                // Move particle's xyz
                if (type == 'points') {
                    positionArray[particleIndex + j] += velocityArray[particleIndex + j] * deltaTime;
                } else if (type == 'cubes') {
                    this.object3D.position.x = positionArray[particleIndex + 0] += velocityArray[particleIndex + 0] * deltaTime;
                    this.object3D.position.y = positionArray[particleIndex + 1] += velocityArray[particleIndex + 1] * deltaTime;
                    this.object3D.position.z = positionArray[particleIndex + 2] += velocityArray[particleIndex + 2] * deltaTime;
                    this.object3D.updateMatrix();
                    this.mesh.setMatrixAt(i, this.object3D.matrix);
                }
                
                const particlePos = positionArray[particleIndex + j];

                // If particle's xyz hits box border, then reverse direction
                if (particlePos < -boxBounds || particlePos > boxBounds) {
                    positionArray[particleIndex + j] = Math.max(-boxBounds, Math.min(boxBounds, particlePos))
                    velocityArray[particleIndex + j] *= -1;
                }
            }
        }
    }
}

export { Particles }