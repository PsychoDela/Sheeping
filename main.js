import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';
import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';
import { CircularAnimator } from './common/engine/animators/CircularAnimator.js';
import { RotationalAnimator } from './common/engine/animators/RotationalAnimator.js'

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from './common/engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';

var coins_count = 0;
var click_count = 0;
var current_color = [1, 1, 1, 1]
var x = 0;
var y = 0;

const audioB = document.getElementById('background-music');
audioB.play();

updateCoins()

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/sheepies.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const camera = new Node();
camera.addComponent(new Transform({
    translation: [0, 7, 0], // Setting initial translation for the "camera"
}));

// Add a "Camera" component to the newly created node
camera.addComponent(new Camera({
    aspect: canvas.width / canvas.height, // Set the initial aspect ratio
    far: 1000,
}));

camera.addComponent(new CircularAnimator(
    camera,
    {
        center: [0,7,-45],
        radius: 45,
        duration: 10,
        loop: true,
        startAngle: Math.PI / 3 - 0.3,
        endAngle: 2 * Math.PI / 3 + 0.3
    }
))

camera.addComponent(new RotationalAnimator(
    camera,
    {
        duration: 10,
        startAngle: -Math.PI / 3 + 0.1,
        endAngle: Math.PI / 3 - 0.1
    }
))


const model = scene.find(node => node.getComponentOfType(Model));

const sheepTransform = model.getComponentOfType(Transform);
const sheepMaterial = model.getComponentOfType(Model).primitives[0].material;
sheepTransform.scale = [5,5,5];
sheepTransform.translation = [4,0,-45];
const rotationLeft1 = quaternionFromAxisAngle([0, 1, 0], -50*Math.PI / 180); // Rotate left by an angle (in radians), e.g., 1 degree here
sheepTransform.rotation = multiplyQuaternions(sheepTransform.rotation, rotationLeft1);

const terrainLoader = new GLTFLoader();
await terrainLoader.load('common/models/new_terrain.gltf');

const terrainScene = terrainLoader.loadScene(terrainLoader.defaultScene);
const terrainModel = terrainScene.find(node => node.getComponentOfType(Model));


const terrainTransform = terrainModel.getComponentOfType(Transform);
terrainTransform.translation[1] -= 30;
terrainTransform.translation[2] -= 30;
terrainTransform.scale = [1.2,1.1,1.1]

scene.addChild(terrainScene);

const sheep2Loader = new GLTFLoader();
await sheep2Loader.load('common/models/scene.gltf');

const newScene = sheep2Loader.loadScene(sheep2Loader.defaultScene);
const sheep2 = newScene.find(node => node.getComponentOfType(Model));

// You can adjust the transformation or properties of the new model if needed
// For example:
const sheep2Transform = sheep2.getComponentOfType(Transform);
sheep2Transform.scale = [5,5,5]; // Set the scale
sheep2Transform.translation = [0,2,-45]; // Set the position

const rotation2 = quaternionFromAxisAngle([1, 0, 0], -80*Math.PI / 180); // Rotate left by an angle (in radians), e.g., 1 degree here
sheep2Transform.rotation = multiplyQuaternions(sheep2Transform.rotation, rotation2);
const sheepMaterial2 = sheep2.getComponentOfType(Model).primitives[0].material;

let firstLoaded = true;
var image = 0;

document.addEventListener('mousedown', async (event) => {
    const cursorImage = document.getElementById('cursor-image');

    if (image == 0) {
        cursorImage.src = "common/models/makaze.png";
        image = 1;
    }
    else if (image == 1) {
        cursorImage.src = "common/models/makaze2.png"
        image = 0;
    }

    if (event.button === 0 && x >= maxX / 2 - 350 && x <= maxX / 2 + 350 && y >= maxY / 2 - 250 && y <= maxY / 2 + 250) {
            click_count++;
        if (click_count === 7 && firstLoaded) {
            // Remove the current sheep model
            scene.removeChild(model); // Assuming "sheepModel" refers to the current sheep model
            try {
                let audio = new Audio('baa.mp3'); 
                audio.play();
                await runSleepFunction(1);

                scene.addChild(sheep2);
                sheep2Transform.scale = [5,5,5];
                coins_count = coins_count + Math.floor(Math.random() * 10 + 1);
                updateCoins();

            } catch (error) {
                console.error('Error loading model:', error);
            }
            click_count = 0;
            firstLoaded = false;
        }
        else if (click_count === 7 && x >= maxX / 2 - 350 && x <= maxX / 2 + 350 && y >= maxY / 2 - 250 && y <= maxY / 2 + 250){
                click_count++;
            // Remove the current sheep model
            scene.removeChild(sheep2); // Assuming "sheepModel" refers to the current sheep model
            try {
                let audio = new Audio('baa.mp3'); 
                audio.play();
                await runSleepFunction(1);

                scene.addChild(model);
                sheepTransform.scale = [5,5,5];
                coins_count = coins_count + Math.floor(Math.random() * 10 + 1);
                updateCoins();

            } catch (error) {
                console.error('Error loading model:', error);
            }
            click_count = 0;
            firstLoaded = true;
        }
        try {
            const newModelLoader = new GLTFLoader();
            await newModelLoader.load('common/models/wool3.gltf');

            const newModelScene = newModelLoader.loadScene(newModelLoader.defaultScene);
            const newModel = newModelScene.find(node => node.getComponentOfType(Model));
            const transform = newModel.getComponentOfType(Transform);
            
 
            if (firstLoaded) {
                sheepTransform.scale = sheepTransform.scale.map(value => value * 0.95);
            }
            else{
                sheep2Transform.scale = sheep2Transform.scale.map(value => value * 0.95);
            } 
            
            newModel.components[1].primitives[0].material.baseFactor = current_color
            var randomX = (Math.random()) * 3 + 7; // Adjust these ranges as needed
            var randomY = (Math.random()) * 3
            var randomZ = (Math.random()) * 8;

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
            transform.scale = [0.6,0.6,0.6];
            transform.translation = [randomX, randomY + 7, 15 + randomZ - 60]; // Starts higher up

            // Add the new model to the scene
            scene.addChild(newModel);

            // Falling animation towards a certain Y position
            const targetY = 2; // Adjust the target Y position
            const fallingSpeed = 0.05; // Adjust falling speed as needed
        
            const fallInterval = setInterval(() => {
                
                if (transform.translation[1] > targetY || transform.translation[1] > sheepTransform[1]-10) {
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
    camera.components[2].update(time,dt);
    camera.components[3].update(time,dt);
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
    translation: [0, 40, 0],
}));
light.addComponent(new Light({
    ambient: 0.5,
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
        sheepMaterial2.baseFactor = current_color;
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
        sheepMaterial2.baseFactor = current_color;
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
        sheepMaterial2.baseFactor = current_color;
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
        sheepMaterial2.baseFactor = current_color;
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
        sheepMaterial2.baseFactor = current_color;
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
        sheepMaterial2.baseFactor = current_color;
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

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Usage example:
async function runSleepFunction(time) {
  await sleep(time * 1000);
}

var maxX, maxY;

document.addEventListener('mousemove', (e) => {
  const cursorImage = document.getElementById('cursor-image');
  maxX = window.innerWidth - cursorImage.clientWidth; // Maximum X-coordinate
  maxY = window.innerHeight - cursorImage.clientHeight; // Maximum Y-coordinate

  // Calculate new position considering the bounds
  let posX = e.clientX;
  let posY = e.clientY;

  x = posX;
  y = posY;
  
  // Check and adjust X-coordinate to stay within bounds
  if (posX > maxX) {
    posX = maxX;
  }
  if (posX < 0) {
    posX = 0;
  }
  
  // Check and adjust Y-coordinate to stay within bounds
  if (posY > maxY) {
    posY = maxY;
  }
  if (posY < 0) {
    posY = 0;
  }
  
  cursorImage.style.left = `${posX}px`; // Set the new X-coordinate
  cursorImage.style.top = `${posY}px`; // Set the new Y-coordinate
});
