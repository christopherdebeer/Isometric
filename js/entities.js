var pi = Math.PI,
        tau = 2 * pi,
        halfpi = pi / 2;

var Player = function(){
    this.position = new THREE.Vector3();
    this.speed = new THREE.Vector3();
    this.rotation = {
        speed : new THREE.Vector3(),
        angle : new THREE.Vector3()
    };
    this.accel = new THREE.Vector3(0, -9.8, 0);
    this.friction = new THREE.Vector3();
    this.step = 0.1;
    this.maxSpeed = 0.2;
    this.a = 9;
    this.b = 0;
};

var Animal = function(d){
    this.position = new THREE.Vector3(
        THREE.Math.randInt(2, d.x - 3),
        1,
        THREE.Math.randInt(2, d.z - 3)
    );
    this.colour = 0xff0000;//randColour();
    this.height = 1;
    this.width = 5;
    this.angle = Math.random() * tau;
    //console.log(this.angle);
    this.speed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        0,
        (Math.random() - 0.5) * 0.01
    );
    this.accel = -1;
};