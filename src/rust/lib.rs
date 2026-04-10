use std::alloc::{alloc, dealloc, Layout};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn malloc(size: usize) -> usize {
    unsafe {
        let alignment: usize = std::mem::align_of::<f32>();
        let layout: Layout = Layout::from_size_align_unchecked(size, alignment);
        return alloc(layout) as usize;
    }
}

#[wasm_bindgen]
pub fn free(pointer: usize, size: usize) {
    unsafe {
        let alignment: usize = std::mem::align_of::<f32>();
        let layout: Layout = Layout::from_size_align_unchecked(size, alignment);
        dealloc(pointer as *mut u8, layout);
    }
}

#[wasm_bindgen]
pub fn update_particle_physics(count: u32, max_components: u32, position_offset: u32, velocity_offset: u32, speed: f32, box_bounds: f32, delta_time: f32) {
    let count: usize = count as usize;
    let max_components: usize = max_components as usize;
    let length: usize = count * max_components;      
    
    let position_array: &mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(position_offset as usize as *mut f32, length)
    };

    let velocity_array: &mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(velocity_offset as usize as *mut f32, length)
    };
    
    // Loop through each particle
    for particle in 0..count {
        let particle_index: usize = particle * max_components;

        // Loop through x, y, z from particle
        for component in 0..max_components {
            // Get each x, y and z
            let component_index: usize = particle_index + component;

            // Update each x, y and z
            let position: f32 = position_array[component_index] + (velocity_array[component_index] * speed) * delta_time;
            position_array[component_index] = position;

            // If particle's x, y or z hits box border, then reverse direction
            if position <= -box_bounds || position >= box_bounds {
                let upper_clamped: f32 = f32::min(box_bounds, position);
                let lower_clamped: f32 = f32::max(-box_bounds, upper_clamped);
                
                let reverse_direction: f32 = -1.0;
                position_array[component_index] = lower_clamped;
                velocity_array[component_index] *= reverse_direction;
            }
        }
    }
}

pub fn intersects_box(a_x: f32, a_y: f32, a_z: f32, b_x: f32, b_y: f32, b_z: f32, size: f32) -> bool {
    let half_size: f32 = size / 2.0;

    // If there is no overlap between a and b, return false
    if a_x + half_size < b_x - half_size || a_x - half_size > b_x + half_size { return false; };
    if a_y + half_size < b_y - half_size || a_y - half_size > b_y + half_size { return false; };
    if a_z + half_size < b_z - half_size || a_z - half_size > b_z + half_size { return false; };

    // If there is overlap between a and b, return true
    return true;
}

#[wasm_bindgen]
pub fn update_cube_particle_collision(position_offset: u32, velocity_offset: u32, size: f32, count: u32, max_components: u32, push_apart: f32) {
    let count: usize = count as usize;
    let max_components: usize = max_components as usize;
    
    let length: usize = count * max_components;     
    
    let position_array: &mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(position_offset as usize as *mut f32, length)
    };

    let velocity_array: &mut [f32] = unsafe {
        std::slice::from_raw_parts_mut(velocity_offset as usize as *mut f32, length)
    };
        
    // Loop through all particles A
    for particle_a in (0..length).step_by(max_components) {
        let next_particle: usize = max_components;

        // Loop through all particles after particles A
        for particle_b in ((particle_a + next_particle)..length).step_by(max_components) {
            let a_x: f32 = position_array[particle_a + 0];
            let a_y: f32 = position_array[particle_a + 1];
            let a_z: f32 = position_array[particle_a + 2];

            let b_x: f32 = position_array[particle_b + 0];
            let b_y: f32 = position_array[particle_b + 1];
            let b_z: f32 = position_array[particle_b + 2];

            // If cube particle hits another particle cube, then reverse direction depending on which componets hits
            if intersects_box(a_x, a_y, a_z, b_x, b_y, b_z, size) {
                let particles: [usize; 2] = [particle_a, particle_b];

                for particle in 0..particles.len() {
                    for component in 0..max_components {
                        // Get each particle's x, y and z 
                        let component_index: usize =  particles[particle] + component;
                        
                        // Make cube particles bounce away from each other
                        // Reverse the cube particle's x, y, z velocity
                        let reverse_direction: f32 = -1.0;
                        let particle_vel: f32 = velocity_array[component_index] * reverse_direction;
                        velocity_array[component_index] = particle_vel;

                        // Prevent two cube particles from sticking together (overlapping)
                        // Move the cube particle along its new velocity (x, y, z)
                        position_array[component_index] += particle_vel * push_apart;
                    }
                } 
            }
        }
    }
}