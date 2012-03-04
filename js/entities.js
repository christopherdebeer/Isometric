var Entity = function(){
    this.position = new THREE.Vector3();
    this.animationIncrement = cubeSize / 10;
    this.isAnimating = false;
    this.distanceToMove = 0;

    this.canMove = function(axis, direction){
        //Calculate the place the cube would be if it moved,
        //return true if that place is available

        var p, q;
        p = this.arrayPosition

        // if (axis === 'y' && direction === -1 && p.y === 0){
        //     return true; //Allow blocks to fall below the bottom of the world
        // }

        q = {x: p.x, y: p.y, z: p.z};
        q[axis] += direction;
        
        //Check that the cube is within the bounds of the world
        if (
            q.x < 0 || q.x >= dimensions.x ||
            q.z < 0 || q.z >= dimensions.z ||
            q.y < 0 || q.y >= dimensions.y
        ){
            return false;
        }

        //Detect collisions with other entities
        for (var i = 0; i < animalsdata.length; i++) {
            var pos = animalsdata[i].arrayPosition;
            if (q.x === pos.x && q.z == pos.y && q.y === pos.z){
                return false;
            }
        }

        //Detect collisions with the world
        var cell = world[q.y][q.x][q.z];
        if(empty.indexOf(cell) !== -1){
            return true;
        }
        //console.log('hit');
    };

    this.updatePos = function(axis, direction){
        //Don't try to move it again if its currently in the process of moving
        if (this.isAnimating){ return; }

        if (this.canMove(axis, direction)){
            this.isAnimating = true;
            this.arrayPosition[axis] += direction;
            this.distanceToMove = cubeSize;
            this.axis = axis;
            this.direction = direction;
        }
    };
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

    this.colour = Random.colour();
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