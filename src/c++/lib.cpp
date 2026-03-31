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

EMSCRIPTEN_BINDINGS(my_module) { 
  emscripten::function("updateParticlePhysics", &updateParticlePhysics); 
} 