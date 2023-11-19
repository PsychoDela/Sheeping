import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import { OrbitController } from './common/engine/controllers/OrbitController.js';
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
await gltfLoader.load('common/models/monkey.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const camera = scene.find(node => node.getComponentOfType(Camera));
camera.addComponent(new OrbitController(camera, document.body, {
    distance: 8,
}));

const model = scene.find(node => node.getComponentOfType(Model));
const jumpAnimator = new JumpAnimator(model);

document.addEventListener('keydown', async (event) => {
    if (event.code == 'Space') {
        jumpAnimator.startJump();
    } 
    else if (event.key == 'z' || event.key == 'Z') { // Checking for 'Z' key press
        try {
            const newModelLoader = new GLTFLoader();
            await newModelLoader.load('common/models/Gear1.gltf');

            const newModelScene = newModelLoader.loadScene(newModelLoader.defaultScene);
            const newModel = newModelScene.find(node => node.getComponentOfType(Model));
            const transform = newModel.getComponentOfType(Transform);

            // Generate random positions for x, y, z within a specific range
            const randomX = Math.random() * 20 - 10; // Adjust these ranges as needed
    

            // Set the position of the new model randomly on the screen
            transform.translation = [randomX, 50, 0];
            transform.scale = [0.2, 0.2, 0.2]; // Change the scale to make sure it's visible

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
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update: updateScene, render: render }).start(); // Use updateScene as the update function and render as the render function
