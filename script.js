const items=[
{id:'white',name:'White T-Shirt',cat:'clothes',price:100,rarity:'COMMON'},
{id:'blackhoodie',name:'Black Hoodie',cat:'clothes',price:250,rarity:'COMMON'},
{id:'uniform',name:'School Uniform',cat:'clothes',price:400,rarity:'RARE'},
{id:'jacket',name:'Blue Jacket',cat:'clothes',price:350,rarity:'COMMON'},
{id:'sweater',name:'Green Sweater',cat:'clothes',price:300,rarity:'COMMON'},
{id:'parka',name:'Yellow Parka',cat:'clothes',price:350,rarity:'RARE'},
{id:'jersey',name:'Sports Jersey',cat:'clothes',price:300,rarity:'RARE'},
{id:'englishhoodie',name:'English Hoodie',cat:'clothes',price:400,rarity:'EPIC'},
{id:'cap',name:'Blue Cap',cat:'hats',price:150,rarity:'COMMON'},
{id:'crown',name:'Golden Crown',cat:'hats',price:1500,rarity:'LEGENDARY'},
{id:'catcap',name:'Cat-Ear Hat',cat:'hats',price:450,rarity:'EPIC'},
{id:'glasses',name:'Cool Glasses',cat:'accessories',price:200,rarity:'COMMON'},
{id:'headphones',name:'Headphones',cat:'accessories',price:350,rarity:'RARE'},
{id:'bowtie',name:'Bow Tie',cat:'accessories',price:180,rarity:'COMMON'},
{id:'dog',name:'Study Buddy Dog',cat:'pets',price:500,rarity:'RARE',emoji:'🐶'},
{id:'penguin',name:'English Penguin',cat:'pets',price:750,rarity:'EPIC',emoji:'🐧'},
{id:'cat',name:'Library Cat',cat:'pets',price:650,rarity:'RARE',emoji:'🐱'},
{id:'classroom',name:'Classroom',cat:'backgrounds',price:0,rarity:'FREE',emoji:'🏫'},
{id:'park',name:'Sunny Park',cat:'backgrounds',price:300,rarity:'COMMON',emoji:'🌳'},
{id:'space',name:'Space World',cat:'backgrounds',price:800,rarity:'EPIC',emoji:'🌌'}
];

const initial={coins:620,xp:3450,level:12,owned:[],equipped:{clothes:'white',hats:null,accessories:null,pets:null,backgrounds:'classroom'}};
let state=JSON.parse(localStorage.getItem('englishShopV2')||'null')||structuredClone(initial);
let category='clothes';
const $=s=>document.querySelector(s);
const outfitLayer=$('#outfitLayer'),hatLayer=$('#hatLayer'),accessoryLayer=$('#accessoryLayer');

function save(){localStorage.setItem('englishShopV2',JSON.stringify(state))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
function owned(item){return item.price===0||state.owned.includes(item.id)}
function sync(){
 $('#coins').textContent=state.coins;$('#xp').textContent=state.xp;$('#level').textContent=state.level;$('#ownedCount').textContent=state.owned.length;
 applyLook();
}
function art(item){
 if(item.emoji)return `<div class="emoji-art">${item.emoji}</div>`;
 return `<svg viewBox="0 0 160 130" aria-hidden="true">${itemSvg(item.id,true)}</svg>`;
}
function itemSvg(id,card=false){
 const y=card?18:240;
 const common=(fill,accent='#fff')=>`
 <path d="M40 ${y+10} Q80 ${y-5} 120 ${y+10} L111 ${y+118} Q80 ${y+126} 49 ${y+118}Z" fill="${fill}" stroke="#47637f" stroke-width="3"/>
 <path d="M40 ${y+10} L20 ${y+35} L42 ${y+76} L57 ${y+50}Z" fill="${fill}" stroke="#47637f" stroke-width="3"/>
 <path d="M120 ${y+10} L140 ${y+35} L118 ${y+76} L103 ${y+50}Z" fill="${fill}" stroke="#47637f" stroke-width="3"/>
 <circle cx="80" cy="${y+32}" r="18" fill="${accent}" opacity=".75"/>`;
 switch(id){
  case'white':return common('#ffffff','#dce8f4')+`<text x="80" y="${y+40}" text-anchor="middle" font-size="19" font-weight="700" fill="#244b7d">E</text>`;
  case'blackhoodie':return `<path d="M39 ${y+25} Q80 ${y-5} 121 ${y+25} L112 ${y+120} Q80 ${y+128} 48 ${y+120}Z" fill="#252a35" stroke="#111827" stroke-width="3"/><path d="M56 ${y+15} Q80 ${y-10} 104 ${y+15} Q98 ${y+48} 80 ${y+50} Q62 ${y+48} 56 ${y+15}" fill="#343b48"/><path d="M39 ${y+25} L18 ${y+48} L40 ${y+94} L55 ${y+55}Z" fill="#252a35"/><path d="M121 ${y+25} L142 ${y+48} L120 ${y+94} L105 ${y+55}Z" fill="#252a35"/><rect x="60" y="${y+80}" width="40" height="22" rx="9" fill="#353b47"/>`;
  case'uniform':return common('#244b7d','#eef3f8')+`<path d="M55 ${y+10} L80 ${y+52} L105 ${y+10}" fill="#f6f7fb"/><path d="M80 ${y+48} l-11 28 h22z" fill="#c93e4a"/><path d="M60 ${y+82} h40" stroke="#d9b455" stroke-width="4"/>`;
  case'jacket':return common('#4f91d9','#dcecff')+`<path d="M80 ${y+12} V${y+116}" stroke="#f5f8ff" stroke-width="5"/><circle cx="72" cy="${y+62}" r="3" fill="#fff"/><circle cx="72" cy="${y+82}" r="3" fill="#fff"/>`;
  case'sweater':return common('#5cab77','#e8f4eb')+`<path d="M50 ${y+28} H110" stroke="#d8f0df" stroke-width="5"/><path d="M52 ${y+72} H108" stroke="#d8f0df" stroke-width="5"/>`;
  case'parka':return `<path d="M38 ${y+24} Q80 ${y-10} 122 ${y+24} L112 ${y+120} Q80 ${y+128} 48 ${y+120}Z" fill="#f3c74e" stroke="#a88218" stroke-width="3"/><path d="M55 ${y+18} Q80 ${y-16} 105 ${y+18}" fill="#e2b532" stroke="#a88218" stroke-width="3"/><path d="M80 ${y+20} V${y+120}" stroke="#fff2b5" stroke-width="4"/>`;
  case'jersey':return common('#e85d66','#fff')+`<text x="80" y="${y+70}" text-anchor="middle" font-size="31" font-weight="700" fill="#fff">7</text>`;
  case'englishhoodie':return `<path d="M39 ${y+25} Q80 ${y-5} 121 ${y+25} L112 ${y+120} Q80 ${y+128} 48 ${y+120}Z" fill="#6f5bd3" stroke="#483a9c" stroke-width="3"/><path d="M56 ${y+15} Q80 ${y-10} 104 ${y+15} Q98 ${y+48} 80 ${y+50} Q62 ${y+48} 56 ${y+15}" fill="#816ee0"/><text x="80" y="${y+85}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">ENGLISH</text>`;
  case'cap':return `<path d="M35 74 Q80 26 125 74 L118 92 H42Z" fill="#397bd1" stroke="#244b7d" stroke-width="4"/><path d="M80 91 Q130 84 145 100 Q108 105 80 101Z" fill="#2b67b4" stroke="#244b7d" stroke-width="3"/>`;
  case'crown':return `<path d="M34 96 L45 42 L69 71 L82 31 L98 71 L124 43 L128 96Z" fill="#ffd447" stroke="#9d7411" stroke-width="4"/><circle cx="82" cy="69" r="7" fill="#ef5f63"/><circle cx="53" cy="74" r="6" fill="#4e91da"/><circle cx="115" cy="74" r="6" fill="#55b976"/>`;
  case'catcap':return `<path d="M37 89 Q80 38 123 89 V104 H37Z" fill="#bc79d7" stroke="#75418b" stroke-width="4"/><path d="M45 61 L54 23 L74 57Z" fill="#bc79d7" stroke="#75418b" stroke-width="4"/><path d="M87 57 L108 22 L118 65Z" fill="#bc79d7" stroke="#75418b" stroke-width="4"/>`;
  case'glasses':return `<circle cx="52" cy="65" r="27" fill="none" stroke="#26394f" stroke-width="8"/><circle cx="108" cy="65" r="27" fill="none" stroke="#26394f" stroke-width="8"/><path d="M79 63 H81" stroke="#26394f" stroke-width="9"/><path d="M25 58 L8 48 M135 58 L152 48" stroke="#26394f" stroke-width="7"/>`;
  case'headphones':return `<path d="M28 69 Q28 20 80 20 Q132 20 132 69" fill="none" stroke="#355c89" stroke-width="12"/><rect x="18" y="61" width="29" height="49" rx="12" fill="#e85d66"/><rect x="113" y="61" width="29" height="49" rx="12" fill="#e85d66"/>`;
  case'bowtie':return `<path d="M80 65 L38 34 Q25 62 38 95Z" fill="#ef5d67" stroke="#9a3341" stroke-width="3"/><path d="M80 65 L122 34 Q135 62 122 95Z" fill="#ef5d67" stroke="#9a3341" stroke-width="3"/><circle cx="80" cy="65" r="14" fill="#b93d49"/>`;
 }
 return '';
}
function applyLook(){
 $('#baseTop').style.display=state.equipped.clothes==='white'?'block':'none';
 outfitLayer.innerHTML=state.equipped.clothes&&state.equipped.clothes!=='white'?itemSvg(state.equipped.clothes,false):'';
 hatLayer.innerHTML=state.equipped.hats?hatSvgOnAvatar(state.equipped.hats):'';
 accessoryLayer.innerHTML=state.equipped.accessories?accessorySvgOnAvatar(state.equipped.accessories):'';
 const pet=items.find(x=>x.id===state.equipped.pets);$('#petSlot').textContent=pet?.emoji||'';
 const scene=$('#avatarScene');
 scene.classList.remove('bg-classroom','bg-park','bg-space');
 scene.classList.add('bg-'+(state.equipped.backgrounds||'classroom'));
 const labels=Object.values(state.equipped).filter(Boolean).map(id=>items.find(x=>x.id===id)?.name).filter(Boolean);
 $('#equippedText').textContent='Using: '+(labels.join(' • ')||'Default');
}
function hatSvgOnAvatar(id){
 if(id==='cap')return `<g transform="translate(80 27) scale(.95)">${itemSvg('cap',true)}</g>`;
 if(id==='crown')return `<g transform="translate(79 10) scale(.85)">${itemSvg('crown',true)}</g>`;
 if(id==='catcap')return `<g transform="translate(79 18) scale(.85)">${itemSvg('catcap',true)}</g>`;
 return '';
}
function accessorySvgOnAvatar(id){
 if(id==='glasses')return `<g transform="translate(80 97) scale(.5)">${itemSvg('glasses',true)}</g>`;
 if(id==='headphones')return `<g transform="translate(80 83) scale(.66)">${itemSvg('headphones',true)}</g>`;
 if(id==='bowtie')return `<g transform="translate(120 211) scale(.5)">${itemSvg('bowtie',true)}</g>`;
 return '';
}
function render(){
 const grid=$('#shopGrid');grid.innerHTML='';
 items.filter(i=>i.cat===category).forEach(item=>{
  const isOwned=owned(item);
  const card=document.createElement('div');card.className='item-card';
  card.innerHTML=`<div class="item-art">${art(item)}</div><div class="rarity">${item.rarity}</div><h3>${item.name}</h3><div class="price">${item.price===0?'FREE':'🪙 '+item.price}</div><div class="actions"><button class="try">Try On</button><button class="buy ${isOwned?'owned':''}" ${isOwned?'disabled':''}>${isOwned?'Owned':'Buy'}</button></div>`;
  card.querySelector('.try').onclick=()=>equip(item);
  card.querySelector('.buy').onclick=()=>buy(item);
  grid.appendChild(card);
 });
}
function equip(item){
 state.equipped[item.cat]=item.id;applyLook();toast('Trying on '+item.name);
}
function buy(item){
 if(owned(item))return;
 if(state.coins<item.price){toast('Not enough coins yet!');return;}
 state.coins-=item.price;state.owned.push(item.id);save();sync();render();toast('🎉 '+item.name+' added to My Items!');
}
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#tabs button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');category=b.dataset.cat;render()};
$('#inventoryBtn').onclick=()=>{
 const box=$('#inventoryList');box.innerHTML='';
 const list=items.filter(owned);
 if(!list.length)box.innerHTML='<p>No items yet.</p>';
 list.forEach(item=>{const d=document.createElement('div');d.className='inventory-item';d.innerHTML=`<div class="mini">${art(item)}</div><b>${item.name}</b><br><button>Wear / Use</button>`;d.querySelector('button').onclick=()=>{equip(item);save();$('#inventoryModal').classList.add('hidden')};box.appendChild(d)});
 $('#inventoryModal').classList.remove('hidden');
};
$('#closeModal').onclick=()=>$('#inventoryModal').classList.add('hidden');
$('#inventoryModal').onclick=e=>{if(e.target.id==='inventoryModal')e.currentTarget.classList.add('hidden')};
$('#saveBtn').onclick=()=>{save();toast('Avatar saved on this browser.')};
$('#resetBtn').onclick=()=>{state.equipped=structuredClone(initial.equipped);save();sync();toast('Look reset.')};
$('#randomBtn').onclick=()=>{
 const cats=['clothes','hats','accessories','pets','backgrounds'];
 cats.forEach(cat=>{const choices=items.filter(i=>i.cat===cat&&owned(i)); if(choices.length){const pick=choices[Math.floor(Math.random()*choices.length)];state.equipped[cat]=pick.id}});
 sync();toast('Random look!');
};
sync();render();
