/*
The Game Project 7 - Make it awesome
*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var game_score=0;
var lives;

var platforms;
var enimies; 

var jumpSound;
var collectSound;
var gameoverSound;

function setup(){
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    lives = 4;
    startGame();
}

function startGame(){
    gameChar_x = 100;
	gameChar_y = floorPos_y;

	scrollPos = 0;
	gameChar_world_x = gameChar_x - scrollPos;

	//Control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	//Scenery objects.
    cloud = {y_pos:100, size:100}
    clouds = [130, 508, 1000, 1400, 2000, 2300]; 
    
    mountains = [300, 1140, 1300, 2150, 3050];
    
    trees_x = [1024, 1200, 1700, 2900, 3350];
    
    collectables =[
        {x_pos:450, y_pos: 75, size: 40, isFound: false}, 
        {x_pos:800, y_pos: 75, size: 40, isFound: false}, 
        {x_pos:900, y_pos: 75, size: 40, isFound: false},
        {x_pos:1200, y_pos: 75, size: 40, isFound: false},
        {x_pos:1300, y_pos: 75, size: 40, isFound: false}, 
        {x_pos:1500, y_pos: 75, size: 40, isFound: false}, 
        {x_pos:2200, y_pos: 75, size: 40, isFound: false},
        {x_pos:2300, y_pos: 75, size: 40, isFound: false},
        {x_pos:2400, y_pos: 75, size: 40, isFound: false}];
    
    canyons = [
        {x_pos: 200, width: 100}, 
        {x_pos: 1040, width: 100}, 
        {x_pos: 1800, width: 300}, 
        {x_pos: 2700, width: 300}];
    
    flagpole ={x_pos: 3300, isReached: false}
    
    life = [
        {x_pos: 35, y_pos: 25},
        {x_pos: 70, y_pos: 25},
        {x_pos: 105, y_pos: 25}]
    
    lives -= 1;
    
    platforms = [];
    platforms.push(createPlatform(400, floorPos_y-100, 100));
    platforms.push(createPlatform(1600, floorPos_y-100, 100));
    platforms.push(createPlatform(1750, floorPos_y-200, 150));
    platforms.push(createPlatform(1900, floorPos_y-300, 150));
    platforms.push(createPlatform(2750, floorPos_y-100, 150));
    
    enemies = [];
    enemies.push(new Enemy(500, floorPos_y, 100));
    enemies.push(new Enemy(1400, floorPos_y, 200));
    enemies.push(new Enemy(2100, floorPos_y, 200));
    enemies.push(new Enemy(2400, floorPos_y, 200));
}

function draw(){
    //sky and ground
	background(100, 155, 255);
	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); 
    
    //scroll controls
    push();
    translate(scrollPos, 0);
    
    //draw scenery
    drawClouds();
    drawMountains();
    drawTrees();
    renderFlagpole();
    
    if(flagpole.isReached==false){
        checkFlagpole();
    }
    
    //canyons
    for(var p = 0; p<canyons.length; p++){
        drawCanyon(canyons[p]);
        checkCanyon(canyons[p]);
    }
    
	//collectables
    for(var c=0; c<collectables.length; c++){
        if(collectables[c].isFound==false){
            drawCollectable(collectables[c]);
            checkCollectable(collectables[c]);
        }
    }
    
    //resets game if life lost
    if(gameChar_y>650 && lives>0){
        startGame();
    }
    
    //platforms 
    for(var i = 0; i<platforms.length; i++){
        platforms[i].draw();
    }
    
    for(var i = 0; i<enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        
        if(enemies[i].isContact(gameChar_world_x, gameChar_y)){
            gameoverSound.play();
            startGame();
            break;
        }
    }
    
    pop();
    
	drawGameChar();
    
    //game over and next level text
    if(lives<1){
        textSize(30);
        fill("black");
        text("Game over. Press space to continue.", 250, 400);
        return;
    }
    
    if(flagpole.isReached==true){
        textSize(30);
        fill("black");
        text("Level complete. Press space to continue.", 250, 400);
        return;
    }
    
    //draws lives
    for(var i=0; i<lives; i++){
        drawLives(life[i]);
    }
    
    //logic to make the game character rise and fall.
    if(gameChar_y!=floorPos_y)
    {
        var isContact = false; 
        for(var i = 0; i<platforms.length; i++){
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y)){
                isContact = true;
                break;
            }
        }
        
        if(isContact == false){
            isFalling = true;
            gameChar_y += 2;
        }
        else{
            isFalling = false; 
        }
    }
    else
    {
        isFalling = false;
    }
	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}
	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
    
    //print game score 
    fill("black");
    textSize(20);
    text("M&M's collected: "+game_score, 25, 50);
}

//Key control functions
function keyPressed(){
	if(flagpole.isReached && key == ' '){
    nextLevel();
    return
    }
    else if(lives == 0 && key == ' '){
    returnToStart();
    return
    }
    
    if(keyCode==37){
        isLeft = true;
    }
    
    if(keyCode==39){
        isRight = true;
    }
    
    if(keyCode==32 && (gameChar_y == floorPos_y  || isFalling==false))
    {
        gameChar_y -= 150;
        jumpSound.play();
    }

}
function keyReleased(){
     if(keyCode==37)
    {
        isLeft = false; 
    }
    
    if(keyCode==39)
    {
        isRight = false;
    }
    
}

// Game character render function
function drawGameChar(){
    if(isLeft && isFalling)
	{
        //leg 
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-14.5,5,35);
        //body
        fill(255,220,0);
        ellipse(gameChar_x,gameChar_y-34.5,20,40);
        //arm
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-45.5, 5, 20);
        //shoes
        fill(230);
        rect(gameChar_x, gameChar_y-3, 2, 6);
        ellipse(gameChar_x, gameChar_y-0, 4, 6);
        ellipse(gameChar_x-1, gameChar_y+0.5, 4, 6);
        ellipse(gameChar_x-2, gameChar_y+1, 4, 6);
        ellipse(gameChar_x-3, gameChar_y+1.5, 4, 6);
        //eyes
        fill(255);
        ellipse(gameChar_x-7, gameChar_y-37.5, 2.5, 10);
        fill(0);
        ellipse(gameChar_x-7.5, gameChar_y-39.5, 1.5, 3);
        //mouth
        fill(230,190,0);
        ellipse(gameChar_x-7, gameChar_y-28.5, 5, 2.5);
        //eyebrows 
        fill(105,105,105); 
        rect(gameChar_x-5, gameChar_y-45.5, -3, 1.5);
	}
	
    else if(isRight && isFalling)
	{
        //leg 
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-14.5,5,35);
        //body
        fill(255,220,0);
        ellipse(gameChar_x,gameChar_y-34.5,20,40);
        //arm
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-45.5, 5, 20);
        //shoes
        fill(230);
        rect(gameChar_x-2, gameChar_y-3, 2, 6);
        ellipse(gameChar_x, gameChar_y-0, 4, 6);
        ellipse(gameChar_x+1, gameChar_y+0.5, 4, 6);
        ellipse(gameChar_x+2, gameChar_y+1, 4, 6);
        ellipse(gameChar_x+3, gameChar_y+1.5, 4, 6);
        //eyes
        fill(255);
        ellipse(gameChar_x+7, gameChar_y-37.5, 2.5, 10);
        fill(0);
        ellipse(gameChar_x+7.5, gameChar_y-39.5, 1.5, 3);
        //mouth
        fill(230,190,0);
        ellipse(gameChar_x+7, gameChar_y-28.5, 5, 2.5);
        //eyebrows 
        fill(105,105,105); 
        rect(gameChar_x+5, gameChar_y-45.5, 3, 1.5);
	}
	
    else if(isLeft)
	{
        //leg 
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-14.5,5,35);
        //body
        fill(255,220,0);
        ellipse(gameChar_x,gameChar_y-34.5,20,40);
        //arm
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-25.5, 5, 20);
        //shoes
        fill(230);
        rect(gameChar_x+2, gameChar_y-3, -8, 6);
        ellipse(gameChar_x-6, gameChar_y, 6, 6);
        //eyes
        fill(255);
        ellipse(gameChar_x-7, gameChar_y-37.5, 2.5, 10);
        fill(0);
        ellipse(gameChar_x-7.5, gameChar_y-35.5, 1.5, 3);
        //mouth
        fill(230,190,0);
        ellipse(gameChar_x-7, gameChar_y-28.5, 5, 2.5);
        //eyebrows 
        fill(105,105,105); 
        rect(gameChar_x-5, gameChar_y-45.5, -3, 1.5);
	}
    
	else if(isRight)
	{
        //leg 
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-14.5,5,35);
        //body
        fill(255,220,0);
        ellipse(gameChar_x,gameChar_y-34.5,20,40);
        //arm
        fill(222,184,135);
        ellipse(gameChar_x, gameChar_y-25.5, 5, 20);
        //shoes
        fill(230);
        rect(gameChar_x-2, gameChar_y-3, 8, 6);
        ellipse(gameChar_x+6, gameChar_y, 6, 6);
        //eyes
        fill(255);
        ellipse(gameChar_x+7, gameChar_y-37.5, 2.5, 10);
        fill(0);
        ellipse(gameChar_x+7.7, gameChar_y-35.5, 1.5, 3);
        //mouth
        fill(230,190,0);
        ellipse(gameChar_x+7, gameChar_y-28.5, 5, 2.5);
        //eyebrows 
        fill(105,105,105); 
        rect(gameChar_x+5, gameChar_y-45.5, 3, 1.5);
	}
    
	else if(isFalling || isPlummeting)
	{
        //legs
        fill(222,184,135);
        ellipse(gameChar_x-5, gameChar_y-14.5,5,35);
        ellipse(gameChar_x+5, gameChar_y-14.5,5,35);
        //body
        fill(255,220,0);
        ellipse(gameChar_x,gameChar_y-34.5,30,40);
        //arms
        fill(222,184,135);
        ellipse(gameChar_x-15, gameChar_y-43.5, 5, 20);
        ellipse(gameChar_x+15, gameChar_y-43.5, 5, 20);
        //shoes
        fill(230);
        ellipse(gameChar_x-5, gameChar_y, 6, 8);
        ellipse(gameChar_x+5, gameChar_y, 6, 8);
        //eyes
        fill(255);
        ellipse(gameChar_x-4, gameChar_y-37.5, 5, 10);
        ellipse(gameChar_x+4, gameChar_y-37.5, 5, 10);
        fill(0);
        ellipse(gameChar_x-4, gameChar_y-39.5, 3, 3);
        ellipse(gameChar_x+4, gameChar_y-39.5, 3, 3);
        //mouth
        fill(230,190,0);
        ellipse(gameChar_x, gameChar_y-29.5, 5, 5);
        //eyebrows 
        fill(105,105,105); 
        rect(gameChar_x-2, gameChar_y-45.5, -4.5, 1.5);
        rect(gameChar_x+2, gameChar_y-45.5, 4.5, 1.5);
        //m 
        fill(255); 
        textAlign(CENTER, TOP);
        textSize(13);
        text("m", gameChar_x, gameChar_y-28.5);
        textAlign(LEFT);   
	}
    
	else
	{
        //legs
        fill(222,184,135);
        ellipse(gameChar_x-5, gameChar_y-14.5,5,35);
        ellipse(gameChar_x+5, gameChar_y-14.5,5,35);
        //body
        fill(255,220,0);
        ellipse(gameChar_x,gameChar_y-34.5,30,40);
        //arms
        fill(222,184,135);
        ellipse(gameChar_x-15, gameChar_y-23.5, 5, 20);
        ellipse(gameChar_x+15, gameChar_y-23.5, 5, 20);
        //shoes
        fill(230);
        rect(gameChar_x-2.5, gameChar_y-3, -8, 6);
        ellipse(gameChar_x-10, gameChar_y, 6, 6);
        rect(gameChar_x+2.5, gameChar_y-3, 8, 6);
        ellipse(gameChar_x+10, gameChar_y, 6, 6)
        //eyes
        fill(255);
        ellipse(gameChar_x-4, gameChar_y-37.5, 5, 10);
        ellipse(gameChar_x+4, gameChar_y-37.5, 5, 10);
        fill(0);
        ellipse(gameChar_x-4, gameChar_y-35.5, 3, 3);
        ellipse(gameChar_x+4, gameChar_y-35.5, 3, 3);
        //mouth
        fill(230,190,0);
        ellipse(gameChar_x, gameChar_y-30, 10, 5);
        fill(255,220,0);
        ellipse(gameChar_x, gameChar_y-31, 15, 3);
        //eyebrows 
        fill(105,105,105); 
        rect(gameChar_x-2, gameChar_y-45.5, -4.5, 1.5);
        rect(gameChar_x+2, gameChar_y-45.5, 4.5, 1.5);
        //m 
        fill(255);
        textAlign(CENTER, TOP);
        textSize(13);
        text("m", gameChar_x, gameChar_y-28.5);
        textAlign(LEFT);    
	}

	
}

// Background render functions
function renderFlagpole(){
    if(flagpole.isReached==false){
        fill("grey");
        rect(flagpole.x_pos, floorPos_y-150, 5, 150);
        fill("red");
        triangle(flagpole.x_pos+5, floorPos_y-40, flagpole.x_pos+5, floorPos_y-10, flagpole.x_pos+50, floorPos_y-25);
    }
    
    if(flagpole.isReached==true){
        fill("grey");
        rect(flagpole.x_pos, floorPos_y-150, 5, 150);
        fill("red");
        triangle(flagpole.x_pos+5, floorPos_y-150, flagpole.x_pos+5, floorPos_y-120, flagpole.x_pos+50, floorPos_y-135);
    }
    
}
function checkFlagpole(){
    d = (dist(gameChar_world_x, gameChar_y, flagpole.x_pos, floorPos_y));
    
    if(d<8){
        flagpole.isReached=true;
        winnerSound.play();
    }
}

function drawClouds(){
    for(var t=0; t<clouds.length; t++){
        noStroke();
        fill(192,192,192);
        ellipse(clouds[t], cloud.y_pos, cloud.size-30,cloud.size-30);
        ellipse(clouds[t]+50, cloud.y_pos-25,cloud.size+20,cloud.size+20);
        ellipse(clouds[t]+120, cloud.y_pos-15, cloud.size, cloud.size);
        ellipse(clouds[t]+170, cloud.y_pos+5, cloud.size-40, cloud.size-40);
        rect(clouds[t],cloud.y_pos-15, cloud.size+70, cloud.size-50);
        fill(255,255,255);
        ellipse(clouds[t]+10, cloud.y_pos+10, cloud.size-30,cloud.size-30);
        ellipse(clouds[t]+60, cloud.y_pos-15,cloud.size+20,cloud.size+20);
        ellipse(clouds[t]+130, cloud.y_pos-5, cloud.size,cloud.size);
        ellipse(clouds[t]+180, cloud.y_pos+15, cloud.size-40, cloud.size-40);
        rect(clouds[t]+10,cloud.y_pos-5, cloud.size+70, cloud.size/2);
    }
}
function drawMountains(){
    for(var m = 0; m<mountains.length; m++){
        noStroke();
        fill(34,139,34)
        triangle(mountains[m], floorPos_y, mountains[m]+300, floorPos_y, mountains[m]+150, floorPos_y-132);
        fill(50,205,50);
        triangle(mountains[m]+150,floorPos_y-132, mountains[m]+260,floorPos_y,mountains[m]+300,floorPos_y);
        fill(34,139,34);
        triangle(mountains[m]+370, floorPos_y, mountains[m]+200, floorPos_y, mountains[m]+285, floorPos_y-82);
        fill(50,205,50);
        triangle(mountains[m]+285,floorPos_y-82, mountains[m]+370,floorPos_y,mountains[m]+390,floorPos_y);
    }
}
function drawTrees(){
    var treePos_y = height/2; //288
    for(var i=0; i < trees_x.length; i++){
        noStroke();
        fill(145,69,25);
        rect(trees_x[i]-307,treePos_y+44,20,100);
        fill("green");
        ellipse(trees_x[i]-297,treePos_y+37,60,60);
        ellipse(trees_x[i]-322,treePos_y+62,60,60);
        ellipse(trees_x[i]-272,treePos_y+62,60,60);
        rect(trees_x[i]-322,treePos_y+62,50,30);
    }
}
function drawLives(t_life){
    fill("red");
    ellipse(t_life.x_pos, t_life.y_pos, 15);
    ellipse(t_life.x_pos+15, t_life.y_pos, 15);
    triangle(t_life.x_pos-7.8, t_life.y_pos+2.5, t_life.x_pos+22.2, t_life.y_pos+2.5, t_life.x_pos+7.5, t_life.y_pos+17.5);
    ellipse(t_life.x_pos+7.5, t_life.y_pos, 5);
}

// Canyon render and check functions
function drawCanyon(t_canyon){
    noStroke();
    fill(100, 155, 255);
    rect(t_canyon.x_pos,floorPos_y,t_canyon.width,144);
}
function checkCanyon(t_canyon){
    //falling in canyon 
    if(gameChar_y==floorPos_y){
        if(gameChar_world_x>=t_canyon.x_pos && gameChar_world_x<=t_canyon.x_pos+t_canyon.width){
            isPlumeting=true;
            gameChar_y+=1;
            gameoverSound.play();
        }
    }
}

// Collectable items render and check functions
function drawCollectable(t_collectable){
    if(t_collectable.isFound==false){
        noStroke();
        fill(0,0,205); 
        ellipse(t_collectable.x_pos, t_collectable.y_pos+332, t_collectable.size-15,t_collectable.size); 
        fill("white");
        stroke("white");
        textSize(t_collectable.size/4); 
        text("m", t_collectable.x_pos-5, t_collectable.y_pos+330);
        noStroke();
        //shadow 
        noStroke();
        fill(192,192,192,100);
        ellipse(t_collectable.x_pos, t_collectable.y_pos+380,t_collectable.size-15,t_collectable.size-35);
    }
}
function checkCollectable(t_collectable){
    d = (dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos));
    
    if(d<357.67722879713773 && gameChar_y == floorPos_y){
        t_collectable.isFound = true; 
        game_score += 1;
        collectSound.play();
    }
}

function createPlatform(x, y, length){
    var p = {
        x: x, 
        y: y,
        length: length, 
        draw: function(){
            noStroke(); 
            fill(145,69,25);
            rect(this.x, this.y, this. length, 20);
            fill(0,155,0); 
            rect(this.x, this.y, this. length, 3);
        },
        checkContact: function(gc_x, gc_y){
            //checks if gamechar on platform 
            if(gc_x>this.x && gc_x < this.x+this.length){
                var d = this.y-gc_y;
                if(d>=0 && d<5){
                    return true;
                }
            }
            return false;
        }
    }
    
    return p; 
    
}

function Enemy(x, y, range){
    this.x = x; 
    this.y = y;
    this.range = range; 
    this.current_x = x; 
    this.incr = 1; 
    
    this.draw = function(){
        //body
        fill(192, 192, 192);
        ellipse(this.current_x, this.y - 15, 30); 
        triangle(this.current_x+15, this.y-15, this.current_x-15, this.y-15, this.current_x, this.y-45);
        //pink tummy 
        fill(255, 228, 225);
        ellipse(this.current_x, this.y-10, 20); 
        //face
        fill(128, 128, 128);
        triangle(this.current_x, this.y-30, this.current_x-13, this.y-50, this.current_x+13, this.y-50);
        ellipse(this.current_x-13, this.y-50, 15);
        ellipse(this.current_x+13, this.y-50, 15);
        //pink ears 
        fill(255, 228, 225);
        ellipse(this.current_x-13, this.y-48, 10);
        ellipse(this.current_x+13, this.y-48, 10);
        //eyes
        fill(0);
        ellipse(this.current_x-4, this.y-45, 4, 3);
        ellipse(this.current_x+4, this.y-45, 4, 3);
        //feet
        fill(0);
        ellipse(this.current_x-6, this.y, 7, 4);
        ellipse(this.current_x+6, this.y, 7, 4);
    }
    
    this.update = function(){
        this.current_x += this.incr;
        
        if(this.current_x < this.x){
            this.incr = 1; 
        }
        else if(this.current_x>this.x+this.range){
            this.incr = -1; 
        }
    } 
    
    this.isContact = function(gc_x, gc_y){
        var d = dist(gc_x, gc_y, this.current_x, this.y); 
        if(d<25){
            return true; 
        }
        return false;
    }
}

function preload(){
    
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    
    collectSound = loadSound('assets/collect.wav');
    collectSound.setVolume(0.1);
    
    gameoverSound = loadSound('assets/gameover.wav');
    gameoverSound.setVolume(0.1);
    
    winnerSound = loadSound('assets/winner.wav');
    winnerSound.setVolume(0.1);
}
