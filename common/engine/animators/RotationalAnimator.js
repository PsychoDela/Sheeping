import { Transform } from '../core.js';
import { quat } from '../../../lib/gl-matrix-module.js';

export class RotationalAnimator {

    constructor(node, {
        axis = [0, -1, 0], // Default axis of rotation is around the y-axis
        startAngle = 0,
        endAngle = Math.PI, // Assuming a half-circle (180 degrees)
        startTime = 0,
        duration = 1,
        loop = true, // Set loop to true to create back-and-forth animation
    } = {}) {
        this.node = node;
        this.axis = axis;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.startTime = startTime;
        this.duration = duration;
        this.loop = loop;
        this.playing = true;
        this.forward = true; // Flag to determine the forward direction
        this.elapsedTime = 0; // Track elapsed time for reversing direction
    }

    play() {
        this.playing = true;
    }

    pause() {
        this.playing = false;
    }

    update(t, dt) {
        if (!this.playing) {
            return;
        }

        this.elapsedTime += dt;

        if (this.elapsedTime >= this.duration) {
            if (this.loop) {
                this.elapsedTime = 0;
                this.forward = !this.forward; // Reverse direction
            } else {
                this.playing = false; // Stop playing when reaching the end
                return;
            }
        }

        const progress = this.elapsedTime / this.duration;
        const interpolation = this.forward ? progress : 1 - progress;

        this.updateNode(interpolation);
    }

    updateNode(interpolation) {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        const angle = this.startAngle + (this.endAngle - this.startAngle) * interpolation;
        const rotation = quat.create();
        quat.setAxisAngle(rotation, this.axis, angle);

        transform.rotation = rotation;
    }
}
