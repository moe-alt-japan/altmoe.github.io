/* v1.5 Adventure Mode */

let adventureCoins=Number(localStorage.getItem("adventureCoins")||0);
let adventureProgress=JSON.parse(localStorage.getItem("adventureProgress")||'{"nh1":0,"nh2":0,"nh3":0}');
let activeWorld=null,battleWords=[],battleIndex=0,playerHealth=100,enemyHealth=100,battleIsBoss=false;
const ADVENTURE_WORLDS=[
  {id:"nh1",icon:"🏫",name:"School World",ja:"スクールワールド",desc:"Begin your journey with New Horizon 1.",className:"world-school",enemy:"Word Slime",boss:"School Dragon",bossIcon:"🐲"},
  {id:"nh2",icon:"🌳",name:"Forest World",ja:"フォレストワールド",desc:"Explore New Horizon 2 vocabulary.",className:"world-forest",enemy:"Forest Goblin",boss:"Forest Guardian",bossIcon:"🦖"},
  {id:"nh3",icon:"🏰",name:"Castle World",ja:"キャッスルワールド",desc:"Master New Horizon 3 and conquer the castle.",className:"world-castle",enemy:"Castle Knight",boss:"Vocabulary Dragon",bossIcon:"🐉"}
];
function saveAdventure(){localStorage.setItem("adventureCoins",adventureCoins);localStorage.setItem("adventureProgress",JSON.stringify(adventureProgress));}
function getWorldWords(id){const d=PORTAL_DATA[id];return Object.values(d.units||{}).flatMap(u=>u.words||[]).map(W);}
function renderAdventure(){
  $("coinValue").textContent=adventureCoins;
  $("worldGrid").innerHTML="";
  ADVENTURE_WORLDS.forEach((w,i)=>{
    const unlocked=i===0||adventureProgress[ADVENTURE_WORLDS[i-1].id]>=4;
    const card=document.createElement("button");card.className=`world-card ${w.className}${unlocked?"":" locked"}`;
    card.innerHTML=`<div class="world-icon">${unlocked?w.icon:"🔒"}</div><h2>${w.name}</h2><b>${w.ja}</b><p>${w.desc}</p><div class="world-progress"><i style="width:${Math.min(100,(adventureProgress[w.id]||0)/4*100)}%"></i></div><small>${adventureProgress[w.id]||0} / 4 stages cleared</small>`;
    if(unlocked)card.onclick=()=>openAdventureWorld(w.id);$("worldGrid").appendChild(card);
  });
}
function openAdventure(){showView("adventureView");$("stagePanel").classList.add("hidden");$("battlePanel").classList.add("hidden");renderAdventure();}
function openAdventureWorld(id){activeWorld=id;const w=ADVENTURE_WORLDS.find(x=>x.id===id);$("worldGrid").classList.add("hidden");$("stagePanel").classList.remove("hidden");$("worldLabel").textContent=`${PORTAL_DATA[id].title} · ADVENTURE`;$("worldTitle").textContent=`${w.icon} ${w.name} / ${w.ja}`;$("worldDescription").textContent=w.desc;renderStages();}
function renderStages(){const cleared=adventureProgress[activeWorld]||0;$("stageGrid").innerHTML="";[1,2,3,4].forEach(n=>{const boss=n===4,unlocked=n<=cleared+1,complete=n<=cleared;const b=document.createElement("button");b.className=`stage-card${boss?" boss-stage":""}${unlocked?"":" locked"}${complete?" complete":""}`;b.innerHTML=`<div class="stage-icon">${complete?"✅":boss?"🐉":"⭐"}</div><h3>${boss?"Boss Battle":`Stage ${n}`}</h3><small>${boss?"ボスバトル":`ステージ ${n}`}</small>`;if(unlocked)b.onclick=()=>startAdventureBattle(n,boss);$("stageGrid").appendChild(b);});}
function startAdventureBattle(stage,boss){
  battleIsBoss=Boolean(boss);
  battleIndex=0;
  playerHealth=100;
  enemyHealth=battleIsBoss?150:100;
  const pool=shuffle(getWorldWords(activeWorld));
  battleWords=pool.slice(0,battleIsBoss?10:5);
  $("stagePanel").classList.add("hidden");
  $("battlePanel").classList.remove("hidden");
  const w=ADVENTURE_WORLDS.find(x=>x.id===activeWorld);
  $("bossArt").textContent=battleIsBoss?w.bossIcon:"👾";
  $("enemyName").textContent=battleIsBoss?w.boss:w.enemy;
  $("battleStageLabel").textContent=battleIsBoss?"FINAL BOSS / 最終ボス":`STAGE ${stage} / ステージ ${stage}`;
  $("battleTitle").textContent=battleIsBoss?`${w.boss} Battle`:`${w.enemy} Battle`;
  $("battlePanel").dataset.stage=String(stage);
  updateBattleBars();
  renderBattleQuestion();
}
function updateBattleBars(){
  const maxEnemy=battleIsBoss?150:100;
  $("playerHP").style.width=`${Math.max(0,Math.min(100,playerHealth))}%`;
  $("enemyHP").style.width=`${Math.max(0,Math.min(100,(enemyHealth/maxEnemy)*100))}%`;
}
function renderBattleQuestion(){
  if(enemyHealth<=0){finishBattle(true);return;}
  if(playerHealth<=0){finishBattle(false);return;}
  if(battleIndex>=battleWords.length){finishBattle(enemyHealth<=0);return;}
  const current=battleWords[battleIndex];
  const distractors=shuffle(getWorldWords(activeWorld).filter(x=>x.english!==current.english)).slice(0,3);
  $("battlePrompt").textContent=current.japanese;
  $("battleFeedback").textContent=`Question ${battleIndex+1} / ${battleWords.length}`;
  $("battleChoices").innerHTML="";
  shuffle([current,...distractors]).forEach(c=>{
    const b=document.createElement("button");
    b.className="choice";
    b.textContent=c.english;
    b.onclick=()=>answerBattle(b,c.english===current.english,current);
    $("battleChoices").appendChild(b);
  });
}
function answerBattle(btn,correct,word){
  const buttons=[...document.querySelectorAll("#battleChoices .choice")];
  buttons.forEach(b=>b.disabled=true);
  if(correct){
    btn.classList.add("correct");
    enemyHealth=Math.max(0,enemyHealth-(battleIsBoss?18:25));
    $("battleFeedback").textContent=battleIsBoss?"⚔️ Critical Hit!":"⚔️ Great attack!";
  }else{
    btn.classList.add("wrong");
    const right=buttons.find(b=>norm(b.textContent)===norm(word.english));
    if(right)right.classList.add("correct");
    playerHealth=Math.max(0,playerHealth-25);
    $("battleFeedback").textContent=`💥 The answer was ${word.english}.`;
  }
  battleIndex++;
  updateBattleBars();
  try{
    if(correct){addXP(10);markStudied(word);clearWrongWord(word);}
    else markWrong(word);
  }catch(error){console.error("Battle stats error:",error);}
  setTimeout(()=>{
    if(enemyHealth<=0)finishBattle(true);
    else if(playerHealth<=0)finishBattle(false);
    else renderBattleQuestion();
  },850);
}
function finishBattle(win){if(win){const stage=Number($("battlePanel").dataset.stage),reward=battleIsBoss?100:30;adventureCoins+=reward;adventureProgress[activeWorld]=Math.max(adventureProgress[activeWorld]||0,stage);saveAdventure();$("battlePrompt").textContent=battleIsBoss?"🏆 BOSS DEFEATED!":"🎉 STAGE CLEAR!";$("battleChoices").innerHTML=`<button class="primary-btn" id="battleContinue">Collect ${reward} coins and continue</button>`;$("battleFeedback").textContent=`You earned ${reward} coins! / ${reward}コインをゲット！`;$ ("battleContinue").onclick=()=>{renderAdventure();openAdventureWorld(activeWorld)};}else{$("battlePrompt").textContent="Try Again! / もう一度挑戦！";$("battleChoices").innerHTML='<button class="primary-btn" id="battleRetry">Retry Battle</button>';$("battleFeedback").textContent="Review the words and defeat the enemy next time.";$ ("battleRetry").onclick=()=>startAdventureBattle(Number($("battlePanel").dataset.stage),battleIsBoss);}}
$("adventureBtn").onclick=openAdventure;$("backAdventureHomeBtn").onclick=()=>{showView("homeView");$("worldGrid").classList.remove("hidden")};$("closeWorldBtn").onclick=()=>{$("stagePanel").classList.add("hidden");$("worldGrid").classList.remove("hidden");renderAdventure()};$("battleExitBtn").onclick=()=>{openAdventureWorld(activeWorld)};
renderAdventure();
