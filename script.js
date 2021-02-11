function setup() {
  createCanvas(600, 400);
  for(let i = 0; i < 4; i++){
    for(let l = 0; l < 20-4*i-1; l++){
      level[1+2*i][l+2*i] = 1
    }
    for(let l = 0; l < 20-4*i-4; l++){
      level[l+2*i+3][1+2*i] = 1
    }
    for(let l = 0; l < 20-4*i-2; l++){
      level[20-(2+2*i)][l+2*i+1] = 1
    }
    for(let l = 0; l < 20-4*i-2; l++){
      level[l+2*i+1][20-(2+2*i)] = 1
    }
  }
  soundtrackFiles[0].play();
}

function preload(){
  for(let i = 0; i < soundtrackFiles.length; i++){
    soundtrackFiles[i] = loadSound(soundtrackFiles[i])
  }
}

function saveVersion(){
  let object = {version:version,changelog:changelog,versionName:versionName}

}

function getVersion(){
  return {version:0,changelog:changelog,versionName:"0.1a"}
}

let currentPos = 0;
let playlistPos = 0;
let version = 0;
let changelog = `
Additions:
Wave System
Version System

Bugfixes:
Enemies no longer disappear when paused
Bullets no longer affect enemies when paused

Removals:
None
`;
let versionName = "0.0.1a";
let waveLength = 20;
let wave = 0;
let soundtrackFiles = ["song1.mp3","song2.mp3","song3.mp3"];
let screen = 0;
let rate = 120;
let minSpeed = 1;
let maxSpeed = 1;
let dmg = 5;
let playing = false;
let hp = 10;
let path = [[1,18],[18,18],[18,1],[3,1],[3,16],[16,16],[16,3],[5,3],[5,14],[14,14],[14,5],[7,5],[7,12],[12,12],[12,7],[9,7]]
let enemies = [];
let bullets = [];
let towers = [];
let angle = 0;
let money = 5;
let tdmg = [2,3,4,5,5,10];
let trate = [30,30,30,15,5,1];
let tcost = [5,15,50,100,250,5000];
let tr = [0,0,127.5,0,200,255];
let tg = [0,127.5,0,0,200,0];
let tb = [127.5,0,0,0,200,0];
let selected = -1;
let gPressed = false;
let shoot = false;

function draw() {
  if(!soundtrackFiles[playlistPos].isPlaying()){
    soundtrackFiles[playlistPos].play();
    playlistPos++;
    if(playlistPos>soundtrackFiles.length){
      playlistPos = 0;
    }
  }
  //For debug only, remove later
  if(keyIsDown(71)&&!gPressed){
    screen+=1;
    if(screen>2){
      screen = 0;
    }
    gPressed = true;
  }else if(!keyIsDown(71)){
    gPressed = false;
  }
  if(screen == 0){
    createCanvas(500,400);
    background(0);
    //Title Screen
    fill(155,155,80);
    rect(100,80,300,60,20);
    rect(200,200,100,60,15);
    fill(255,255,0);
    textAlign(CENTER,TOP);
    textSize(27);
    text("Defend The Tower",250,100);
    text("PLAY",250,220);
    fill(200,200,200);
    rect(10,290,50,50,10);
    fill(130);
    circle(35, 315, 25);
    push();
    translate(35,315);
    for(let i = 0; i < 10; i++){
      rotate(TWO_PI/10);
      triangle(-2.5, 12, 0, 20, 2.5, 12);
    }
    pop();
    //This detects when the play button is pressed
    if(mouseX>200&&mouseY>200&&mouseX<300&&mouseY<260&&mouseIsPressed){
      screen = 1;
      //This resets the game, just in case some weird glitch happens
      money = 5;
      towers = [];
      bullets = [];
      enemies = [];
      rate = 120;
      minSpeed = 1;
      maxSpeed = 1;
      hp = 10;
    }
  }
  if(screen == 2){
    createCanvas(500,400);
    //Lose Screen
    background(255);
    textAlign(CENTER,CENTER);
    textSize(50);
    fill(0);
    text("You Lose!",width/2,height/2);
  }
  if(screen == 1){
    createCanvas(600,400);
    background(220);
    for(let i = 0; i < tr.length; i++){
      if(selected==i){
        fill(0,255,0,127.5);
        circle(415+(i%8)*25,40+((i-i%8)/8)*20,25);
      }
      fill(tr[i],tg[i],tb[i])
      circle(415+(i%8)*25,40+((i-i%8)/8)*20,20);
      if(dist(mouseX,mouseY,415+(i%8)*25,40+((i-i%8)/8)*20)<20&&mouseIsPressed){
        selected = i;
      }
    }
    if(selected!=-1){
      textAlign(CENTER,CENTER);
      fill(0);
      text(`
  Damage: `+tdmg[selected]+`


  Attack Speed: `+60/trate[selected]+`


  Cost: `+tcost[selected]+`
  `,500,200);
      if(mouseIsPressed&&mouseX<400){
        gx = (mouseX-mouseX%20)/20;
        gy = (mouseY-mouseY%20)/20;
        if(level[gx][gy]==0 && tcost[selected]<=money){
          towers.push([selected,mouseX,mouseY]);
          money-=tcost[selected];
          tcost[selected]*=1.2
          tcost[selected] =round(tcost[selected]);
          selected = -1;
        }
      }
    }
    if(keyIsPressed && key=="Escape"){
      selected = -1;
    }
    maxSpeed+=0.001;
    minSpeed+=0.0001;
    rate*=0.9999;
    for(let x = 0; x < level.length; x++){
      for(let y = 0; y < level[x].length; y++){
        fill(255-level[x][y]*127);
        noStroke();
        rect(x*20,y*20,20,20);
      }
    }
    if(frameCount%round(rate)==0&&playing){
      if(waveLength>0){
        enemies.push([0,30,10,round(pow(random(sqrt(minSpeed),sqrt(maxSpeed)),2)),10]);
        waveLength--;
      }
    }
    if(waveLength==0&&enemies.length==0){
      playing = false;
      wave++;
    }
    if(mouseIsPressed&&!shoot&&playing){
      shoot = true;
      bullets.push([200,200,createVector(100,0).angleBetween(createVector(mouseX-200,mouseY-200)),7,20]);
    }
    if(!mouseIsPressed){
      shoot = false;
    }
    for(let i = 0; i < enemies.length; i++){
      fill(255,0,0)
      circle(enemies[i][1],enemies[i][2],17.5)
      if(playing){
        if(enemies[i][0]%4==0){
          enemies[i][2]+=enemies[i][3];
          if(enemies[i][2]>=path[enemies[i][0]][1]*20+10){
            enemies[i][0]++;
          }
        }
        if(enemies[i][0]%4==1){
          enemies[i][1]+=enemies[i][3];
          if(enemies[i][1]>=path[enemies[i][0]][0]*20+10){
            enemies[i][0]++;
          }
        }
        if(enemies[i][0]%4==2){
          enemies[i][2]-=enemies[i][3];
          if(enemies[i][2]<=path[enemies[i][0]][1]*20+10){
            enemies[i][0]++;
          }
        }
        if(enemies[i][0]%4==3){
          enemies[i][1]-=enemies[i][3];
          if(enemies[i][1]<=path[enemies[i][0]][0]*20+10){
            enemies[i][0]++;
          }
        }
        if(enemies[i][0]==16){
          enemies.splice(i,1);
          i--;
          hp--;
        }
      }
    }
    for(let i = 0; i < bullets.length; i++){
      if(bullets.length==0||i>=bullets.length){
        break;
      }
      if(bullets[i][0] == 200 && bullets[i][1] == 200){
        bullets[i][0]+=bullets[i][4]*cos(bullets[i][2]);
        bullets[i][1]+=bullets[i][4]*sin(bullets[i][2]);
      }
      fill(0)
      circle(bullets[i][0],bullets[i][1],5);
      bullets[i][0]+=7*cos(bullets[i][2]);
      bullets[i][1]+=7*sin(bullets[i][2]);
      for(let c = 0; c < 2; c++){
        if(bullets[i]){
          if(bullets[i][c]<0||bullets[i][c]>400){
            bullets.splice(i,1);
          }
        }
      }
      for(let e = 0; e < enemies.length; e++){
        if(bullets[i]&&playing){
          if(dist(enemies[e][1],enemies[e][2],bullets[i][0],bullets[i][1])<=10.75){
            enemies[e][4]-=bullets[i][3];
            bullets.splice(i,1);
            if(enemies[e][4]<=0){
              money+=enemies[e][3]
              enemies.splice(e,1);
              if(enemies.length==0){
                break;
              }
            }
          }
        }
      }
    }
    for(let i = 0; i < towers.length; i++){
      fill(tr[towers[i][0]],tg[towers[i][0]],tb[towers[i][0]]);
      circle(towers[i][1],towers[i][2],10);
      push()
      translate(towers[i][1],towers[i][2]);
      for(let e = 0; e < enemies.length; e++){
        if(enemies.length>0){
          rotate(getShootingAngle(towers[i][1],towers[i][2],enemies[e][1],enemies[e][2],enemies[e][3],5,20,enemies[e][0]%4));
          if(dist(enemies[e][1],enemies[e][2],towers[i][1],towers[i][2])<100){
            if(frameCount%trate[towers[i][0]]==0&&enemies.length>0){
              bullets.push([towers[i][1],towers[i][2],getShootingAngle(towers[i][1],towers[i][2],enemies[e][1],enemies[e][2],enemies[e][3],7,20,enemies[e][0]%4),tdmg[towers[i][0]],20]);
            }
            break;
          }
          rotate(-getShootingAngle(towers[i][1],towers[i][2],enemies[e][1],enemies[e][2],enemies[e][3],5,20,enemies[e][0]%4));
        }
      }
      rect(0,-5,20,10);
      pop();
    }
    fill(0);
    textAlign(RIGHT,TOP);
    textSize(20);
    text("$"+money+".00",590,10);
    fill(0);
    circle(200,200,50);
    fill(255*(1-hp/10),255*(hp/10),0);
    if(hp<=0){
      screen = 2;
      money = 5;
      towers = [];
      bullets = [];
      enemies = [];
      rate = 120;
      minSpeed = 1;
      maxSpeed = 1;
      hp = 10;
    }
    push();
    circle(200,200,40);
    translate(200,200);
    rotate(createVector(100,0).angleBetween(createVector(mouseX-200,mouseY-200)));
    rect(0,-5,40,10);
    pop();
    fill(100,100,0);
    rect(400,300+100/3,200,200/3,10);
    fill(255,100,0)
    rect(400,300+100/3,200/3,200/3,10);
    rect(400+200/3,300+100/3,200/3,200/3,10);
    rect(400+400/3,300+100/3,200/3,200/3,10);
    fill(0,255,0);
    rect(400+5,300+100/3+5,200/3-10,200/3-10,10);
    rect(400+200/3+5,300+100/3+5,200/3-10,200/3-10,10);
    rect(400+400/3+5,300+100/3+5,200/3-10,200/3-10,10);
    fill(255,255,200);
    if(!playing){
      triangle(415,310+100/3,415,390,385+200/3,300+200/3)
    }else{
      rect(415,310+100/3,10,200/3-20);
      rect(400+200/3-25,310+100/3,10,200/3-20);
    }
    if(rectClick(400+5,300+100/3+5,200/3-10,200/3-10)&&button){
      if(!playing){
        if(waveLength==0){
          waveLength=20;
        }
      }
      playing = !playing;
      button = false;
    }
    if(!mouseIsPressed){
      button = true;
    }
  }
  if(version!=getVersion().version){
    rect(0,0,width,height);
    fill(0);
    textSize(20);
    textAlign(CENTER,TOP);
    fill(255);
    text("Reload to upgrade to version "+getVersion().versionName+".\nYou are currently on version "+versionName+".",width/2,10);
    text("Changelog:\n"+getVersion().changelog,width/2,60);
  }
}

//TODO: move this variable to a better spot
let button = false;

function rectClick(x,y,w,h){
  if(mouseX>x&&mouseY>y&&mouseX<x+w&&mouseY<y+h){
    return mouseIsPressed;
  }else{
    return false;
  }
}

function getShootingAngle(x1,y1,x2,y2,speed,bulletSpeed,depth,side){
  let ax = x2;
  let ay = y2;
  var time;
  if(side==0){
    for(let i = 0; i < depth; i++){
      let distance = dist(x1,y1,ax,ay);
      time = distance/bulletSpeed;
      ay=y2+((time-1)*speed)
    }
  }
  if(side==1){
    for(let i = 0; i < depth; i++){
      let distance = dist(x1,y1,ax,ay);
      time = distance/bulletSpeed;
      ax=x2+((time-1)*speed)
    }
  }
  if(side==2){
    for(let i = 0; i < depth; i++){
      let distance = dist(x1,y1,ax,ay);
      time = distance/bulletSpeed;
      ay=y2-((time-1)*speed)
    }
  }
  if(side==3){
    for(let i = 0; i < depth; i++){
      let distance = dist(x1,y1,ax,ay);
      time = distance/bulletSpeed;
      ax=x2-((time-1)*speed)
    }
  }
  return createVector(100,0).angleBetween(createVector(ax-x1,ay-y1));
}

let level = Array.from({length:20},()=>Array.from({length:20},()=>0))