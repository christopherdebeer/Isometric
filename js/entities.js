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

var Entity = function(){
    this.position = new THREE.Vector3();
    this.animationIncrement = cubeSize / 10;
    this.isAnimating = false;
    this.distanceToMove = 0;

};

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Animal.prototype = new Entity();
Animal.prototype.constructor = Animal;

function Player(x, y, z){
    this.arrayPosition = new THREE.Vector3(x, y, z);
    this.position = new THREE.Vector3();
    
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);
    this.colour = 0xff0000;
    this.texture = textures.player;
}

function Animal(x, y, z){
    this.arrayPosition = new THREE.Vector3(x, y, z);

    this.position = new THREE.Vector3();
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);

    this.colour = randColour();
    this.height = cubeSize;
    this.width = cubeSize;
}

var Goal = function(x, y, z){
    this.arrayPosition = new THREE.Vector3(x, y, z);
    this.position = new THREE.Vector3();
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);
    this.height = cubeSize;
    this.colour = 0xD4AF37; //gold

};