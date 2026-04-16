const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* 🔥 PREVENT SCREEN SCROLL WHILE SWIPING */
canvas.addEventListener("touchmove", function(e){
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchstart", function(e){
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener("touchend", function(e){
  e.preventDefault();

  let dx = e.changedTouches[0].clientX - touchStartX;
  let dy = e.changedTouches[0].clientY - touchStartY;

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > 0 && dir.x !== -1) dir = {x:1,y:0};
    else if(dx < 0 && dir.x !== 1) dir = {x:-1,y:0};
  } else {
    if(dy > 0 && dir.y !== -1) dir = {x:0,y:1};
    else if(dy < 0 && dir.y !== 1) dir = {x:0,y:-1};
  }

}, { passive: false });

/* RESPONSIVE CANVAS */
function resizeCanvas(){
  const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 500);
  canvas.width = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ELEMENTS */
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const timerEl = document.getElementById("timer");
const levelDisplay = document.getElementById("levelDisplay");
const difficultyContainer = document.getElementById("difficultyContainer");

/* SOUND */
const eatSound = new Audio("assets/sounds/food.mp3");
const gameOverSound = new Audio("assets/sounds/gameover.mp3");
const bgMusic = new Audio("assets/sounds/music.mp3");
bgMusic.loop = true;

let isMuted = false;

/* STATE */
let snake, food, dir, score;
let running = false, paused = false;
let lastTime = 0;
let speed = 150;
let mode = "classic";
let level = 1;
let timeLeft = 60;

/* TOUCH START VALUES */
let touchStartX = 0;
let touchStartY = 0;

/* LEVEL */
function getLevelName(l){
  return l==1?"Beginner":l==2?"Intermediate":"Advanced";
}

function resetGame(){
  snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir={x:1,y:0};
  score=0;
  timeLeft=60;

  speed = mode==="classic"
    ? (level==1?160:level==2?120:80)
    :120;

  placeFood();
  updateScore();
  levelDisplay.textContent=getLevelName(level);
}

function placeFood(){
  food={x:Math.floor(Math.random()*25),y:Math.floor(Math.random()*25)};
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cell = canvas.width / 25;

  /* GRID */
  for(let i=0;i<25;i++){
    for(let j=0;j<25;j++){
      ctx.fillStyle=(i+j)%2?"#d1d5db":"#e5e7eb";
      ctx.fillRect(i*cell,j*cell,cell,cell);
    }
  }

  /* FOOD */
  ctx.fillStyle="orange";
  ctx.beginPath();
  ctx.arc(food.x*cell+cell/2,food.y*cell+cell/2,cell/3,0,Math.PI*2);
  ctx.fill();

  /* SNAKE */
  snake.forEach((s,i)=>{
    ctx.fillStyle=i==0?"#166534":"#22c55e";
    ctx.beginPath();
    ctx.arc(s.x*cell+cell/2,s.y*cell+cell/2,cell/2.5,0,Math.PI*2);
    ctx.fill();
  });
}

function update(){
  if(!running || paused) return;

  const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};

  if(head.x<0||head.y<0||head.x>=25||head.y>=25 ||
    snake.some(s=>s.x===head.x && s.y===head.y)){
    if(!isMuted) gameOverSound.play();
    return gameOver();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    score++;
    if(!isMuted) eatSound.play();
    placeFood();
    updateScore();
  } else {
    snake.pop();
  }

  if(mode==="time"){
    timeLeft -= 0.1;
    timerEl.textContent="Time: "+Math.floor(timeLeft);
    if(timeLeft<=0) gameOver();
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

/* KEYBOARD */
window.addEventListener("keydown",e=>{
  if(e.key==="ArrowUp" && dir.y!==1) dir={x:0,y:-1};
  if(e.key==="ArrowDown" && dir.y!==-1) dir={x:0,y:1};
  if(e.key==="ArrowLeft" && dir.x!==1) dir={x:-1,y:0};
  if(e.key==="ArrowRight" && dir.x!==-1) dir={x:1,y:0};

  if(e.key==="s") startGame();
  if(e.key==="r") restartGame();
  if(e.key==="p") paused=!paused;

  if(e.key==="m"){
    toggleMute();
  }
});

/* GAME CONTROL */
function startGame(){
  running=true;
  document.getElementById("overlay").classList.add("hidden");
  if(!isMuted) bgMusic.play();
}

function restartGame(){
  resetGame();
  running=true;
  document.getElementById("overlay").classList.add("hidden");
  if(!isMuted) bgMusic.play();
}

function gameOver(){
  running=false;
  document.getElementById("overlay").classList.remove("hidden");
  bgMusic.pause();
}

/* MUTE FUNCTION */
function toggleMute(){
  isMuted = !isMuted;

  if(isMuted){
    bgMusic.pause();
  } else {
    bgMusic.play();
  }
}

/* BUTTONS */
document.getElementById("muteBtn").onclick=toggleMute;

document.getElementById("startBtn").onclick=startGame;
document.getElementById("restartBtn").onclick=restartGame;

document.getElementById("modeClassic").onclick=()=>{
  mode="classic";
  difficultyContainer.style.display="block";
  resetGame();
};

document.getElementById("modeTime").onclick=()=>{
  mode="time";
  difficultyContainer.style.display="none";
  resetGame();
};

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

document.getElementById("infoBtn").onclick=()=>{
  document.getElementById("infoBox").classList.remove("hidden");
};

document.getElementById("closeInfo").onclick=()=>{
  document.getElementById("infoBox").classList.add("hidden");
};

resetGame();
requestAnimationFrame(loop);