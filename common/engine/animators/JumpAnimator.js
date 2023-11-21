import { Transform } from '../core.js'; // Adjust the import path as per your file structure

export class JumpAnimator {
    constructor(node, jumpHeight = 2, jumpDuration = 0.5) {
        this.node = node;
        this.originalPosition = node.getComponentOfType(Transform).translation.slice(); // Ensure Transform is accessible here

        this.jumpHeight = jumpHeight;
        this.jumpDuration = jumpDuration;

        this.jumping = false;
        this.startTime = 0;
    }

    startJump() {
    
        if (!this.jumping) {
            this.jumping = true;
            this.startTime = performance.now(); // Record the start time of the jump
        }
    }

    update() {
        if (this.jumping) {
            const currentTime = performance.now();
            const elapsed = (currentTime - this.startTime) / 1000; // Convert to seconds

            if (elapsed <= this.jumpDuration) {
                const progress = elapsed / this.jumpDuration;
                const yOffset = Math.sin(progress * Math.PI) * this.jumpHeight;

                const transform = this.node.getComponentOfType(Transform);
                transform.translation[1] = this.originalPosition[1] + yOffset; // Apply vertical jump

                // Additional logic for controlling forward/backward movement or other transformations could be added here
            } else {
                this.jumping = false;
                const transform = this.node.getComponentOfType(Transform);
                transform.translation[1] = this.originalPosition[1]; // Reset to original Y position after the jump
            }
        }
    }
}
