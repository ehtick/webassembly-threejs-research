import * as THREE from 'three';

class Particles {
    static COMPONENTS_PER_PARTICLE = 3;

    constructor(particleCount = 100, pointSize = 0.5, pointColor = 0x00ff00, positionBounds = 50, velocitySpeed = 5) {
        this.particleCount = particleCount;
        this.pointSize = pointSize;
        this.pointColor = pointColor;
        this.positionBounds = positionBounds;
        this.velocitySpeed = velocitySpeed;

        this.arrayLength = this.particleCount * Particles.COMPONENTS_PER_PARTICLE;
        this.positionArray = new Float32Array(this.arrayLength);
        this.velocityArray = new Float32Array(this.arrayLength);
        this.boxBounds = this.positionBounds / 2;
        
        this.init();
    }
      
    init() {
        // Set a random number in each position and velocity
        for (let i = 0; i < this.arrayLength; i++) {
            // Range: -0.5, +0.5
            const POS_RANGE = (Math.random() - 0.5); 
            const VEL_RANGE = (Math.random() - 0.5);
                
            this.positionArray[i] = POS_RANGE * this.positionBounds;
            this.velocityArray[i] = VEL_RANGE * this.velocitySpeed;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionArray, 3));

        const MATERIAL = new THREE.PointsMaterial({ size: this.pointSize, color: this.pointColor });
        this.mesh = new THREE.Points(this.geometry, MATERIAL);
    }

    update(deltaTime = 1/60) {
        for (let i = 0; i < this.particleCount; i++) {
            const INDEX = i * Particles.COMPONENTS_PER_PARTICLE;

            let positionArray = this.positionArray;
            let velocityArray = this.velocityArray;

            // Update each particle's xyz at the same time 
            positionArray[INDEX] += velocityArray[INDEX] * deltaTime; // x
            positionArray[INDEX + 1] += velocityArray[INDEX + 1] * deltaTime; // y
            positionArray[INDEX + 2] += velocityArray[INDEX + 2] * deltaTime; // z

            // Check particle's collision xyz
            for (let j = 0; j < Particles.COMPONENTS_PER_PARTICLE; j++) {
                const position = this.positionArray[INDEX + j];

                // if particle's xyz hit the box border, then change it directions
                const BOUNDS = this.boxBounds;
                if (position < -BOUNDS || position > BOUNDS) {
                    positionArray[INDEX + j] = Math.max(-BOUNDS, Math.min(BOUNDS, position))
                    velocityArray[INDEX + j] *= -0.8;
                }
            }
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
}

export { Particles }