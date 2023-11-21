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
            await newModelLoader.load('common/models/scene.gltf');

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
            transform.scale = [50, 50, 50]; // Change the scale to make sure it's visible
            const rotation = transform.rotation;
            // Log the new model's properties for debugging
            console.log('New Model Properties:', transform);

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

document.addEventListener('keydown', (event) => {
    var current = camera.getComponentOfType(Transform).translation
    switch (event.key) {
        case 'w':
        case 'W':
            current[2] += 5;
            camera.getComponentOfType(Transform).translation = current;
            break;
        case 'a':
        case 'A':
            current[0] += 5;
            camera.getComponentOfType(Transform).translation = current;
            break;
        case 's':
        case 'S':
            current[2] -= 5;
            camera.getComponentOfType(Transform).translation = current;
            break;
        case 'd':
        case 'D':
            current[0] -= 5;
            camera.getComponentOfType(Transform).translation = current;
            break;
        default:
            break;
    }
});