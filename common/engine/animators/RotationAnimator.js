import { Transform } from '../core.js';

import { quat, mat4, vec3 } from '../../../lib/gl-matrix-module.js';

export class RotationAnimator {

    constructor(node, {
        axis = [0, 1, 0], // Default axis is Y-axis
        startAngle = 0,
        endAngle = Math.PI * 2, // Assuming a full rotation (360 degrees)
        startTime = 0,
        duration = 1,
        loop = false,
    } = {}) {
        this.node = node;

        this.axis = axis;
        vec3.normalize(this.axis, this.axis); // Ensure axis is normalized

        this.startAngle = startAngle;
        this.endAngle = endAngle;

        this.startTime = startTime;
        this.duration = duration;
        this.loop = loop;

        this.playing = true;
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

        const angularInterpolation = (t - this.startTime) / this.duration;
        const clampedInterpolation = Math.min(Math.max(angularInterpolation, 0), 1);
        const loopedInterpolation = ((angularInterpolation % 1) + 1) % 1;
        this.updateNode(this.loop ? loopedInterpolation : clampedInterpolation);
    }

    updateNode(interpolation) {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        const angle = this.startAngle + (this.endAngle - this.startAngle) * interpolation;

        const rotationQuaternion = quat.create();
        quat.setAxisAngle(rotationQuaternion, this.axis, angle);

        const currentRotation = mat4.create();
        mat4.fromQuat(currentRotation, rotationQuaternion);

        mat4.multiply(transform.rotation, currentRotation, transform.rotation);
    }

}
