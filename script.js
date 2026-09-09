
const ITEMS = [
{id:"white-hoodie",name:"White English Hoodie",cat:"tops",price:800,art:"🤍",group:"recommended"},
{id:"headphones",name:"Headphones (Black)",cat:"accessories",price:500,art:"🎧",group:"recommended"},
{id:"school-bag",name:"School Backpack",cat:"bags",price:600,art:"🎒",group:"recommended"},
{id:"white-sneakers",name:"White Sneakers",cat:"shoes",price:700,art:"👟",group:"recommended"},
{id:"black-cap",name:"Cap (Black)",cat:"accessories",price:400,art:"🧢",group:"recommended"},
{id:"white-shirt",name:"White T-Shirt",cat:"tops",price:0,art:"👕",group:"basic",starter:true},
{id:"black-shirt",name:"Black T-Shirt",cat:"tops",price:300,art:"👕",group:"basic"},
{id:"gray-hoodie",name:"Gray Hoodie",cat:"tops",price:500,art:"🧥",group:"basic"},
{id:"blue-jeans",name:"Jeans (Blue)",cat:"bottoms",price:400,art:"👖",group:"basic"},
{id:"black-joggers",name:"Jogger Pants (Black)",cat:"bottoms",price:400,art:"👖",group:"basic"},
{id:"navy-shorts",name:"Shorts (Navy)",cat:"bottoms",price:300,art:"🩳",group:"basic"},
{id:"starter-pants",name:"Starter Pants",cat:"bottoms",price:0,art:"👖",group:"basic",starter:true},
{id:"starter-shoes",name:"Starter Sneakers",cat:"shoes",price:0,art:"👟",group:"basic",starter:true},
{id:"shiba",name:"Shiba Pet",cat:"pets",price:1000,art:"🐕",group:"recommended"},
{id:"school-bg",name:"School Background",cat:"backgrounds",price:700,art:"🏫",group:"recommended"}
];

let state = JSON.parse(localStorage.getItem("moeShopState") || "null") || {
  coins:1250,
  owned:["white-shirt","starter-pants","starter-shoes"],
  equipped:{tops:"white-shirt",bottoms:"starter-pants",shoes:"starter-shoes"}
};

function save(){localStorage.setItem("moeShopState",JSON.stringify(state))}
function coins(){document.querySelectorAll("#topCoins,#sideCoins").forEach(e=>e.textContent=state.coins)}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1600)}

function renderCard(item){
  const owned=state.owned.includes(item.id);
  const equipped=state.equipped[item.cat]===item.id;
  const price = item.price===0 ? "Starter" : `🪙 ${item.price}`;
  let button = `<button class="action" data-id="${item.id}">Buy</button>`;
  if(equipped) button=`<button class="action equipped" disabled>Equipped</button>`;
  else if(owned) button=`<button class="action ownedbtn" data-id="${item.id}">Equip</button>`;
  return `<article class="item-card" data-cat="${item.cat}">
    <div class="item-art">${item.art}</div>
    <h3>${item.name}</h3>
    <div class="price ${owned?'owned':''}">${price}</div>
    ${button}
  </article>`;
}

function render(cat="all"){
  const rec=ITEMS.filter(x=>x.group==="recommended"&&(cat==="all"||x.cat===cat));
  const bas=ITEMS.filter(x=>x.group==="basic"&&(cat==="all"||x.cat===cat));
  document.getElementById("recommended").innerHTML=rec.length?rec.map(renderCard).join(""):`<p class="muted">No items in this category yet.</p>`;
  document.getElementById("basic").innerHTML=bas.length?bas.map(renderCard).join(""):`<p class="muted">No basic items in this category yet.</p>`;
  document.querySelectorAll(".action[data-id]").forEach(b=>b.onclick=()=>handleItem(b.dataset.id));
  coins();
}

function handleItem(id){
  const item=ITEMS.find(x=>x.id===id);
  if(!item) return;
  if(state.owned.includes(id)){
    state.equipped[item.cat]=id;
    save(); render(currentCat());
    toast(`${item.name} equipped!`);
    return;
  }
  if(state.coins<item.price){toast("Not enough coins yet!");return}
  state.coins-=item.price;
  state.owned.push(id);
  state.equipped[item.cat]=id;
  save(); render(currentCat());
  toast(`Bought ${item.name}!`);
}

function currentCat(){
  return document.querySelector(".tab.active")?.dataset.cat || "all";
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");render(b.dataset.cat);
});

const modal=document.getElementById("inventoryModal");
document.getElementById("inventoryBtn").onclick=()=>{
  const owned=ITEMS.filter(x=>state.owned.includes(x.id));
  document.getElementById("inventoryGrid").innerHTML=owned.map(x=>`<div class="inv-item"><div style="font-size:52px">${x.art}</div><b>${x.name}</b></div>`).join("");
  modal.classList.remove("hidden");
}
document.getElementById("closeInventory").onclick=()=>modal.classList.add("hidden");
modal.onclick=e=>{if(e.target===modal)modal.classList.add("hidden")};

render();
