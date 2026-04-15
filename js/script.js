const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const timerEl = document.getElementById("timer");
const levelDisplay = document.getElementById("levelDisplay");

/* ✅ NEW */
const difficultyContainer = document.getElementById("difficultyContainer");

let snake, food, dir, score;
let running=false, paused=false;
let lastTime=0;
let speed=150;
let mode="classic";
let level=1;
let timeLeft=60;

function getLevelName(l){
return l==1?"Beginner":l==2?"Intermediate":"Advanced";
}

const eatSound = new Audio("assets/sounds/food.mp3");
const gameOverSound = new Audio("assets/sounds/gameover.mp3");
const bgMusic = new Audio("assets/sounds/music.mp3");
bgMusic.loop = true;

function resetGame(){
snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
dir={x:1,y:0};
score=0;
timeLeft=60;

if(mode==="classic"){
speed = level==1?160: level==2?120:80;
}else{
speed = 120;
}

placeFood();
updateScore();
levelDisplay.textContent=getLevelName(level);
}

function placeFood(){
food={x:Math.floor(Math.random()*25),y:Math.floor(Math.random()*25)};
}

function draw(){
ctx.clearRect(0,0,500,500);

for(let i=0;i<25;i++){
for(let j=0;j<25;j++){
ctx.fillStyle=(i+j)%2?"#d1d5db":"#e5e7eb";
ctx.fillRect(i*20,j*20,20,20);
}
}

ctx.fillStyle="orange";
ctx.beginPath();
ctx.arc(food.x*20+10,food.y*20+10,6,0,Math.PI*2);
ctx.fill();

snake.forEach((s,i)=>{
ctx.fillStyle=i==0?"#166534":"#22c55e";
ctx.beginPath();
ctx.arc(s.x*20+10,s.y*20+10,8,0,Math.PI*2);
ctx.fill();
});
}

function update(){
if(!running || paused) return;

const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};

if(head.x<0||head.y<0||head.x>=25||head.y>=25 ||
snake.some(s=>s.x===head.x && s.y===head.y)){
gameOverSound.play();
return gameOver();
}

snake.unshift(head);

if(head.x===food.x && head.y===food.y){
score++;
eatSound.play();
placeFood();
updateScore();

if(mode==="classic"){
if(level==1 && score>=50){
level=2;
resetGame();
startGame();
}
else if(level==2 && score>=75){
level=3;
resetGame();
startGame();
}
}

}else{
snake.pop();
}

if(mode==="time"){
timeLeft-=0.1;
timerEl.textContent="Time: "+Math.floor(timeLeft);
if(timeLeft<=0){
gameOver();
}
}
}

function loop(time){
requestAnimationFrame(loop);
if(time-lastTime < speed) return;
lastTime=time;
update();
draw();
}

function updateScore(){
scoreEl.textContent=score;
let hs=localStorage.getItem("hs")||0;
if(score>hs){
localStorage.setItem("hs",score);
hs=score;
}
highscoreEl.textContent=hs;
}

window.addEventListener("keydown",e=>{
if(e.key==="ArrowUp" && dir.y!==1) dir={x:0,y:-1};
if(e.key==="ArrowDown" && dir.y!==-1) dir={x:0,y:1};
if(e.key==="ArrowLeft" && dir.x!==1) dir={x:-1,y:0};
if(e.key==="ArrowRight" && dir.x!==-1) dir={x:1,y:0};

if(e.key==="s") startGame();
if(e.key==="r") restartGame();
if(e.key==="p") paused=!paused;
});

function startGame(){
running=true;
document.getElementById("overlay").classList.add("hidden");
bgMusic.play();

if(mode==="time"){
timerEl.classList.remove("hidden");
}else{
timerEl.classList.add("hidden");
}
}

function restartGame(){
resetGame();
running=true;
document.getElementById("overlay").classList.add("hidden");
}

function gameOver(){
running=false;
document.getElementById("overlay").classList.remove("hidden");
bgMusic.pause();
}

/* BUTTONS */
document.getElementById("startBtn").onclick=startGame;
document.getElementById("restartBtn").onclick=restartGame;

/* ✅ MODE FIXES */
document.getElementById("modeClassic").onclick=()=>{
mode="classic";
document.getElementById("levelBtn").style.display="inline-block";
difficultyContainer.style.display="block"; /* SHOW */
resetGame();
};

document.getElementById("modeTime").onclick=()=>{
mode="time";
document.getElementById("levelBtn").style.display="none";
difficultyContainer.style.display="none"; /* HIDE */
resetGame();
};

/* LEVEL */
document.getElementById("levelBtn").onclick=()=>{
document.getElementById("levelBox").classList.toggle("hidden");
};

document.getElementById("closeLevel").onclick=()=>{
document.getElementById("levelBox").classList.add("hidden");
};

document.querySelectorAll(".levelSelect").forEach(btn=>{
btn.onclick=()=>{
level=parseInt(btn.dataset.level);
resetGame();
document.getElementById("levelBox").classList.add("hidden");
};
});

/* INFO */
document.getElementById("infoBtn").onclick=()=>{
document.getElementById("infoBox").classList.remove("hidden");
};

document.getElementById("closeInfo").onclick=()=>{
document.getElementById("infoBox").classList.add("hidden");
};

resetGame();
requestAnimationFrame(loop);