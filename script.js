import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// -------------------------
// 1) START THE 3D VIEWER FIRST
// -------------------------
const viewer = document.getElementById('viewer');
const loading = document.getElementById('loading');
const loadDetail = document.getElementById('loadDetail');
const errorBox = document.getElementById('errorBox');
const statusCard = document.getElementById('modelStatus');
const MODEL_URL = './moe-beginner.vrm?v=7';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfefff);
scene.fog = new THREE.Fog(0xcfefff, 8, 16);

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = 1.25;
controls.maxDistance = 5.5;
controls.minPolarAngle = 0.15;
controls.maxPolarAngle = Math.PI * 0.92;

scene.add(new THREE.HemisphereLight(0xffffff, 0x7898ad, 2.15));
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3.5,5,4); key.castShadow = true; scene.add(key);
const fill = new THREE.DirectionalLight(0xd5edff, 1.4); fill.position.set(-4,3,2); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.75); rim.position.set(0,4,-4); scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(1.22,72), new THREE.MeshStandardMaterial({color:0xe2e9ed,roughness:0.8,metalness:0.02}));
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
const ring = new THREE.Mesh(new THREE.RingGeometry(1.20,1.30,72), new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.72,side:THREE.DoubleSide}));
ring.rotation.x = -Math.PI/2; ring.position.y = 0.006; scene.add(ring);

let currentVRM = null;
let modelHeight = 1.8;

function setStatus(kind,title,detail){
  statusCard.classList.remove('ready','error-state');
  if(kind==='ready') statusCard.classList.add('ready');
  if(kind==='error') statusCard.classList.add('error-state');
  statusCard.querySelector('strong').textContent=title;
  statusCard.querySelector('small').textContent=detail;
}
function fitModel(model){
  model.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(model), size=box.getSize(new THREE.Vector3());
  if(size.y>0){ model.scale.multiplyScalar(1.82/size.y); model.updateMatrixWorld(true); }
  box=new THREE.Box3().setFromObject(model); size=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  model.position.x-=center.x; model.position.z-=center.z; model.position.y-=box.min.y;
  model.updateMatrixWorld(true); modelHeight=size.y; setView('front',false);
}
function setView(view,updateButtons=true){
  const d=Math.max(2.7,modelHeight*1.72), y=Math.max(1.05,modelHeight*.58), ty=Math.max(.92,modelHeight*.52);
  controls.target.set(0,ty,0);
  if(view==='front') camera.position.set(0,y,d);
  if(view==='back') camera.position.set(0,y,-d);
  if(view==='left') camera.position.set(-d,y,0);
  if(view==='right') camera.position.set(d,y,0);
  camera.lookAt(controls.target); controls.update();
  if(updateButtons) document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view && b.classList.contains('view-btn')));
}
function showModelError(err){
  console.error(err);
  loading.classList.add('hidden');
  setStatus('error','Model could not load','Make sure assets/moe-beginner.vrm is uploaded.');
  errorBox.textContent='The local VRM could not load. Upload the whole assets folder together with index.html, style.css, and script.js.';
  errorBox.classList.remove('hidden');
}

const loader = new GLTFLoader();
loader.register(parser => new VRMLoaderPlugin(parser));
async function installVRMFromArrayBuffer(buffer, sourceLabel='local VRM') {
  return new Promise((resolve, reject) => {
    loader.parse(buffer, '', gltf => {
      try {
        if (currentVRM) {
          scene.remove(currentVRM.scene);
          VRMUtils.deepDispose(currentVRM.scene);
        }
        currentVRM = gltf.userData.vrm;
        if (!currentVRM) throw new Error('The file opened, but it does not contain VRM data.');
        VRMUtils.rotateVRM0(currentVRM);
        const model = currentVRM.scene;
        scene.add(model);
        model.traverse(obj => { if (obj.isMesh) { obj.castShadow=true; obj.receiveShadow=true; obj.frustumCulled=false; } });
        fitModel(model);
        loading.classList.add('hidden');
        errorBox.classList.add('hidden');
        setStatus('ready','Beginner avatar loaded!',`${sourceLabel} is working.`);
        resolve();
      } catch (e) { reject(e); }
    }, reject);
  });
}

async function loadLocalModel() {
  try {
    loadDetail.textContent = 'Checking moe-beginner.vrm…';
    const response = await fetch(MODEL_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const total = Number(response.headers.get('content-length')) || 0;
    let buffer;
    if (response.body && total) {
      const reader=response.body.getReader(); const chunks=[]; let received=0;
      while(true){const {done,value}=await reader.read(); if(done)break; chunks.push(value); received+=value.length; loadDetail.textContent=`${Math.round(received/total*100)}% loaded • root VRM`;}
      const all=new Uint8Array(received); let pos=0; for(const c of chunks){all.set(c,pos);pos+=c.length;} buffer=all.buffer;
    } else buffer=await response.arrayBuffer();
    await installVRMFromArrayBuffer(buffer,'moe-beginner.vrm');
  } catch (err) {
    console.error(err);
    loading.classList.add('hidden');
    setStatus('error','Model could not load',String(err.message || err));
    errorBox.innerHTML = `Could not open <b>moe-beginner.vrm</b> from GitHub Pages.<br><small>${String(err.message || err)}</small><br><button id="chooseVrmBtn" class="primary-btn" style="margin-top:8px">Choose VRM from this device</button>`;
    errorBox.classList.remove('hidden');
    setTimeout(()=>{ const b=document.getElementById('chooseVrmBtn'); if(b) b.onclick=()=>document.getElementById('vrmPicker').click(); },0);
  }
}

document.getElementById('vrmPicker').addEventListener('change', async (e) => {
  const file=e.target.files?.[0]; if(!file)return;
  try { loading.classList.remove('hidden'); loadDetail.textContent=`Opening ${file.name}…`; await installVRMFromArrayBuffer(await file.arrayBuffer(), file.name); }
  catch(err){ showModelError(err); }
});

loadLocalModel();

document.getElementById('resetBtn').addEventListener('click',()=>setView('front'));
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
function resize(){const w=Math.max(1,viewer.clientWidth),h=Math.max(1,viewer.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize); resize();
const clock=new THREE.Clock();
renderer.setAnimationLoop(()=>{const delta=Math.min(clock.getDelta(),.05);if(currentVRM)currentVRM.update(delta);controls.update();renderer.render(scene,camera);});

// -------------------------
// 2) SHOP SYSTEM (isolated from the model loader)
// -------------------------
const DEFAULT = {coins:1250, owned:['starter_top','starter_bottom','starter_shoes'], equipped:{top:'starter_top',bottom:'starter_bottom',shoes:'starter_shoes',background:'bg_sky',accessories:[]}};
const ITEMS = [
  {id:'starter_top',cat:'Tops',name:'Starter T-Shirt',icon:'👕',price:0,desc:'Your basic Level 1 top.'},
  {id:'blue_hoodie',cat:'Tops',name:'Blue Hoodie',icon:'🧥',price:350,desc:'A cool reward for regular practice.'},
  {id:'english_hoodie',cat:'Tops',name:'English Hoodie',icon:'🎽',price:600,desc:'Premium English learner hoodie.'},
  {id:'starter_bottom',cat:'Bottoms',name:'Starter Pants',icon:'👖',price:0,desc:'Simple beginner pants.'},
  {id:'cargo_pants',cat:'Bottoms',name:'Cargo Pants',icon:'👖',price:400,desc:'Street-style cargo pants.'},
  {id:'starter_shoes',cat:'Shoes',name:'Starter Sneakers',icon:'👟',price:0,desc:'Basic everyday sneakers.'},
  {id:'runner_shoes',cat:'Shoes',name:'Runner Sneakers',icon:'👟',price:300,desc:'Sporty reward sneakers.'},
  {id:'headphones',cat:'Accessories',name:'Headphones',icon:'🎧',price:450,desc:'Study-music style accessory.'},
  {id:'backpack',cat:'Accessories',name:'Backpack',icon:'🎒',price:500,desc:'Ready for English class.'},
  {id:'bg_sky',cat:'Backgrounds',name:'Sky Classroom',icon:'🌤️',price:0,desc:'Bright beginner background.'},
  {id:'bg_sunset',cat:'Backgrounds',name:'Sunset',icon:'🌅',price:250,desc:'Warm after-school atmosphere.'},
  {id:'bg_night',cat:'Backgrounds',name:'Night Study',icon:'🌙',price:300,desc:'A calm night-study scene.'}
];
const SLOT={Tops:'top',Bottoms:'bottom',Shoes:'shoes',Backgrounds:'background'};
let state, activeCat='Tops', mode='shop';
try {
  const raw=localStorage.getItem('moeStep3v2');
  const saved=raw?JSON.parse(raw):{};
  state={coins:Number.isFinite(saved.coins)?saved.coins:DEFAULT.coins,owned:Array.from(new Set([...(saved.owned||[]),...DEFAULT.owned])),equipped:{...DEFAULT.equipped,...(saved.equipped||{})}};
  if(!Array.isArray(state.equipped.accessories)) state.equipped.accessories=[];
} catch(e){ state=JSON.parse(JSON.stringify(DEFAULT)); }

const getItem=id=>ITEMS.find(x=>x.id===id);
const fmt=n=>Number(n).toLocaleString();
function saveState(){try{localStorage.setItem('moeStep3v2',JSON.stringify(state));}catch(e){} updateShopUI();}
function isEquipped(i){return i.cat==='Accessories'?state.equipped.accessories.includes(i.id):state.equipped[SLOT[i.cat]]===i.id;}
function toast(text){const e=document.getElementById('toast');e.textContent=text;e.classList.remove('hidden');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.add('hidden'),1600);}
function applyBackground(){
  let c=0xcfefff;
  if(state.equipped.background==='bg_sunset') c=0xffdfbd;
  if(state.equipped.background==='bg_night') c=0x193453;
  scene.background=new THREE.Color(c); scene.fog.color=new THREE.Color(c);
}
function updateShopUI(){
  document.querySelectorAll('.coinCount').forEach(e=>e.textContent=fmt(state.coins));
  document.getElementById('ownedCount').textContent=state.owned.length;
  const ids=[state.equipped.top,state.equipped.bottom,state.equipped.shoes,state.equipped.background,...state.equipped.accessories].filter(Boolean);
  document.getElementById('equippedList').innerHTML=ids.map(id=>{const i=getItem(id);return i?`<div class="equip-row"><span class="equip-icon">${i.icon}</span><div><strong>${i.name}</strong><small>${i.cat}</small></div></div>`:'';}).join('');
  applyBackground();
  if(!document.getElementById('overlay').classList.contains('hidden')) renderItems();
}
function openModal(which){mode=which;document.getElementById('overlay').classList.remove('hidden');document.getElementById('modalEyebrow').textContent=which==='shop'?'REWARD SHOP':'YOUR COLLECTION';document.getElementById('modalTitle').textContent=which==='shop'?'Shop':'Inventory';renderTabs();renderItems();}
function renderTabs(){const cats=['Tops','Bottoms','Shoes','Accessories','Backgrounds'];document.getElementById('categoryTabs').innerHTML=cats.map(c=>`<button class="tab ${c===activeCat?'active':''}" data-cat="${c}">${c}</button>`).join('');document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{activeCat=b.dataset.cat;renderTabs();renderItems();});}
function renderItems(){
  let arr=ITEMS.filter(i=>i.cat===activeCat); if(mode==='inventory') arr=arr.filter(i=>state.owned.includes(i.id));
  const grid=document.getElementById('itemGrid');
  if(!arr.length){grid.innerHTML='<p>Your collection is empty in this category.</p>';return;}
  grid.innerHTML=arr.map(i=>{const owned=state.owned.includes(i.id),eq=isEquipped(i),disabled=eq||(!owned&&state.coins<i.price);const label=owned?(eq?'Equipped':'Equip'):`🪙 ${fmt(i.price)}`;return `<article class="item-card ${eq?'equipped':''}">${owned?'<span class="owned-tag">OWNED</span>':''}<div class="item-art">${i.icon}</div><h3>${i.name}</h3><p>${i.desc}</p><div class="item-meta"><span class="price">${owned?'✓ In collection':'🪙 '+fmt(i.price)}</span><button class="buy-btn ${owned?'equip':''}" data-item="${i.id}" ${disabled?'disabled':''}>${label}</button></div></article>`;}).join('');
  document.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>act(getItem(b.dataset.item)));
}
function act(i){
  const owned=state.owned.includes(i.id);
  if(!owned){if(state.coins<i.price)return;state.coins-=i.price;state.owned.push(i.id);toast(`${i.name} purchased!`);}
  if(i.cat==='Accessories'){if(!state.equipped.accessories.includes(i.id))state.equipped.accessories.push(i.id);} else state.equipped[SLOT[i.cat]]=i.id;
  saveState(); toast(`${i.name} equipped!`);
}

document.getElementById('openShop').onclick=()=>openModal('shop');
document.getElementById('shopNav').onclick=()=>openModal('shop');
document.getElementById('openInventory').onclick=()=>openModal('inventory');
document.getElementById('inventoryNav').onclick=()=>openModal('inventory');
document.getElementById('closeModal').onclick=()=>document.getElementById('overlay').classList.add('hidden');
document.getElementById('overlay').onclick=e=>{if(e.target.id==='overlay')e.currentTarget.classList.add('hidden');};
updateShopUI();
