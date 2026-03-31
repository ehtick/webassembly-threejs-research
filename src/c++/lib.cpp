#include <algorithm>
#include <emscripten/bind.h> 

void updateParticlePhysics(int count, int maxComponents, emscripten::val positionArray, emscripten::val velocityArray, float speed, float boxBounds, float deltaTime) {
    // Loop through each particle
    for (int particle = 0; particle < count; particle++) {
        const int particleIndex = particle * maxComponents;

        // Loop through x, y, z from particle
        for (int component = 0; component < maxComponents; component++) {
            // Get each x, y and z
            const int componentIndex = particleIndex + component;

            // Update each x, y and z
            const float position = positionArray[componentIndex].as<float>() + (velocityArray[componentIndex].as<float>() * speed) * deltaTime;
            positionArray.set(componentIndex, position);

            // If particle's x, y or z hits box border, then reverse direction
            if (position <= -boxBounds || position >= boxBounds) {
                const float upperClamped = std::min(boxBounds, position);
                const float lowerClamped = std::max(-boxBounds, upperClamped);
                
                const int reverseDirection = -1;
                positionArray.set(componentIndex, lowerClamped);
                velocityArray.set(componentIndex, velocityArray[componentIndex].as<float>() * reverseDirection);
            }
        }
    }
}

bool intersectsBox(emscripten::val a,  emscripten::val b) {
    emscripten::val aMin = a["min"];
    emscripten::val aMax = a["max"];  
    emscripten::val bMin = b["min"];
    emscripten::val bMax = b["max"];
    
    float aMinX = aMin["x"].as<float>();
    float aMaxX = aMax["x"].as<float>();
    float bMinX = bMin["x"].as<float>();
    float bMaxX = bMax["x"].as<float>();

    float aMinY = aMin["y"].as<float>();
    float aMaxY = aMax["y"].as<float>();
    float bMinY = bMin["y"].as<float>();
    float bMaxY = bMax["y"].as<float>();

    float aMinZ = aMin["z"].as<float>();
    float aMaxZ = aMax["z"].as<float>();
    float bMinZ = bMin["z"].as<float>();
    float bMaxZ = bMax["z"].as<float>();

    // If there is no overlap between a and b, return false
    if (aMaxX < bMinX || aMinX > bMaxX) return false;
    if (aMaxY < bMinY || aMinY > bMaxY) return false;
    if (aMaxZ < bMinZ || aMinZ > bMaxZ) return false;

    // If there is overlap between a and b, return true
    return true;
}

void updateCubeParticleHitBoxes(emscripten::val hitBoxes, int maxComponents, emscripten::val positionArray, emscripten::val velocityArray, float pushApart) {
    const int hitBoxesLength = hitBoxes["length"].as<int>();
    
    for(int firstHitBox = 0; firstHitBox < hitBoxesLength; firstHitBox++) {
        const int nextHitBox = 1;
        for(int secondHitBox = firstHitBox + nextHitBox; secondHitBox < hitBoxesLength; secondHitBox++) {
            
            // If cube particle hits another particle cube, then reverse direction
            if(intersectsBox(hitBoxes[firstHitBox], hitBoxes[secondHitBox])) {
                const int firstCubeHitBoxIndex = firstHitBox * maxComponents;
                const int secondCubeHitBoxIndex = secondHitBox * maxComponents;
                const int cubeHitBoxes[2] = {firstCubeHitBoxIndex, secondCubeHitBoxIndex};
                const int cubeHitBoxesLength = sizeof(cubeHitBoxes) / sizeof(cubeHitBoxes[0]);
               
                for(int cubeHitBox = 0; cubeHitBox < cubeHitBoxesLength; cubeHitBox++) {
                    for (int component = 0; component < maxComponents; component++) {
                        // Get hitBox's x, y and z 
                        const int componentIndex = cubeHitBoxes[cubeHitBox] + component;

                        // Make cube particles bounce away from each other
                        // Reverse the cube particle's x, y, z velocity
                        const int reverseDirection = -1;
                        const float cubeVel = velocityArray[componentIndex].as<float>() * reverseDirection;
                        velocityArray.set(componentIndex, cubeVel);
                       
                        // Prevent two cube particles from sticking together (overlapping)
                        // Move the cube particle along its new velocity (x, y, z)
                        const float position = positionArray[componentIndex].as<float>() + cubeVel * pushApart;
                        positionArray.set(componentIndex, position);
                    }
                }
            }
        }
    }
}

EMSCRIPTEN_BINDINGS(my_module) { 
  emscripten::function("updateParticlePhysics", &updateParticlePhysics);
  emscripten::function("updateCubeParticleHitBoxes", &updateCubeParticleHitBoxes); 
} 