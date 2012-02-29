//Declare variables before other scripts.
//This can't be the best way to do it, but it works for now.
//Maybe use some async script loader like require.js?

var pi = Math.PI,
    tau = 2 * pi,
    halfpi = pi / 2;

var world = [],
    currentLevel = 1,
    numLevels = 3,
    dimensions = {},
    
    cubeSize = 10,
    fov = 70,

    numAnimals = 10,
    absorbed = 0;

var rand, randbool, randColour;

var paused = true,
    flying = false,
    begun = false;
    
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

var DOM;
var died = false;
var startPos;

var animalsAreDefinedInLevelFile;

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

var updatePos, canMove;

var keyboard = new THREEx.KeyboardState(),
    settings,
    music;