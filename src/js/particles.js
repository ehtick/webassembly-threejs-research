import * as THREE from 'three';

class Particles {
    static COMPONENTS_PER_PARTICLE = 3;

    constructor({ particleCount = 100, size = 0.5, color = 0x00ff00, positionBounds = 50, velocitySpeed = 5 } = {} ) {
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
        const {positionArray, size, color} = this;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

        const material = new THREE.PointsMaterial({ size: size, color: color });
        this.mesh = new THREE.Points(this.geometry, material);
    }

    update(deltaTime) {
        const {particleCount, positionArray, velocityArray, boxBounds} = this;

        // Loop through each particle
        for (let i = 0; i < particleCount; i++) {
            const particleIndex = i * Particles.COMPONENTS_PER_PARTICLE;

            // Loop through x, y, z from particle
            for (let j = 0; j < Particles.COMPONENTS_PER_PARTICLE; j++) {
                
                // Move particle's xyz
                positionArray[particleIndex + j] += velocityArray[particleIndex + j] * deltaTime;
                
                const particlePos = positionArray[particleIndex + j];

                // If particle's xyz hits box border, then reverse direction
                if (particlePos < -boxBounds || particlePos > boxBounds) {
                    positionArray[particleIndex + j] = Math.max(-boxBounds, Math.min(boxBounds, particlePos))
                    velocityArray[particleIndex + j] *= -1;
                }
            }
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
}

export { Particles }