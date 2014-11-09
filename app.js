//colours
var default_colour = "#F1D4AF";
var floor_colour = "#E08E79";
var player_colour = "#FFFFFF";
var health_colour_4 = "#FFB2B2";
var health_colour_3 = "#ff6666";
var health_colour_2 = "#ff0000";
var health_colour_1 = "#990000";
var health_colour_0 = "#4c0000";
var bat_colour = "#000000";

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
var enemies = [];

//general
var screen_width = columns*font_size*0.6;
var screen_height = rows*font_size;

//modifiers
var max_caves = 5;
var min_caves = 1;
var min_size = 20;
var max_size = 60;
var min_enemies = 3;
var max_enemies = 10;

//setup the game
var game = new Phaser.Game(screen_width, screen_height, Phaser.AUTO, 'container', { preload: preload, create: create, update: update, render: render });

function preload() {
  game.stage.backgroundColor = '#3B3B3B';
}

function create() {
  //position the container
  $('#container').css('width', screen_width + 'px');
  $('#container').css('margin', '0 auto');
  $('#content').css('width', screen_width + 'px');
  $('#content').css('margin', '0 auto');

  $('#generate').click(function() {
    reset();
  });

  min_caves = ($('#min-caves').val() != '' ? +($('#min-caves').val()) : min_caves);
  max_caves = ($('#max-caves').val() != '' ? +($('#max-caves').val()) : max_caves);
  min_size = ($('#min-cave-size').val() != '' ? +($('#min-cave-size').val()) : min_size);
  max_size = ($('#max-cave-size').val() != '' ? +($('#max-cave-size').val()) : max_size);

  //generate map
  generateMap();

  //add enemies
  populateObjects();

  //Keyboard controls
  cursors = game.input.keyboard.createCursorKeys();
  cursors.left.onDown.add(move, this);
  cursors.right.onDown.add(move, this);
  cursors.up.onDown.add(move, this);
  cursors.down.onDown.add(move, this);

  //enemy movement timer
  game.time.events.loop(Phaser.Timer.SECOND, moveEnemies, this);
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

function moveEnemies() {
  for(var x=0; x<enemies.length; x++) {
    //randomly select a direction
    var enemy = enemies[x];
    var row = enemy.y;
    var column = enemy.x;
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
    enemy.updatePosition(column,row);
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
  var number_of_caves = Math.floor((Math.random() * max_caves) + min_caves);
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

function returnArrayOfPositionsWithSymbol(symbol) {
  var position_array = [];
  for(var y=0; y<map.length; y++) {
    for(var x=0; x<map[y].length; x++) {
      if(map[y][x] == symbol) {
        var position = {row: y, column: x};
        position_array.push(position);
      }
    }
  }
  return position_array;
}

function returnEnemyAtPosition(row, column) {
  for(var x=0; x<enemies.length; x++) {
    var enemy = enemies[x];
    if(enemy.y==row && enemy.x==column) {
      return enemy;
    }
  }
  return null;
}

function populateObjects() {
  //fetch all positions that contain the floor symbol
  var possible_positions = returnArrayOfPositionsWithSymbol('.');
  //randomly calculate a number of enemies to add
  var number_of_enemies = Math.floor((Math.random() * max_enemies) + min_enemies);
  for(var x=0; x<number_of_enemies; x++) {
    //randomly select an index from the possible start positions
    var index = Math.floor((Math.random() * (possible_positions.length-1)));
    if(index >= 0)
    {
      //select the position from the array
      var position = possible_positions[index];
      //create an enemy and push it to the enemies array
      var enemy = new Enemy(position.column,position.row,'b',bat_colour);
      enemies.push(enemy);
      //remove the index from the possible positions so that another enemy can't be placed there
      possible_positions.splice(index, 1);
    }
  }

  //place player
  var index = Math.floor((Math.random() * (possible_positions.length-1)));
  var position = possible_positions[index];
  player = new Player(position.column,position.row);
}

function debugMap() {
  //console.log("test");
}

function reset() {
  game.state.start(game.state.current);
}

//Entities
function Player(x, y) {
  this.x = x;
  this.y = y;
  this.colour = player_colour;
  this.health = 5;
  updateSymbol(y,x,'@',this.colour);
}

Player.prototype.updatePosition = function(x, y) {
  if(symbolAtPosition(y,x) == '.')
  {
    updateSymbol(this.y,this.x,'.',floor_colour);
    updateSymbol(y,x,'@',this.colour);
    this.x = x;
    this.y = y;
  }
  else if(symbolAtPosition(y,x) == 'b')
  {
    var enemy = returnEnemyAtPosition(y,x);
    enemy.updateHealth(-1);
  }
}

Player.prototype.updateHealth = function(health) {
  this.health += health;
  if(this.health >= 5) {
    this.colour = player_colour;
  }
  else if(this.health == 4) {
    this.colour = health_colour_4;
  }
  else if(this.health == 3) {
    this.colour = health_colour_3;
  }
  else if(this.health == 2) {
    this.colour = health_colour_2;
  }
  else if(this.health == 1) {
    this.colour = health_colour_1;
  }
  else if(this.health <= 0) {
    this.colour = health_colour_0;
  }
  updateSymbol(this.y,this.x,'@',this.colour);
}

function Enemy(x, y, symbol, colour) {
  this.x = x;
  this.y = y;
  this.symbol = symbol;
  this.colour = colour;
  this.original_colour = colour;
  this.health = 2;
  updateSymbol(this.y,this.x,symbol,colour);
}

Enemy.prototype.updatePosition = function(x, y) {
  if(symbolAtPosition(y,x) == '.')
  {
    updateSymbol(this.y,this.x,'.',floor_colour);
    updateSymbol(y,x,this.symbol,this.colour);
    this.x = x;
    this.y = y;
  }
  else if(symbolAtPosition(y,x) == '@')
  {
    player.updateHealth(-1);
  }
}

Enemy.prototype.updateHealth = function(health) {
  this.health += health;
  if(this.health >= 2) {
    this.colour = original_colour;
  }
  else if(this.health == 1) {
    this.colour = health_colour_1;
  }
  else if(this.health <= 0) {
    this.colour = health_colour_0;
  }
  updateSymbol(this.y,this.x,this.symbol,this.colour);
  if(this.health <= 0) {
    this.remove();
  }
}

Enemy.prototype.remove = function() {
  //takes care of map and screen
  updateSymbol(this.y,this.x,'.',floor_colour);
  //remove the enemy from the array
  for(var x=0; x<enemies.length; x++) {
    if(enemies[x].x == this.x && enemies[x].y == this.y) {
      enemies.splice(x,1);
    }
  }
}