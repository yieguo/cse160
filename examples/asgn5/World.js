// World.js
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

let scene, camera, renderer, controls;
let generatedShapes = [];

let moveForward   = false;
let moveBackward  = false;
let moveLeft      = false;
let moveRight     = false;
let spaceDown     = false;
let shiftDown     = false;

const velocity  = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime    = performance.now();

function makeRandomShape() {
  const type = Math.floor(Math.random() * 3);
  const size = 0.5 + Math.random() * 2.5;
  let geometry;
  switch (type) {
    case 0:
      geometry = new THREE.BoxGeometry(size, size, size);
      break;
    case 1:
      geometry = new THREE.SphereGeometry(size / 2, 16, 16);
      break;
    case 2:
      geometry = new THREE.TetrahedronGeometry(size);
      break;
  }
  const color = Math.random() * 0xffffff;
  const material = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = (Math.random() * 60) - 30;
  mesh.position.y = 1 + Math.random() * 29;
  mesh.position.z = (Math.random() * 60) - 30;
  scene.add(mesh);
  generatedShapes.push(mesh);
}

function sendTextToHTML(text, htmlID) {
  const htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    return;
  }
  htmlElm.innerHTML = text;
}

function main() {
  scene = new THREE.Scene();

  const loader     = new THREE.TextureLoader();
  const skyTexture = loader.load("sky.jpg");
  const skySize    = 1000;
  const skyGeo     = new THREE.BoxGeometry(skySize, skySize, skySize);
  const skyMat     = new THREE.MeshBasicMaterial({
    map:  skyTexture,
    side: THREE.BackSide,
  });
  const skyBox = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyBox);

  const groundGeo  = new THREE.BoxGeometry(50, 1, 50);
  const groundMat  = new THREE.MeshPhongMaterial({ color: 0x228b22 });
  const ground     = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 5, 50);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.object);
  renderer.domElement.addEventListener("click", () => {
    controls.lock();
  });
  controls.addEventListener("lock", () => {
    console.log(
      "Pointer locked. Use WASD to move, mouse to look, Space/Shift to change height."
    );
  });
  controls.addEventListener("unlock", () => {
    console.log("Pointer unlocked. Click on canvas to resume.");
  });

  const onKeyDown = (event) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;
      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;
      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;
      case "Space":
        spaceDown = true;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        shiftDown = true;
        break;
    }
  };
  const onKeyUp = (event) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;
      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;
      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
      case "Space":
        spaceDown = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        shiftDown = false;
        break;
    }
  };
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup",   onKeyUp);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(-1, 2, 4);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const lightSphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const lightSphereMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const lightSphere    = new THREE.Mesh(lightSphereGeo, lightSphereMat);
  lightSphere.position.copy(directionalLight.position);
  scene.add(lightSphere);

  const slider = document.getElementById("intensitySlider");
  const initialIntensity = parseFloat(slider.value);
  directionalLight.intensity = initialIntensity;
  lightSphere.scale.set(initialIntensity, initialIntensity, initialIntensity);

  slider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    directionalLight.intensity = val;
    lightSphere.scale.set(val, val, val);
  });

  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  ambientLight.visible = false;
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 1);
  hemiLight.position.set(0, 50, 0);
  hemiLight.visible = false;
  scene.add(hemiLight);

  const btnDir  = document.getElementById("toggleDir");
  const btnAmb  = document.getElementById("toggleAmb");
  const btnHemi = document.getElementById("toggleHemi");

  btnDir.addEventListener("click", () => {
    directionalLight.visible = !directionalLight.visible;
  });
  btnAmb.addEventListener("click", () => {
    ambientLight.visible = !ambientLight.visible;
  });
  btnHemi.addEventListener("click", () => {
    hemiLight.visible = !hemiLight.visible;
  });

  const gridHelper = new THREE.GridHelper(50, 50);
  scene.add(gridHelper);

  const mtlLoader = new MTLLoader();
  mtlLoader.setPath("./");
  mtlLoader.load("Lowpoly_tree_sample.mtl", (mtl) => {
    mtl.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(mtl);
    objLoader.setPath("./");
    objLoader.load(
      "Lowpoly_tree_sample.obj",
      (object) => {
        object.position.set(0, 0, 0);
        object.scale.set(1, 1, 1);
        scene.add(object);
      },
      (xhr) => {
        console.log(`OBJ ${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`);
      },
      (error) => {
        console.error("Error loading OBJ:", error);
      }
    );
  });

  const inputCount   = document.getElementById("cubeCount");
  const btnGenerate  = document.getElementById("generateCubes");
  const btnClear     = document.getElementById("clearCubes");

  btnGenerate.addEventListener("click", () => {
    const n = parseInt(inputCount.value);
    if (!n || n < 1) return;
    for (let i = 0; i < n; i++) {
      makeRandomShape();
    }
  });

  btnClear.addEventListener("click", () => {
    generatedShapes.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    generatedShapes = [];
  });

  prevTime = performance.now();
  function render(nowMs) {
    const time  = nowMs;
    const delta = (time - prevTime) / 1000;

    const elapsed = time * 0.001;
    const speed   = 0.2;
    const angle   = elapsed * speed;

    const radius  = 30;
    const centerY = 20;
    const x       = radius * Math.cos(angle);
    const y       = centerY + radius * Math.sin(angle);
    const z       = 0;

    directionalLight.position.set(x, y, z);
    lightSphere.position.copy(directionalLight.position);

    if (controls.isLocked) {
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      direction.z = Number(moveForward)  - Number(moveBackward);
      direction.x = Number(moveRight)    - Number(moveLeft);
      direction.normalize();

      if (moveForward || moveBackward) {
        velocity.z -= direction.z * 400.0 * delta;
      }
      if (moveLeft || moveRight) {
        velocity.x -= direction.x * 400.0 * delta;
      }

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      const riseSpeed = 4.0;
      if (spaceDown) {
        controls.object.position.y += riseSpeed * delta * 2;
      }
      if (shiftDown) {
        controls.object.position.y -= riseSpeed * delta * 2;
      }

      if (controls.object.position.y < 0.1) {
        controls.object.position.y = 0.1;
      }
    }

    generatedShapes.forEach((mesh) => {
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
    });

    renderer.render(scene, camera);

    const msPerFrame = Math.max(time - prevTime, 0.0001);
    const fps        = 1000 / msPerFrame;
    sendTextToHTML(
      "ms: "  + msPerFrame.toFixed(1) +
      "  fps: " + Math.floor(fps),
      "numdot"
    );

    prevTime = time;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

main();
