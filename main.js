import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';
import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';
import { OrbitController } from './common/engine/controllers/OrbitController.js';
import { RotateAnimator } from './common/engine/animators/RotateAnimator.js';
import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';
import { JumpAnimator } from './common/engine/animators/JumpAnimator.js';
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
    if (event.code === 'Space') {
        jumpAnimator.startJump();
    }
});

document.addEventListener('mousedown', async (event) => {
    if (event.button === 0) {
        try {
            const newModelLoader = new GLTFLoader();
            await newModelLoader.load('common/models/Gear1.gltf');

            const newModelScene = newModelLoader.loadScene(newModelLoader.defaultScene);
            const newModel = newModelScene.find(node => node.getComponentOfType(Model));
            const transform = newModel.getComponentOfType(Transform);

            // Generate random positions for x, y, z within a specific range
            var randomX = Math.random() * 5; // Adjust these ranges as needed
            var randomY = Math.random() * 5;
            var randomZ = Math.random() * 5;
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
            transform.translation = [randomX, randomY, randomZ];
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

    jumpAnimator.update();
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
new UpdateSystem({ update: updateScene, render: render }).start();
