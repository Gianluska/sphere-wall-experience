import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 30, 40);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  200
);
camera.position.z = 30;
scene.add(camera);

/**
 * Light
 */
const rectLight = new THREE.RectAreaLight("#1a237e", 1, 30, 30);
rectLight.position.z = -1;
rectLight.rotateY(Math.PI);
scene.add(rectLight);


const mouseLight = new THREE.RectAreaLight("#1a237e", 6, 5, 5);
mouseLight.position.set(0, 0, -1);
mouseLight.rotateY(Math.PI);
scene.add(mouseLight);

/**
 * Sphere
 */

const sphereGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: "#1a237e" });

for (let i = -10; i <= 10; i++) {
  for (let j = -10; j <= 10; j++) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = j * 4;
    sphere.position.y = i * 4;
    scene.add(sphere);
  }
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Bloom Post Processing
 */

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 1.5;
bloomPass.radius = 0;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

let mouseX = 0;
let mouseY = 0;

const onDocumentMouseMove = (event) => {
  mouseX = (event.clientX - sizes.width / 2) / 100;
  mouseY = (event.clientY - sizes.height / 2) / 100;
};

document.addEventListener("mousemove", onDocumentMouseMove);

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;

  rectLight.width = Math.min(elapsedTime * 2, sizes.width / 2);
  rectLight.height = Math.min(elapsedTime * 2, sizes.height / 2);
  rectLight.intensity = Math.max(Math.sin(elapsedTime) * 2, 0.8);

  camera.position.x = -mouseX;
  camera.position.y = -mouseY;
  mouseLight.position.y = -mouseY * 5;
  mouseLight.position.x = mouseX * 5;
  camera.lookAt(0, 0, 0);

  // Render
  renderer.render(scene, camera);

  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
