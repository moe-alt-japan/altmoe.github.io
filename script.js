const items = [
  {id:'white-tshirt',name:'White T-Shirt',cat:'clothes',price:100,img:'assets/white-tshirt.png',rarity:'COMMON'},
  {id:'black-hoodie',name:'Black Hoodie',cat:'clothes',price:250,img:'assets/black-hoodie.png',rarity:'COMMON'},
  {id:'school-uniform',name:'School Uniform',cat:'clothes',price:400,img:'assets/school-uniform.png',rarity:'RARE'},
  {id:'jacket',name:'Jacket',cat:'clothes',price:350,img:'assets/jacket.png',rarity:'COMMON'},
  {id:'sweater',name:'Sweater',cat:'clothes',price:300,img:'assets/sweater.png',rarity:'COMMON'},
  {id:'parka',name:'Parka',cat:'clothes',price:350,img:'assets/parka.png',rarity:'COMMON'},
  {id:'sports-jersey',name:'Sports Jersey',cat:'clothes',price:300,img:'assets/sports-jersey.png',rarity:'RARE'},
  {id:'casual-shirt',name:'Casual Shirt',cat:'clothes',price:250,img:'assets/casual-shirt.png',rarity:'COMMON'},
  {id:'english-hoodie',name:'English Hoodie',cat:'clothes',price:400,img:'assets/english-hoodie.png',rarity:'EPIC'},
  {id:'cape',name:'Cape',cat:'clothes',price:800,img:'assets/cape.png',rarity:'RARE'},
  {id:'cap',name:'Blue Cap',cat:'hats',price:150,emoji:'🧢',rarity:'COMMON'},
  {id:'crown',name:'Golden Crown',cat:'hats',price:1500,emoji:'👑',rarity:'LEGENDARY'},
  {id:'glasses',name:'Cool Glasses',cat:'accessories',price:200,emoji:'👓',rarity:'COMMON'},
  {id:'headphones',name:'Headphones',cat:'accessories',price:350,emoji:'🎧',rarity:'RARE'},
  {id:'dog',name:'Study Buddy Dog',cat:'pets',price:500,emoji:'🐕',rarity:'RARE'},
  {id:'penguin',name:'English Penguin',cat:'pets',price:750,emoji:'🐧',rarity:'EPIC'},
  {id:'classroom',name:'Classroom',cat:'backgrounds',price:0,emoji:'🏫',rarity:'FREE'},
  {id:'space',name:'Space World',cat:'backgrounds',price:800,emoji:'🌌',rarity:'EPIC'}
];

let state = JSON.parse(localStorage.getItem('englishShopPreview')) || {coins:620,xp:3450,level:12,owned:[],look:'Default'};
let category='clothes';
const $=s=>document.querySelector(s);

function save(){ localStorage.setItem('englishShopPreview',JSON.stringify(state)); }
function toast(msg){ const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700); }
function sync(){ $('#coins').textContent=state.coins;$('#xp').textContent=state.xp;$('#level').textContent=state.level;$('#ownedCount').textContent=state.owned.length;$('#tryOnBadge').textContent='Preview outfit: '+state.look; }
function render(){
 const grid=$('#shopGrid'); grid.innerHTML='';
 items.filter(i=>i.cat===category).forEach(item=>{
   const owned=state.owned.includes(item.id) || item.price===0;
   const card=document.createElement('div'); card.className='item-card';
   card.innerHTML=`${item.img?`<img src="${item.img}" alt="${item.name}">`:`<div class="fake-icon">${item.emoji}</div>`}
     <div class="rarity">${item.rarity}</div><h3>${item.name}</h3>
     <div class="price">${item.price===0?'FREE':'🪙 '+item.price}</div>
     <div class="actions"><button class="try">Try On</button><button class="buy ${owned?'owned':''}" ${owned?'disabled':''}>${owned?'Owned':'Buy'}</button></div>`;
   card.querySelector('.try').onclick=()=>{ state.look=item.name; sync(); toast(`Trying on ${item.name}`); };
   card.querySelector('.buy').onclick=()=>buy(item);
   grid.appendChild(card);
 });
}
function buy(item){
 if(state.owned.includes(item.id)||item.price===0)return;
 if(state.coins<item.price){toast('Not enough coins yet!');return;}
 state.coins-=item.price;state.owned.push(item.id);save();sync();render();toast(`🎉 ${item.name} added to My Items!`);
}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#tabs button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');category=b.dataset.cat;render();});
$('#inventoryBtn').onclick=()=>{const box=$('#inventoryList');box.innerHTML='';const owned=items.filter(i=>state.owned.includes(i.id)||i.price===0);if(!owned.length){box.innerHTML='<p>No purchased items yet. Buy something from the shop!</p>';}else owned.forEach(i=>{const d=document.createElement('div');d.className='inventory-item';d.innerHTML=`<div style="font-size:42px">${i.emoji||'👕'}</div><b>${i.name}</b><br><button>Wear / Use</button>`;d.querySelector('button').onclick=()=>{state.look=i.name;save();sync();$('#inventoryModal').classList.add('hidden');toast(`${i.name} equipped!`)};box.appendChild(d)});$('#inventoryModal').classList.remove('hidden');};
$('#closeModal').onclick=()=>$('#inventoryModal').classList.add('hidden');
$('#inventoryModal').onclick=e=>{if(e.target.id==='inventoryModal')e.currentTarget.classList.add('hidden')};
$('#saveBtn').onclick=()=>{save();toast('Avatar preview saved on this browser.');};
$('#resetLookBtn').onclick=()=>{state.look='Default';save();sync();toast('Look reset.');};
$('#randomBtn').onclick=()=>{const available=items.filter(i=>state.owned.includes(i.id)||i.price===0);const pick=available[Math.floor(Math.random()*available.length)]||{name:'Default'};state.look=pick.name;sync();toast(`Random look: ${state.look}`);};
sync();render();
