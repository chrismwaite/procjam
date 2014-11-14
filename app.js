//colours
var default_colour = "#F1D4AF";
var floor_colour = "#E08E79";
var drone_colour = "#FF0000";
var player_colour = "#FFFFFF";
var health_colour_4 = "#FFB2B2";
var health_colour_3 = "#FF6666";
var health_colour_2 = "#FF0000";
var health_colour_1 = "#990000";
var health_colour_0 = "#4C0000";
var bat_colour = "#000000";
var snake_colour = "#D1F2A5";
var floor_types = [{symbol: '.', colour: '#E08E79'},{symbol: '~', colour: '#0EBFE9'},{symbol: '.', colour: '#7F9A65'}];

//size
var columns = 40;
var rows = 20;

var font_size = 28;
var default_style = { font: font_size + "px monospace", fill:default_colour};
var cursors;

//data
var map = [];
var display = [];
var enemy_types;

//entities
var player;
var enemies = [];

//generation
var mining_drones = [];
var corridoor_drone = 'ready';
var mining_event;
var cave_positions = [];

//general
var screen_width = columns*font_size*0.6;
var screen_height = rows*font_size;

//modifiers
var max_caves = 5;
var min_caves = 1;
var min_size = 20;
var max_size = 80;
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

  //setup enemy types
  enemy_types = [{symbol: 'b', colour: bat_colour},{symbol: 's', colour: snake_colour}];

  //generate map
  generateMap();

  //initialise the drones
  initialiseDrones();

  //build the caves
  mining_event = game.time.events.loop(250, buildLevel, this);
}

function postCreate() {
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

function initialiseDrones() {
  var number_of_drones = Math.floor((Math.random() * max_caves) + min_caves);
  for(var x=0; x<number_of_drones; x++)
  {
    var life = Math.floor((Math.random() * max_size) + min_size);
    var row = Math.floor(Math.random() * (rows-1));
    var column = Math.floor(Math.random() * (columns-1));
    var drone = new Drone(column, row, life);
    mining_drones.push(drone);
    //store the start positions for corridoors
    cave_positions.push({row: row, column: column});
  }
}

function buildLevel() {
  //mine caves
  for(var x=0; x<mining_drones.length; x++)
  {
    var drone = mining_drones[x];
    if(drone.life > 0) {
      drone.mine();
    }
    else {
      drone.die(x);
    }
  }
  //mine corridoors
  if(corridoor_drone != null && corridoor_drone != 'ready')
  {
    console.log('corridoor');
    corridoor_drone.corridoor();
  }

  //create the corridoor drone once the mining drones have finished
  if(mining_drones.length == 0 && corridoor_drone == 'ready')
  {
    var start = cave_positions[0];
    corridoor_drone = new Drone(start.column, start.row, 100);
    console.log('creating corridoor drone');
  }

  //populate the level once the drones are done
  if(mining_drones.length == 0 && corridoor_drone == null)
  {
    game.time.events.remove(mining_event);
    postCreate();
  }
}

function generateMap() {
  //first fill the screen with walls
  for(var y=0; y<rows; y++)
  {
    map[y] = [];
    display[y] = [];
    for(var x=0; x<columns; x++)
    {
      var tile = new Tile(x, y, '#', default_colour);
      display[y][x] = tile;
      map[y][x] = '#';
    }
  }
}

// ######## END MAP GENERATION ######### //

function updateSymbol(row, column, symbol, colour) {
  if(typeof  colour === 'undefined') { colour = default_colour; }
  if(display[row] && display[row][column])
  {
    display[row][column].updateSymbol(symbol);
    display[row][column].updateColour(colour);
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

function tileAtPosition(row, column) {
  var tile = null;
  if(display[row] && display[row][column])
  {
    return display[row][column];
  }
  return tile;
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
      //decide enemy type
      var enemy_type_index = Math.floor(Math.random() * (enemy_types.length));
      var enemy_type = enemy_types[enemy_type_index];
      //create an enemy and push it to the enemies array
      var enemy = new Enemy(position.column,position.row,enemy_type.symbol,enemy_type.colour);
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

function returnEnemyTypesAsArray() {
  var enemy_types_array = [];
  for(var x=0; x<enemy_types.length; x++) {
    enemy_types_array.push(enemy_types[x].symbol);
  }
  return enemy_types_array;
}

function debugMap() {
  //console.log("test");
}

function reset() {
  game.state.start(game.state.current);
}

//Entities
function Tile(x, y, symbol, colour) {
  this.symbol = symbol;
  this.original_colour = colour;
  this.colour = colour;
  this.text = game.add.text((font_size*0.6)*x, font_size*y, this.symbol, { font: font_size + "px monospace", fill:this.colour});
}

Tile.prototype.updateSymbol = function(symbol) {
  this.symbol = symbol;
  this.text.setText(this.symbol);
}

Tile.prototype.updateColour = function(colour) {
  this.colour = colour;
  this.text.setStyle({ font: font_size + "px monospace", fill:this.colour});
}

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
    var tile = tileAtPosition(this.y,this.x);
    updateSymbol(this.y,this.x,'.',tile.original_colour);
    updateSymbol(y,x,'@',this.colour);
    this.x = x;
    this.y = y;
  }
  //enemy detection
  else if($.inArray(symbolAtPosition(y,x),returnEnemyTypesAsArray()) != -1)
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
    var tile = tileAtPosition(this.y,this.x);
    updateSymbol(this.y,this.x,'.',tile.original_colour);
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
  var tile = tileAtPosition(this.y,this.x);
  updateSymbol(this.y,this.x,'.',tile.original_colour);
  //remove the enemy from the array
  for(var x=0; x<enemies.length; x++) {
    if(enemies[x].x == this.x && enemies[x].y == this.y) {
      enemies.splice(x,1);
    }
  }
}

function Drone(start_column, start_row, life) {
  this.column = start_column;
  this.row = start_row;
  this.life = life;
  this.colour = drone_colour;
  this.symbol = 'x';
  var floor_type = floor_types[Math.floor(Math.random() * (floor_types.length))];
  this.mine_colour = floor_type.colour;
  this.mine_symbol = floor_type.symbol;
  this.current_cave = 1;
  updateSymbol(this.row, this.column, this.symbol, this.colour);
}

Drone.prototype.mine = function() {
  if(this.life > 0)
  {
    updateSymbol(this.row, this.column, this.mine_symbol, this.mine_colour);
    updateSymbol(this.row-1, this.column, this.mine_symbol, this.mine_colour);
    updateSymbol(this.row+1, this.column, this.mine_symbol, this.mine_colour);
    updateSymbol(this.row, this.column-1, this.mine_symbol, this.mine_colour);
    updateSymbol(this.row, this.column+1, this.mine_symbol, this.mine_colour);

    //change the original tile colour - so that anything passing over this tile can utilise that colour
    var tile = tileAtPosition(this.row, this.column);
    if(tile!=null) {tile.original_colour = this.mine_colour};
    tile = tileAtPosition(this.row-1, this.column);
    if(tile!=null) {tile.original_colour = this.mine_colour};
    tile = tileAtPosition(this.row+1, this.column);
    if(tile!=null) {tile.original_colour = this.mine_colour};
    tile = tileAtPosition(this.row, this.column-1);
    if(tile!=null) {tile.original_colour = this.mine_colour};
    tile = tileAtPosition(this.row, this.column+1);
    if(tile!=null) {tile.original_colour = this.mine_colour};

    switch(Math.floor((Math.random() * 4) + 1)) {
      //north
      case 1:
        this.row-1 > 0 ? this.row-=1 : this.row=this.row;
        break;
      //east
      case 2:
        this.column+1 < columns ? this.column+=1 : this.column=this.column;
        break;
      //south
      case 3:
        this.row+1 < rows ? this.row+=1 : this.row=this.row;
        break;
      //west
      case 4:
        this.column-1 > 0 ? this.column-=1 : this.column=this.column;
        break;
    }

    updateSymbol(this.row, this.column, this.symbol, this.colour);
    //now mine the area around it
    updateSymbol(this.row-1, this.column, this.symbol, this.colour);
    updateSymbol(this.row+1, this.column, this.symbol, this.colour);
    updateSymbol(this.row, this.column-1, this.symbol, this.colour);
    updateSymbol(this.row, this.column+1, this.symbol, this.colour);

    this.life--;
  }
}

Drone.prototype.corridoor = function(index) {
  var next_point = cave_positions[this.current_cave];
  var column = this.column;
  var row = this.row;

  updateSymbol(this.row, this.column, this.mine_symbol, this.mine_colour);

  if(next_point.row > row)
  {
    this.row+1 < rows ? this.row+=1 : this.row=this.row;
  }
  else if(next_point.row < row)
  {
    this.row-1 > 0 ? this.row-=1 : this.row=this.row;
  }
  else if(next_point.column > column)
  {
    this.column+1 < columns ? this.column+=1 : this.column=this.column;
  }
  else if(next_point.column < column)
  {
    this.column-1 > 0 ? this.column-=1 : this.column=this.column;
  }

  updateSymbol(this.row, this.column, this.symbol, this.colour);

  //die
  if(column == next_point.column && row == next_point.row)
  {
    if(cave_positions[this.current_cave+1])
    {
      this.current_cave += 1;
    }
    else
    {
      console.log('corridoor drone dying');
      updateSymbol(this.row, this.column, this.mine_symbol, this.mine_colour);
      corridoor_drone = null;
    }
  }
}

Drone.prototype.die = function(index) {
  //remove drone from screen and map
  updateSymbol(this.row, this.column, this.mine_symbol, this.mine_colour);
  updateSymbol(this.row-1, this.column, this.mine_symbol, this.mine_colour);
  updateSymbol(this.row+1, this.column, this.mine_symbol, this.mine_colour);
  updateSymbol(this.row, this.column-1, this.mine_symbol, this.mine_colour);
  updateSymbol(this.row, this.column+1, this.mine_symbol, this.mine_colour);
  //remove drone from array
  mining_drones.splice(index, 1);
}