import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import { OrbitController } from './common/engine/controllers/OrbitController.js';
import { FirstPersonController } from './common/engine/controllers/FirstPersonController.js';
import { RotateAnimator } from './common/engine/animators/RotateAnimator.js';
import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';
import { JumpAnimator } from './common/engine/animators/JumpAnimator.js'; // Import the JumpAnimator class

import {
    Camera,
    Model,
    Node,
    Transform,
} from './common/engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/Gear1.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const camera = new Node();
camera.addComponent(new Transform({
    translation: [0, 0, 50], // Setting initial translation for the "camera"
}));

// Add a "Camera" component to the newly created node
camera.addComponent(new Camera({
    aspect: canvas.width / canvas.height, // Set the initial aspect ratio
}));

const model = scene.find(node => node.getComponentOfType(Model));
model.scale = [0.2, 0.2, 0.2]
const jumpAnimator = new JumpAnimator(model);


document.addEventListener('keydown', async (event) => {
    if (event.code == 'Space') {
        jumpAnimator.startJump();
    } 
})

document.addEventListener('mousedown', async (event) => {
    if (event.button === 0) { 
        try {
            const newModelLoader = new GLTFLoader();
            await newModelLoader.load('common/models/coin.gltf');

            const newModelScene = newModelLoader.loadScene(newModelLoader.defaultScene);
            const newModel = newModelScene.find(node => node.getComponentOfType(Model));
            const transform = newModel.getComponentOfType(Transform);

            // Generate random positions for x, y, z within a specific range
            var randomX = Math.random() * 15; // Adjust these ranges as needed
            var randomY = Math.random() * 15;
            var randomZ = Math.random() * 15;
            const sign1 = Math.floor(Math.random() * 2)
            const sign2 = Math.floor(Math.random() * 2)
            const sign3 = Math.floor(Math.random() * 2)

            if (sign1 % 2 == 0) {
                randomX *= -1
            }
            if (sign2 % 2 == 0) {
                randomY *= -1
            }
            if (sign3 % 2 == 0) {
                randomZ *= -1
            }
            // Set the position of the new model randomly on the screen
            transform.translation = [randomX * 50, randomY * 50, randomZ * 50];
            transform.scale = [75, 75, 75]; // Change the scale to make sure it's visible
            const rotationSpeed = 2; // Adjust rotation speed as needed
            setInterval(() => {
                const currentRotation = newModel.getComponentOfType(Transform).rotation;
                const rotationAxis = [1, 1, 1]; // Assuming rotation around the y-axis
                const rotationAngle = rotationSpeed * (Math.PI / 180); // Convert degrees to radians
                const rotationQuaternion = quaternionFromAxisAngle(rotationAxis, rotationAngle);
                newModel.getComponentOfType(Transform).rotation = multiplyQuaternions(currentRotation, rotationQuaternion);
            }, 16); // 60 frames per second

            scene.addChild(newModelScene);
        } catch (error) {
            console.error('Error loading Gear1 model:', error);
        }
    }
});

function updateScene(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    jumpAnimator.update(); // Update the jump animation

    // Rotate the gear model continuously around its own axis
    var rotationSpeed = 0.5; // Adjust the speed of rotation as needed
    const modelNode = scene.find(node => node.getComponentOfType(Model));
    if (modelNode) {
        const rotation = modelNode.getComponentOfType(Transform).rotation;
        const rotationAxis = [0, 1, 0]; // Assuming rotation around the y-axis
        const rotationAngle = rotationSpeed * dt; // Adjusting rotation by time
        const rotationQuaternion = quaternionFromAxisAngle(rotationAxis, rotationAngle);
        modelNode.getComponentOfType(Transform).rotation = multiplyQuaternions(rotation, rotationQuaternion);
    }
}

function render() {
    renderer.render(scene, camera);
}

const light = new Node();
light.addComponent(new Transform({
    translation: [3, 3, 3],
}));
light.addComponent(new Light({
    ambient: 0.3,
}));
scene.addChild(light);

function resize({ displaySize: { width, height }}) {
    camera.aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update: updateScene, render: render }).start(); // Use updateScene as the update function and render as the render function
// Helper function to create a quaternion from axis and angle
function quaternionFromAxisAngle(axis, angle) {
    const halfAngle = angle * 0.5;
    const s = Math.sin(halfAngle);
    return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(halfAngle)];
}

// Helper function to multiply quaternions
function multiplyQuaternions(q1, q2) {
    const result = [];
    result[0] = q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1];
    result[1] = q1[3] * q2[1] + q1[1] * q2[3] + q1[2] * q2[0] - q1[0] * q2[2];
    result[2] = q1[3] * q2[2] + q1[2] * q2[3] + q1[0] * q2[1] - q1[1] * q2[0];
    result[3] = q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2];
    return result;
}

document.addEventListener('keydown', (event) => {
    const cameraTransform = camera.getComponentOfType(Transform);
    const current = cameraTransform.translation;
    const rotation = cameraTransform.rotation;

    switch (event.key) {
        case 'w':
        case 'W':
            current[2] -= 5;
            break;
        case 'a':
        case 'A':
            current[0] -= 5;
            break;
        case 's':
        case 'S':
            current[2] += 5;
            break;
        case 'd':
        case 'D':
            current[0] += 5;
            break;
        case 'q':
        case 'Q':
            const rotationLeft = quaternionFromAxisAngle([0, 1, 0], 5*Math.PI / 180); // Rotate left by an angle (in radians), e.g., 1 degree here
            cameraTransform.rotation = multiplyQuaternions(rotation, rotationLeft);
            break;
        case 'e':
        case 'E':
            const rotationRight = quaternionFromAxisAngle([0, 1, 0], -5*Math.PI / 180); // Rotate right by an angle (in radians), e.g., 1 degree here
            cameraTransform.rotation = multiplyQuaternions(rotation, rotationRight);
            break;
        default:
            break;
    }

    cameraTransform.translation = current;
});

