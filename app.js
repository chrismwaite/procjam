//colours
var default_colour = "#F1D4AF";
var floor_colour = "#E08E79";
var player_colour = "#FFFFFF";

//size
var columns = 40;
var rows = 20;

var font_size = 28;
var default_style = { font: font_size + "px monospace", fill:default_colour};
var cursors;

//data
var map = [];
var display = [];

//entities
var player;

//general
var player_x = 0;
var player_y = 0;
var screen_width = columns*font_size*0.6;
var screen_height = rows*font_size;

//setup the game
var game = new Phaser.Game(screen_width, screen_height, Phaser.AUTO, 'container', { preload: preload, create: create, update: update, render: render });

function preload() {
  
}

function create() {
  //position the container
  $('#container').css('width', screen_width + 'px');
  $('#container').css('margin', '0 auto');

  //generate map
  generateMap();

  //Keyboard controls
  cursors = game.input.keyboard.createCursorKeys();
  cursors.left.onDown.add(move, this);
  cursors.right.onDown.add(move, this);
  cursors.up.onDown.add(move, this);
  cursors.down.onDown.add(move, this);

  //place player
  player = new Player(player_x,player_y);
}

function move(key) {
  if(key.event.keyIdentifier == "Left")
  {
    player.updatePosition(player.x-1,player.y);
  }
  else if(key.event.keyIdentifier == "Right") {
    player.updatePosition(player.x+1,player.y);
  }
  else if(key.event.keyIdentifier == "Up") {
    player.updatePosition(player.x,player.y-1);
  }
  else if(key.event.keyIdentifier == "Down") {
    player.updatePosition(player.x,player.y+1);
  }
}

function update() {

}

function render() {
  //special cases - good for debug
}

// ######## MAP GENERATION ######### //

function generateCave(size) {
  var row = Math.floor(Math.random() * (rows-1));
  var column = Math.floor(Math.random() * (columns-1));

  updateSymbol(row, column, '.');

  //store this as a possible player position
  player_x = column;
  player_y = row;
  
  for(var x=0; x<size; x++)
  {
    switch(Math.floor((Math.random() * 4) + 1)) {
      //north
      case 1:
        row-1 > 0 ? row-=1 : row=row;
        break;
      //east
      case 2:
        column+1 < columns ? column+=1 : column=column;
        break;
      //south
      case 3:
        row+1 < rows ? row+=1 : row=row;
        break;
      //west
      case 4:
        column-1 > 0 ? column-=1 : column=column;
        break;
    }

    updateSymbol(row, column, '.', floor_colour);
    //now mine the area around it
    updateSymbol(row-1, column, '.', floor_colour);
    updateSymbol(row+1, column, '.', floor_colour);
    updateSymbol(row, column-1, '.', floor_colour);
    updateSymbol(row, column+1, '.', floor_colour);
  }
}

//procedurally builds the map
function generateMap() {
  //first fill the screen with walls
  for(var y=0; y<rows; y++)
  {
    map[y] = [];
    display[y] = [];
    for(var x=0; x<columns; x++)
    {
      display[y][x] = game.add.text((font_size*0.6)*x, font_size*y, '#', default_style);
      map[y][x] = '#';
    }
  }

  //build caves
  var max_caves = 5;
  var min_caves = 1;
  var number_of_caves = Math.floor((Math.random() * max_caves) + min_caves);
  var min_size = 20;
  var max_size = 60;

  for(var x=0; x<number_of_caves; x++)
  {
    var size = Math.floor((Math.random() * max_size) + min_size);
    generateCave(size);
  }
  
}

// ######## END MAP GENERATION ######### //

function updateSymbol(row, column, symbol, colour) {
  if(typeof  colour === 'undefined') { colour = default_colour; }
  if(display[row] && display[row][column])
  {
    display[row][column].setText(symbol);
    display[row][column].setStyle({ font: font_size + "px monospace", fill:colour});
    map[row][column] = symbol;
  }
}

function symbolAtPosition(row, column) {
  if(display[row] && display[row][column])
  {
    return map[row][column];
  }
  return '';
}

function debugMap() {
  //console.log("test");
}

//Entities
function Player(x, y) {
  this.x = x;
  this.y = y;
  updateSymbol(y,x,'@',player_colour);
}

Player.prototype.updatePosition = function(x, y) {
  if(symbolAtPosition(y,x) == '.')
  {
    updateSymbol(this.y,this.x,'.',floor_colour);
    updateSymbol(y,x,'@',player_colour);
    this.x = x;
    this.y = y;
  }
}