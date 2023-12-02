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

var coins_count = 1000;
var click_count = 0;
var current_color = [1, 1, 1, 1]

updateCoins()

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/sheepies.gltf');

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

const sheepTransform = model.getComponentOfType(Transform);
const sheepMaterial = model.getComponentOfType(Model).primitives[0].material;
sheepTransform.scale = [7,7,7];
sheepTransform.translation = [0,-10,15];

const terrainLoader = new GLTFLoader();
await terrainLoader.load('common/models/terrain.gltf');

const terrainScene = terrainLoader.loadScene(terrainLoader.defaultScene);
const terrainModel = terrainScene.find(node => node.getComponentOfType(Model));


const terrainTransform = terrainModel.getComponentOfType(Transform);
terrainTransform.translation[1] -= 30;

scene.addChild(terrainScene);

/*document.addEventListener('keydown', async (event) => {
    if (event.code == 'Space') {
        jumpAnimator.startJump();
    } 
})*/

document.addEventListener('mousedown', async (event) => {
    console.log(click_count);
    click_count++;
    if (event.button === 0) {
        if (click_count === 7) {
            // Remove the current sheep model
            scene.removeChild(model); // Assuming "sheepModel" refers to the current sheep model
            try {
                scene.addChild(model);
                sheepTransform.scale = [7,7,7];
                coins_count = coins_count + Math.floor(Math.random() * 5 + 1);
                updateCoins();

            } catch (error) {
                console.error('Error loading coin model:', error);
            }
            click_count = 0;
        }
        try {
            const newModelLoader = new GLTFLoader();
            await newModelLoader.load('common/models/wool.gltf');

            const newModelScene = newModelLoader.loadScene(newModelLoader.defaultScene);
            const newModel = newModelScene.find(node => node.getComponentOfType(Model));
            const transform = newModel.getComponentOfType(Transform);
 
            sheepTransform.scale = sheepTransform.scale.map(value => value * 0.95);  
               
    
            var randomX = (Math.random()) * 3 + 2; // Adjust these ranges as needed
            var randomY = (Math.random()) * 3
            var randomZ = (Math.random()) * 5;

            var sign1 = Math.floor(Math.random() * 2)
            var sign2 = Math.floor(Math.random() * 2)
            var sign3 = Math.floor(Math.random() * 2)

            if (sign1 % 2 == 0) {
                randomX *= -1
            }
            if (sign2 % 2 == 0) {
                randomY *= -1
            }
            if (sign3 % 2 == 0) {
                randomZ *= -1
            }

            // Set the initial position of the new model
            transform.scale = [0.02, 0.02, 0.02]; // Change the scale to make sure it's visible
            transform.translation = [randomX, randomY, 15 + randomZ]; // Starts higher up

            // Add the new model to the scene
            scene.addChild(newModel);
            coins_count = coins_count + Math.floor(Math.random() * 5 + 1);
            updateCoins();

            // Falling animation towards a certain Y position
            const targetY = transform.translation[1]-9; // Adjust the target Y position
            const fallingSpeed = 0.05; // Adjust falling speed as needed

            const fallInterval = setInterval(() => {
                
                if (transform.translation[1] > targetY) {
                    transform.translation[1] -= fallingSpeed;
                } 
                else {
                    clearInterval(fallInterval);
                    scene.removeChild(newModel); // Remove the coin when it reaches the target Y position
                    updateCoins();
                }
            }, 16); 
        } catch (error) {
            console.error('Error loading coin model:', error);
        }
    }
});

function updateScene(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });
}

function render() {
    renderer.render(scene, camera);
}

const light = new Node();
light.addComponent(new Transform({
    translation: [0, 60, 20],
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

function updateCoins() {
    document.querySelector(".counter").innerHTML = coins_count + ' <img src="coins-solid.svg">'; 
}

var price = 0;

document.querySelector("#dugme1").addEventListener("click", (event) => {
    price = 10;

    if (coins_count >= price) {
        current_color = [0, 1, 0, 1]
        coins_count -= price;
        alert("You have bought green as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
        sheepMaterial.baseFactor = current_color;
    }

    else {
        alert("Not enough coins");
    } 
})

document.querySelector("#dugme2").addEventListener("click", (event) => {
    price = 20;

    if (coins_count >= price) {
        current_color = [1, 0, 0, 1]
        coins_count -= price;
        alert("You have bought red as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
        sheepMaterial.baseFactor = current_color;
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme3").addEventListener("click", (event) => {
    price = 30;

    if (coins_count >= price) {
        current_color = [0, 0, 1, 1]
        coins_count -= price;
        alert("You have bought blue as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
        sheepMaterial.baseFactor = current_color;
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme4").addEventListener("click", (event) => {
    price = 40;

    if (coins_count >= price) {
        current_color = [1, 1, 0, 1]
        coins_count -= price;
        alert("You have bought yellow as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
        sheepMaterial.baseFactor = current_color;
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme5").addEventListener("click", (event) => {
    price = 50;
    
    if (coins_count >= price) {
        current_color = [1, 0, 1, 1]
        coins_count -= price;
        alert("You have bought magenta as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
        sheepMaterial.baseFactor = current_color;
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme6").addEventListener("click", (event) => {
    price = 90;

    if (coins_count >= price) {
        current_color = [1, 2, 1, 1]
        coins_count -= price;
        alert("You have bought super green as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
        sheepMaterial.baseFactor = current_color;
    }

    else {
        alert("Not enough coins");
    }
})

var menu_visible = false;

document.querySelector("#menu").addEventListener("click", (event) => {
    if (menu_visible) {
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
    }
    else {
        document.querySelector(".menu").style.visibility = "visible";
        menu_visible = true;
    }
})