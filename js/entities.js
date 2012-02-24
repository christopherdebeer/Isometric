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

function Player(p){
    this.arrayPosition = new THREE.Vector3(p.x, p.y, p.z);
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);
    this.colour = 0xff0000;
}

function Animal(d){
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
}

var Goal = function(p){
    this.arrayPosition = new THREE.Vector3(p.x, p.y, p.z);
    this.position = new THREE.Vector3();
    this.position.addSelf(this.arrayPosition);
    this.position.multiplyScalar(cubeSize);
    this.height = cubeSize;
    this.colour = 0xD4AF37; //gold

};