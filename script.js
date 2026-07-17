const $=id=>document.getElementById(id);
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const norm=s=>s.toLowerCase().trim().replace(/[’']/g,"'").replace(/\s+/g," ");
const W=w=>Array.isArray(w)?{english:w[0],japanese:w[1],reading:"",emoji:w[2]||"📝",example:w[3]||"",part:"General",category:"word",difficulty:1}:w;
const en=w=>W(w).english, jp=w=>W(w).japanese, emoji=w=>W(w).emoji||"📝", example=w=>W(w).example||"";
let grade=null,unit=null,words=[],xp=Number(localStorage.getItem("portalXP")||0);
let studied=new Set(),favorites=new Set(),wrong=new Set();
let quizItems=[],quizIndex=0,quizScore=0,spellItems=[],spellIndex=0,spellScore=0;
let fillItems=[],fillIndex=0,fillScore=0,speedTimer=null,speedCurrent=null,speedPoints=0,speedSeconds=30;
const colors=["#ffdada","#dcecff","#e3f4db","#fff0c8","#eadcff","#d9f3ef","#ffe2ef","#e9e3ff"];

function showView(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$(id).classList.add("active")}
function saveSets(){localStorage.setItem(`studied-${grade}-${unit}`,JSON.stringify([...studied]));localStorage.setItem(`favorites-${grade}-${unit}`,JSON.stringify([...favorites]));localStorage.setItem(`wrong-${grade}-${unit}`,JSON.stringify([...wrong]))}
function loadSets(){studied=new Set(JSON.parse(localStorage.getItem(`studied-${grade}-${unit}`)||"[]"));favorites=new Set(JSON.parse(localStorage.getItem(`favorites-${grade}-${unit}`)||"[]"));wrong=new Set(JSON.parse(localStorage.getItem(`wrong-${grade}-${unit}`)||"[]"))}
function addXP(n){xp+=n;localStorage.setItem("portalXP",xp);updateStats();toast(`+${n} XP`)}
function updateStats(){$("xpValue").textContent=xp;$("levelValue").textContent=Math.floor(xp/250)+1;$("studiedCount").textContent=studied.size;$("favoriteCount").textContent=favorites.size;$("wrongCount").textContent=wrong.size;$("progressText").textContent=`${studied.size} of ${words.length} words studied`;$("progressBar").style.width=`${words.length?studied.size/words.length*100:0}%`}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1100)}
function speak(text){if(!window.speechSynthesis||$("soundBtn").dataset.off==="1")return;const u=new SpeechSynthesisUtterance(text);u.lang="en-US";speechSynthesis.cancel();speechSynthesis.speak(u)}
function markStudied(w){studied.add(en(w));saveSets();updateStats()}
function markWrong(w){wrong.add(en(w));saveSets();updateStats()}
function clearWrongWord(w){wrong.delete(en(w));saveSets();updateStats()}

function goHome(){showView("homeView")}
function openGrade(g){grade=g;const d=PORTAL_DATA[g];$("gradeLabel").textContent=d.label.toUpperCase();$("gradeTitle").textContent=d.title;$("unitGrid").innerHTML="";for(let i=1;i<=10;i++){const u=d.units[i],b=document.createElement("button");b.className="unit-card"+(u?"":" locked");b.innerHTML=`<span class="badge">${u?"AVAILABLE":"COMING SOON"}</span><h3>Unit ${i}</h3><p>${u?u.subtitle:"Vocabulary will be added later."}</p>`;if(u)b.onclick=()=>openUnit(i);$("unitGrid").appendChild(b)}showView("unitsView")}
function openUnit(n){unit=n;const d=PORTAL_DATA[grade].units[n];words=d.words;loadSets();$("studyLabel").textContent=`${grade.toUpperCase()} · ${PORTAL_DATA[grade].label.toUpperCase()}`;$("studyTitle").textContent=`${d.title} Vocabularies (単語)`;$("studySubtitle").textContent=d.subtitle;$("wordCount").textContent=words.length;setupFilters();updateStats();switchMode("flashcards");showView("studyView")}

function renderFlashcards(arr,container){
  container.innerHTML="";
  if(!arr.length){container.innerHTML="<p>No words found.</p>";return}
  arr.forEach((raw,i)=>{
    const x=W(raw),card=document.createElement("div");
    card.className="flashcard";
    const fav=favorites.has(x.english);
    const reading=x.reading?`<div>${x.reading}</div>`:"";
    const meta=`<div class="word-meta"><span class="word-chip">${x.part||"General"}</span><span class="word-chip">${x.category||"word"}</span></div>`;
    card.innerHTML=`<button class="favorite-star" title="Favorite">${fav?"⭐":"☆"}</button><div class="flash-inner"><div class="flash-face" style="background:${colors[i%colors.length]}"><div class="flash-emoji">${x.emoji||"📝"}</div><div class="flash-word">${x.english}</div>${meta}</div><div class="flash-face flash-back" style="background:${colors[(i+3)%colors.length]}"><div class="flash-word">${x.japanese}</div>${reading}<small>${x.example||""}</small></div></div>`;
    card.querySelector(".favorite-star").onclick=e=>{e.stopPropagation();favorites.has(x.english)?favorites.delete(x.english):favorites.add(x.english);saveSets();updateStats();applyFilters()};
    card.onclick=()=>{card.classList.toggle("flipped");markStudied(x);speak(x.english)};
    container.appendChild(card)
  })
}
function setupFilters(){
  const parts=[...new Set(words.map(w=>W(w).part||"General"))];
  const cats=[...new Set(words.map(w=>W(w).category||"word"))];
  $("partFilter").innerHTML='<option value="all">All parts</option>'+parts.map(x=>`<option>${x}</option>`).join("");
  $("categoryFilter").innerHTML='<option value="all">All categories</option>'+cats.map(x=>`<option>${x}</option>`).join("");
  $("wordSearch").value="";$("partFilter").value="all";$("categoryFilter").value="all";applyFilters()
}
function applyFilters(){
  const q=norm($("wordSearch")?.value||""),part=$("partFilter")?.value||"all",cat=$("categoryFilter")?.value||"all";
  const result=words.filter(raw=>{const x=W(raw);return(!q||norm(`${x.english} ${x.japanese} ${x.reading||""}`).includes(q))&&(part==="all"||x.part===part)&&(cat==="all"||x.category===cat)});
  if($("filterResultText"))$("filterResultText").textContent=`Showing ${result.length} of ${words.length} words`;
  renderFlashcards(result,$("flashcardGrid"))
}
function switchMode(id){document.querySelectorAll(".mode-btn").forEach(b=>b.classList.toggle("active",b.dataset.mode===id));document.querySelectorAll(".game").forEach(g=>g.classList.toggle("active",g.id===id));if(id==="quiz")startQuiz();if(id==="spelling")startSpelling();if(id==="matching")startMatching();if(id==="memory")startMemory();if(id==="hangman")startHangman();if(id==="fillblank")startFill();if(id==="favorites")renderFlashcards(words.filter(w=>favorites.has(en(w))),$("favoriteGrid"));if(id==="wrong")renderFlashcards(words.filter(w=>wrong.has(en(w))),$("wrongGrid"))}

function startQuiz(){quizItems=shuffle(words).slice(0,Math.min(10,words.length));quizIndex=0;quizScore=0;renderQuiz()}
function renderQuiz(){const c=quizItems[quizIndex];if(!c){$("quizPrompt").textContent=`Finished! ${quizScore} / ${quizItems.length}`;$("quizChoices").innerHTML="";$("quizFeedback").textContent="Great job!";$("quizNextBtn").classList.add("hidden");return}$("quizProgress").textContent=`Question ${quizIndex+1} / ${quizItems.length}`;$("quizScore").textContent=`Score: ${quizScore}`;$("quizPrompt").textContent=jp(c);$("quizFeedback").textContent="";$("quizNextBtn").classList.add("hidden");$("quizChoices").innerHTML="";const opts=shuffle([c,...shuffle(words.filter(x=>en(x)!==en(c))).slice(0,3)]);opts.forEach(o=>{const b=document.createElement("button");b.className="choice";b.textContent=en(o);b.onclick=()=>{document.querySelectorAll("#quizChoices .choice").forEach(x=>x.disabled=true);if(en(o)===en(c)){b.classList.add("correct");quizScore++;addXP(10);markStudied(c);clearWrongWord(c);$("quizFeedback").textContent="Correct! 正解！";speak(en(c))}else{b.classList.add("wrong");markWrong(c);$("quizFeedback").textContent=`Answer: ${en(c)}`}$("quizScore").textContent=`Score: ${quizScore}`;$("quizNextBtn").classList.remove("hidden")};$("quizChoices").appendChild(b)})}

function startSpelling(){spellItems=shuffle(words).slice(0,Math.min(10,words.length));spellIndex=0;spellScore=0;renderSpelling()}
function renderSpelling(){const c=spellItems[spellIndex];if(!c){$("spellPrompt").textContent=`Finished! ${spellScore} / ${spellItems.length}`;$("spellInput").disabled=true;$("spellCheckBtn").disabled=true;$("spellNextBtn").classList.add("hidden");return}$("spellProgress").textContent=`Word ${spellIndex+1} / ${spellItems.length}`;$("spellScore").textContent=`Score: ${spellScore}`;$("spellPrompt").textContent=jp(c);$("spellInput").value="";$("spellInput").disabled=false;$("spellCheckBtn").disabled=false;$("spellFeedback").textContent="";$("spellNextBtn").classList.add("hidden");$("spellInput").focus()}
function checkSpelling(){const c=spellItems[spellIndex];if(!c)return;const ok=norm($("spellInput").value)===norm(en(c));$("spellInput").disabled=true;$("spellCheckBtn").disabled=true;if(ok){spellScore++;addXP(12);markStudied(c);clearWrongWord(c);$("spellFeedback").textContent="Correct! 正解！";speak(en(c))}else{markWrong(c);$("spellFeedback").textContent=`Answer: ${en(c)}`}$("spellScore").textContent=`Score: ${spellScore}`;$("spellNextBtn").classList.remove("hidden")}

function startMatching(){const round=shuffle(words).slice(0,Math.min(6,words.length)),eng=round.map((x,i)=>({text:en(x),id:i,word:en(x)})),jpn=shuffle(round.map((x,i)=>({text:jp(x),id:i,word:en(x)})));$("matchingBoard").innerHTML='<div id="engCol" class="match-column"></div><div id="jpnCol" class="match-column"></div>';let a=null,b=null,count=0;const check=()=>{if(!a||!b)return;if(a.dataset.id===b.dataset.id){a.classList.add("matched");b.classList.add("matched");count++;$("matchingCount").textContent=`${count} / ${round.length}`;addXP(8);markStudied(a.dataset.word)}else{setTimeout(()=>{a?.classList.remove("selected");b?.classList.remove("selected");a=b=null},250);return}a.classList.remove("selected");b.classList.remove("selected");a=b=null};eng.forEach(x=>{const c=document.createElement("button");c.className="match-item";c.textContent=x.text;c.dataset.id=x.id;c.dataset.word=x.word;c.onclick=()=>{document.querySelectorAll("#engCol .match-item").forEach(e=>e.classList.remove("selected"));a=c;c.classList.add("selected");check()};$("engCol").appendChild(c)});jpn.forEach(x=>{const c=document.createElement("button");c.className="match-item";c.textContent=x.text;c.dataset.id=x.id;c.dataset.word=x.word;c.onclick=()=>{document.querySelectorAll("#jpnCol .match-item").forEach(e=>e.classList.remove("selected"));b=c;c.classList.add("selected");check()};$("jpnCol").appendChild(c)});$("matchingCount").textContent=`0 / ${round.length}`}

function startMemory(){const round=shuffle(words).slice(0,Math.min(6,words.length));const cards=shuffle(round.flatMap((x,i)=>[{text:en(x),id:i,word:en(x)},{text:jp(x),id:i,word:en(x)}]));$("memoryBoard").innerHTML="";let first=null,lock=false,count=0;cards.forEach(x=>{const b=document.createElement("button");b.className="memory-card";b.textContent="?";b.dataset.id=x.id;b.dataset.text=x.text;b.dataset.word=x.word;b.onclick=()=>{if(lock||b.classList.contains("matched")||b===first)return;b.textContent=b.dataset.text;b.classList.add("revealed");if(!first){first=b;return}if(first.dataset.id===b.dataset.id){first.classList.add("matched");b.classList.add("matched");count++;$("memoryCount").textContent=`${count} / ${round.length}`;addXP(10);markStudied(b.dataset.word);first=null}else{lock=true;setTimeout(()=>{first.textContent="?";b.textContent="?";first.classList.remove("revealed");b.classList.remove("revealed");first=null;lock=false},650)}};$("memoryBoard").appendChild(b)});$("memoryCount").textContent=`0 / ${round.length}`}

function startSpeed(){clearInterval(speedTimer);speedSeconds=30;speedPoints=0;$("speedTime").textContent=speedSeconds;$("speedScore").textContent="Score: 0";$("speedStartBtn").classList.add("hidden");nextSpeed();speedTimer=setInterval(()=>{speedSeconds--;$("speedTime").textContent=speedSeconds;if(speedSeconds<=0){clearInterval(speedTimer);$("speedPrompt").textContent=`Finished! Score: ${speedPoints}`;$("speedChoices").innerHTML="";$("speedStartBtn").classList.remove("hidden")}},1000)}
function nextSpeed(){speedCurrent=shuffle(words)[0];$("speedPrompt").textContent=speedCurrent[1];$("speedChoices").innerHTML="";shuffle([speedCurrent,...shuffle(words.filter(x=>en(x)!==en(speedCurrent))).slice(0,3)]).forEach(o=>{const b=document.createElement("button");b.className="choice";b.textContent=en(o);b.onclick=()=>{if(en(o)===en(speedCurrent)){speedPoints++;addXP(3);markStudied(speedCurrent);clearWrongWord(speedCurrent)}else{markWrong(speedCurrent)}$("speedScore").textContent=`Score: ${speedPoints}`;nextSpeed()};$("speedChoices").appendChild(b)})}

function startHangman(){const c=shuffle(words)[0],answer=en(c).toLowerCase();let guessed=new Set(),mistakes=0;$("hangmanMeaning").textContent=jp(c);$("hangmanFeedback").textContent="";$("hangmanLetters").innerHTML="";const display=()=>{$("hangmanWord").textContent=[...answer].map(ch=>/[a-z]/.test(ch)?(guessed.has(ch)?ch:"_"):ch).join(" ");$("hangmanMistakes").textContent=mistakes;const won=[...answer].every(ch=>!/[a-z]/.test(ch)||guessed.has(ch));if(won){$("hangmanFeedback").textContent="You got it!";addXP(15);markStudied(c);clearWrongWord(c);document.querySelectorAll("#hangmanLetters button").forEach(b=>b.disabled=true)}if(mistakes>=6){$("hangmanFeedback").textContent=`Answer: ${en(c)}`;markWrong(c);document.querySelectorAll("#hangmanLetters button").forEach(b=>b.disabled=true)}};"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter=>{const b=document.createElement("button");b.textContent=letter;b.onclick=()=>{b.disabled=true;const ch=letter.toLowerCase();guessed.add(ch);if(!answer.includes(ch))mistakes++;display()};$("hangmanLetters").appendChild(b)});display()}

function startFill(){fillItems=shuffle(words.filter(w=>example(w))).slice(0,Math.min(10,words.length));fillIndex=0;fillScore=0;renderFill()}
function renderFill(){const c=fillItems[fillIndex];if(!c){$("fillPrompt").textContent=`Finished! ${fillScore} / ${fillItems.length}`;$("fillJapaneseHint").textContent="";$("fillInput").disabled=true;$("fillCheckBtn").disabled=true;$("fillNextBtn").classList.add("hidden");return}const escaped=en(c).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");$("fillPrompt").textContent=example(c).replace(new RegExp(escaped,"i"),"_____");$("fillJapaneseHint").textContent=`Hint: ${jp(c)}${W(c).reading?`（${W(c).reading}）`:""}`;$("fillProgress").textContent=`Sentence ${fillIndex+1} / ${fillItems.length}`;$("fillScore").textContent=`Score: ${fillScore}`;$("fillInput").value="";$("fillInput").disabled=false;$("fillCheckBtn").disabled=false;$("fillFeedback").textContent="";$("fillNextBtn").classList.add("hidden")}
function checkFill(){const c=fillItems[fillIndex];if(!c)return;const ok=norm($("fillInput").value)===norm(en(c));$("fillInput").disabled=true;$("fillCheckBtn").disabled=true;if(ok){fillScore++;addXP(12);markStudied(c);clearWrongWord(c);$("fillFeedback").textContent="Correct! 正解！"}else{markWrong(c);$("fillFeedback").textContent=`Answer: ${en(c)}`}$("fillScore").textContent=`Score: ${fillScore}`;$("fillNextBtn").classList.remove("hidden")}

document.querySelectorAll(".grade-card").forEach(b=>b.onclick=()=>openGrade(b.dataset.grade));
$("logoBtn").onclick=goHome;$("backHomeBtn").onclick=goHome;$("backUnitsBtn").onclick=()=>openGrade(grade);
document.querySelectorAll(".mode-btn").forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
$("shuffleCardsBtn").onclick=()=>renderFlashcards(shuffle(words),$("flashcardGrid"));
$("quizNextBtn").onclick=()=>{quizIndex++;renderQuiz()};
$("spellCheckBtn").onclick=checkSpelling;$("spellInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!$("spellCheckBtn").disabled)checkSpelling()});$("spellNextBtn").onclick=()=>{spellIndex++;renderSpelling()};
$("newMatchingBtn").onclick=startMatching;$("newMemoryBtn").onclick=startMemory;
$("speedStartBtn").onclick=startSpeed;$("newHangmanBtn").onclick=startHangman;
$("fillCheckBtn").onclick=checkFill;$("fillInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!$("fillCheckBtn").disabled)checkFill()});$("fillNextBtn").onclick=()=>{fillIndex++;renderFill()};
$("clearWrongBtn").onclick=()=>{wrong.clear();saveSets();updateStats();renderFlashcards([],$("wrongGrid"))};
$("soundBtn").onclick=()=>{const off=$("soundBtn").dataset.off==="1";$("soundBtn").dataset.off=off?"0":"1";$("soundBtn").textContent=off?"🔊":"🔇"};
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");$("themeBtn").textContent=document.body.classList.contains("dark")?"🌙":"☀️"};
$("wordSearch").addEventListener("input",applyFilters);
$("partFilter").addEventListener("change",applyFilters);
$("categoryFilter").addEventListener("change",applyFilters);
$("clearFiltersBtn").onclick=()=>{$("wordSearch").value="";$("partFilter").value="all";$("categoryFilter").value="all";applyFilters()};
updateStats();