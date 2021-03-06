const canvas = document.getElementById("tetris"); //Grab the canvas
const ctx = canvas.getContext("2d"); //Get the context of the canvas

//Going to be used by update
let dropCounter = 0;
let dropInterval = 1000; //This is in MS, 1000 = 1 second
let lastTime = 0;

let scaleFactor = 20

const board = createMatrix(canvas.width/scaleFactor,canvas.height/scaleFactor)

// Tetrominos
const tetrominos = [
    { //I Shape
       shape : [
           [0, 1, 0, 0],
           [0, 1, 0, 0],
           [0, 1, 0, 0],
           [0, 1, 0, 0]
       ],
       color : "skyblue"
   },
   { //L Shape
       shape : [
           [0, 2, 0],
           [0, 2, 0],
           [0, 2, 2],
       ],
       color : "orange"
   },
   { //J Shape
       shape : [
           [0, 3, 0],
           [0, 3, 0],
           [3, 3, 0],
       ],
       color : "pink"
   },
   { //O Shape
       shape : [
           [4, 4],
           [4, 4],
       ],
       color : "yellow"
   },
   { //Z Shape
       shape : [ 
           [5, 5, 0],
           [0, 5, 5],
           [0, 0, 0],
       ],
       color : "red"
   },
   
   { //S Shape
       shape : [ 
           [0, 6, 6],
           [6, 6, 0],
           [0, 0, 0],
       ],
       color : "green"
   },
   { //T Shape
           shape : [
               [7,7,7],
               [0,7,0],
               [0,0,0]
           ],
           color : "purple"
       }
]


// Player's Object
const player ={
    pos: { x: 5, y: 0},
    tetromino: getTetromino()
}

function resetPlayer(){
    player.tetromino = getTetromino();
    player.pos = {x : ((board[0].length/2 | 0) - player.tetromino.shape[0].length/2 | 0),
                  y: 0}

    //Check for lose condition
    if(collisions(board,player)){
        board.forEach(row => row.fill(0)) //Reset board
    }
    clearLines();
}

function getTetromino(){
        return tetrominos[Math.floor(Math.random() * 7)]
}

function createMatrix(w,h){
    const matrix =[];
    while(h--){
        matrix.push(new Array(w).fill(0))
    }
    return matrix;
}

function resizeCanvas(){
    //  canvas.width = window.innerWidth;
    //  canvas.height = window.innerHeight;
    canvas.width = 240;
    canvas.height = 400;
    ctx.scale(scaleFactor,scaleFactor) //Scale each pixel 
    update()
}

function draw(){
    //Draw a black canvas
    ctx.fillStyle = '#000'; 
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawMatrix(board,{x:0,y:0}) //Draw the board
    drawMatrix(player.tetromino.shape,player.pos) //Draw the active Player Tetronmino
}

function drawMatrix(matrix,offset){
    matrix.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if(value){ //Check if we have a non-0 value at this position
                if(value === tetrominos.length) 
                    ctx.fillStyle = tetrominos[value-1].color
                else
                    ctx.fillStyle = tetrominos[value].color ;
                ctx.fillRect(x+offset.x,y+offset.y,1,1);
            }
        })
    })
}

function drawTetromino(tetromino,offset){
    tetromino.shape.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if(value){ //Check if we have a non-0 value at this position
                ctx.fillStyle = tetromino.color;
                ctx.fillRect(x+offset.x,y+offset.y,1,1);
            }
        })
    })
}

function collisions(board,player){
    const m = player.tetromino.shape;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && //Check if this position has a value
               (board[y + o.y] && //Check if it's a valid row
                board[y + o.y][x + o.x]) !== 0) { //Check if there's a non-zero value at this position, Note: We need valid row and non-zero value for this check
                return true;
            }
        }
    }
    return false; //Else we do not
}

function moveTetromino(offset){
    player.pos.x += offset; //Assume no collision
    if(collisions(board,player)){ 
        player.pos.x -= offset; //We found a collision, undo what we just did
    }
}


function moveTetrominoDown(){
    player.pos.y++;
    if(collisions(board,player)){
        player.pos.y--;
        updateState(board,player);
        resetPlayer();
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.tetromino.shape, dir);
    while (collisions(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.tetromino.shape[0].length) {
            rotate(player.tetromino, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function tick(){
    moveTetrominoDown(); //Increase the Y value
    dropCounter = 0; //Reset the counter otherwise the piece will free fall
}

function updateState(board,player){
    player.tetromino.shape.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if(value){
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}

function update(time = 0){
    const deltaTime = time - lastTime;
    
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        tick();
    }
    lastTime = time;
    draw();
    requestAnimationFrame(update); //Call update before next frame
}

function clearLines() {
    let rowCount = 1;
    outer: for (let y = board.length -1; y > 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;

        rowCount *= 2;
    }
}


//Event Handlers
window.addEventListener('resize',resizeCanvas,false)  //Handles resizes
window.addEventListener('keydown',event=>{
    switch(event.keyCode){
        case 37: //Left arrow
            moveTetromino(-1);
            break;
        case 39: //Right arrow
            moveTetromino(1);
            break;
        case 40: //Down arrow
            moveTetrominoDown();
            break;
        case 90: //Z key
            playerRotate(-1);
            break;
        case 88: //X key
            playerRotate(1);
            break;
    }
})
resizeCanvas();
