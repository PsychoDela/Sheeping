import { Transform } from '../core.js';

import { vec3 } from '../../../lib/gl-matrix-module.js';

export class CircularAnimator {

    constructor(node, {
        center = [0, 0, 0],
        radius = 1,
        startAngle = 0,
        endAngle = Math.PI, // Assuming a half-circle (180 degrees)
        startTime = 0,
        duration = 1,
        loop = false,
    } = {}) {
        this.node = node;

        this.center = center;
        this.radius = radius;

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
        const x = this.center[0] + this.radius * Math.cos(angle);
        const z = this.center[2] + this.radius * Math.sin(angle);

        vec3.set(transform.translation, x, this.center[1], z);
    }
}
