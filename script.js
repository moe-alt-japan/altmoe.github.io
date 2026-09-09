
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

const viewer = document.getElementById('viewer');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcbeeff);

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 1.25, 3.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.05, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.4;
controls.maxDistance = 5.5;
controls.maxPolarAngle = Math.PI * 0.92;

scene.add(new THREE.HemisphereLight(0xffffff, 0x7e9aaf, 2.2));
const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(2.5, 4, 3);
key.castShadow = true;
scene.add(key);

const rim = new THREE.DirectionalLight(0xb9d9ff, 1.5);
rim.position.set(-3, 2, -2);
scene.add(rim);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(1.25, 64),
  new THREE.MeshStandardMaterial({ color: 0xd8dde5, roughness: .75, metalness: .05 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

let currentVRM = null;

// Temporary VRoid anime sample model for proof-of-concept.
// Later, replace this URL with our own custom Moe VRM/GLB asset.
const MODEL_URL =
  'https://github.com/norio/vrm-game-starter/raw/refs/heads/main/src/assets/sample.vrm';

const loader = new GLTFLoader();
loader.register(parser => new VRMLoaderPlugin(parser));

loader.load(
  MODEL_URL,
  gltf => {
    currentVRM = gltf.userData.vrm;
    const model = currentVRM.scene;

    // VRM 0.x models may face +Z instead of -Z depending on exporter.
    model.rotation.y = Math.PI;
    scene.add(model);

    model.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // Fit model vertically and center it.
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y;

    const targetHeight = 1.85;
    if (size.y > 0) {
      const s = targetHeight / size.y;
      model.scale.setScalar(s);
    }

    controls.target.set(0, 1.02, 0);
    camera.position.set(0, 1.18, 3.25);
    controls.update();

    loading.classList.add('hidden');
  },
  progress => {
    if (progress.total) {
      const pct = Math.round(progress.loaded / progress.total * 100);
      loading.querySelector('span').textContent = `${pct}% loaded`;
    }
  },
  err => {
    console.error(err);
    loading.classList.add('hidden');
    errorBox.textContent =
      'The 3D model could not load. Please check your internet connection or GitHub Pages settings.';
    errorBox.classList.remove('hidden');
  }
);

document.getElementById('resetBtn').addEventListener('click', () => {
  camera.position.set(0, 1.18, 3.25);
  controls.target.set(0, 1.02, 0);
  controls.update();
});

function resize() {
  const w = viewer.clientWidth;
  const h = viewer.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  if (currentVRM) currentVRM.update(delta);
  controls.update();
  renderer.render(scene, camera);
});
