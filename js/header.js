//Declare variables before other scripts.
//This can't be the best way to do it, but it works for now.
//Maybe use some async script loader like require.js?

// var pi = Math.PI,
//     tau = 2 * pi,
//     halfpi = pi / 2;

var world = [], //3d array to hold level data
    cubes = [], //list of references to each cube that comprisises the world
    freeSpaces = [], //list of coordinates of 'air' in the world file
    dimensions = {}, //x y and z size of the world in cubes

    currentLevel = 1, //only for debug, no reason not to start on 1
    numberOfRandomlyPositionedAnimals = 0,
    cubeSize = 10,
    fov = 70,

    DOM,
    startPos,

    paused = true,
    flying = false,
    begun = false,
    died = false,
    muted = true, //false for production
    levelFinished = false,

    empty = "023gpa", //blocks that can be moved through
    dangerous = "3"; //blocks that cause death



var Random = function(scale){
    scale = scale || 1;
    return Math.random() * scale;
};

Random.bool = function(x){
    x = x || 0.5;
    return Math.random() > x;
};

Random.colour = function(){
    return Math.floor(Math.random() * 16777215);
};

Random.arr = function(arr, len){
    len = len || arr.length;
    return arr[Math.floor(Math.random() * len)];
};

// var colours = [
//     null,
//     0x0CA80C, //grass green
//     0x333333, //grey
//     0x0D4FBF, //water blue
//     0x5C3C06 //mud brown
// ];

var texPath = "images/textures/",
    texFiles = ['grey', 'player', 'water', 'fire'],
    textures = {};
for (var i = 0; i < texFiles.length; i++) {
    var file = texFiles[i];
    var tex = THREE.ImageUtils.loadTexture(texPath + file + '.png');
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    textures[file] = tex;
}

var timer,
    previousTimes = [],
    startTimer,
    timeString;

var animalscubes = [],
    animalsdata = [],

    playercube,
    goalcube,

    playerdata,
    goaldata;

var keyboard = new THREEx.KeyboardState(),
    settings,
    music;