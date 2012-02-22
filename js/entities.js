var pi = Math.PI,
    tau = 2 * pi,
    halfpi = pi / 2;

var world = [],
    currentLevel = 2,
    numLevels = 3,
    dimensions = {},
    playercube,
    goalcube,
    //worldSize = 20,
    //numLayers = 5,
    cubeSize = 10,
    fov = 70,

    numAnimals = 10,
    absorbed = 0;

var rand, randbool, randColour;
rand = function(scale){
    scale = scale || 1;
    return Math.random() * scale;
};

randbool = function(x){
    x = x || 0.5;
    return Math.random() > x;
};

randColour = function(){
    return Math.floor(Math.random() * 16777215);
};

var Player = function(p){
    this.arrayPosition = new THREE.Vector3(p.x, p.y, p.z);
    this.position = new THREE.Vector3();
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);
    // this.speed = new THREE.Vector3();
    // this.rotation = {
    //     speed : new THREE.Vector3(),
    //     angle : new THREE.Vector3()
    // };
    //this.accel = new THREE.Vector3(0, -9.8, 0);
    //this.friction = new THREE.Vector3();
    //this.step = 0.1;
    //this.maxSpeed = 0.2;
    this.animationIncrement = cubeSize / 10;
    this.isAnimating = false;
    this.distanceToMove = 0;

    this.colour = 0x0000ff;
};

var Animal = function(d){
    this.arrayPosition = new THREE.Vector3(
        THREE.Math.randInt(2, d.x - 3),
        1,
        THREE.Math.randInt(2, d.z - 3)
    );

    this.position = new THREE.Vector3();
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);

    this.colour = randColour();
    this.height = cubeSize;
    this.width = cubeSize;

    this.animationIncrement = cubeSize / 10;
    this.isAnimating = false;
    this.distanceToMove = 0;
    // this.angle = Math.random() * tau;
    // console.log(this.angle);
    // this.speed = new THREE.Vector3(
    //     (Math.random() - 0.5) * 0.01,
    //     0,
    //     (Math.random() - 0.5) * 0.01
    // );
    // this.accel = -1;
};

var Goal = function(p){
    this.arrayPosition = new THREE.Vector3(p.x, p.y, p.z);
    this.position = new THREE.Vector3();
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);
    this.height = cubeSize;
    this.colour = 0xD4AF37; //gold

};