import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';
import { OBJLoader } from './common/engine/loaders/OBJLoader.js'

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

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/Gear1.gltf');
const objLoader = new OBJLoader();
await objLoader.loadMesh('common/models/sheep.obj');

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
    click_count++;
    if (event.button === 0 && click_count == 5) {
        click_count = 0;
        try {
            const newModelLoader = new GLTFLoader();
            await newModelLoader.load('common/models/coin.gltf');

            const newModelScene = newModelLoader.loadScene(newModelLoader.defaultScene);
            const newModel = newModelScene.find(node => node.getComponentOfType(Model));
            const transform = newModel.getComponentOfType(Transform);

               // Reduce the scale of the gear model on click
               const gearModel = scene.find(node => node.getComponentOfType(Model));
              /*if (gearModel) {
                   const gearTransform = gearModel.getComponentOfType(Transform);
                   gearTransform.scale = gearTransform.scale.map(value => value * 0.9);  
               }*/

               if (gearModel) {
                const gearMaterial = gearModel.getComponentOfType(Model).primitives[0].material;
                //console.log(gearMaterial)
                if (gearMaterial) {
                    gearMaterial.baseFactor = current_color; // Setting color to red [R, G, B], in this case pure red
                }
            }
            // Generate random positions for x, y, z within a specific range
            var randomX = (Math.random() - 0.5) * 15; // Adjust these ranges as needed
            var randomZ = (Math.random() - 0.5) * 15;

            // Set the initial position of the new model
            transform.scale = [75, 75, 75]; // Change the scale to make sure it's visible
            transform.translation = [randomX * 50, 50, randomZ * 50]; // Starts higher up

            var rotationAxis = [1, 0, 0]; // Y-axis
            var rotationAngle = Math.PI+1;
            var rotationQuaternion = quaternionFromAxisAngle(rotationAxis, rotationAngle);
            transform.rotation = multiplyQuaternions(transform.rotation, rotationQuaternion);

            // Add the new model to the scene
            scene.addChild(newModelScene);
            coins_count = coins_count + Math.floor(Math.random() * 5 + 1);
            updateCoins();

            // Falling animation towards a certain Y position
            const targetX = transform.translation[0]+300; // Adjust the target Y position
            const fallingSpeed = 10; // Adjust falling speed as needed

            const fallInterval = setInterval(() => {
                
                if (transform.translation[0] < targetX) {
                    transform.translation[0] += fallingSpeed;
                } else {
                    clearInterval(fallInterval);
                    scene.removeChild(newModelScene); // Remove the coin when it reaches the target Y position
                    updateCoins();
                }
            }, 16); // 60 frames per second
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

function updateCoins() {
    document.querySelector(".counter").innerHTML = coins_count + ' <img src="coins-solid.svg">'; 
}

function buy(num) {
    alert("op op");
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
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme3").addEventListener("click", (event) => {
    price = 30;

    if (coins_count >= price) {
        current_color = [0, 0, 5, 1]
        coins_count -= price;
        alert("You have bought blue as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme4").addEventListener("click", (event) => {
    price = 40;

    if (coins_count >= price) {
        current_color = [5, 5, 0, 1]
        coins_count -= price;
        alert("You have bought yellow as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme5").addEventListener("click", (event) => {
    price = 50;
    
    if (coins_count >= price) {
        current_color = [5, 0, 5, 1]
        coins_count -= price;
        alert("You have bought magenta as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
    }

    else {
        alert("Not enough coins");
    }
})

document.querySelector("#dugme6").addEventListener("click", (event) => {
    price = 90;

    if (coins_count >= price) {
        current_color = [10, 30, 10, 1]
        coins_count -= price;
        alert("You have bought super green as your color");
        document.querySelector(".menu").style.visibility = "hidden";
        menu_visible = false;
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