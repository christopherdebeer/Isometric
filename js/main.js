$(document).ready(function(){
    String.prototype.replaceAt=function(index, char) {
      return this.substr(0, index) + char + this.substr(index+char.length);
   };

    var camera, scene, renderer,
        geometry, material,
        cubes = [],
        cameraOffset = [7, 5, 7];

    var mouse, projector, ray, floor;
    
    var mousepos = {
        x : 0,
        y : 0
    };
    
    var world = [],
        dimensions = {},
        playercube,
        //worldSize = 20,
        //numLayers = 5,
        cubeSize = 1,
        fov = 70,

        numAnimals = 5;

    var gravity = 0;//0.00981;

    var paused = false,
        flying = true,
        tick = 1;

    var colours = [
        null,
        0x0CA80C, //grass green
        0x0D4FBF, //water blue
        0x5C3C06 //mud brown
    ],
        animals = [],
        animalsdata = [];

    var player = new Player();

    var createWorld = function(){
        // for (var i = 0; i < numLayers; i++) {
        //     world.push([]);
        //     for (var j = 0; j < worldSize; j++) {
        //         world[i].push([]);
        //         for (var k = 0; k < worldSize; k++) {
        //             if(i === 0){
        //                 world[i][j].push(i + 1);
        //             }
        //             else if(i === 1){
        //                 world[i][j].push(randbool(0.5) ? 3 : 1);
        //             }
        //             else if(i === 2){
        //                 world[i][j].push(randbool(0.5) ? 0 : 1);
        //             }
        //             else {
        //                 world[i][j].push(0);
        //             }
        //         }
        //     }
        // }
        $.getJSON('world.json', function(data){
            world = data.world;
            dimensions.y = world.length;
            renderWorld();
        });
    };

    var rand = function(scale){
        scale = scale || 1;
        return Math.random() * scale;
    };

    var randint = function(low, high){
        return Math.floor(Math.random() + 1) * x;
    };

    var randbool = function(x){
        x = x || 0.5;
        return Math.random() > x;
    };

    var randColour = function(){
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };

    var renderWorld = function(){
        var i, j, k,
            layer, line, cell;
        
        for (i = 0; i < dimensions.y; i++) {
            layer = world[i];
            dimensions.x = layer.length;

            for (j = 0; j < dimensions.x; j++) {
                line = layer[j].split('');
                dimensions.z = line.length;

                for (k = 0; k < dimensions.z; k++) {
                    cell = +line[k];

                    if(cell !== 0){
                        var pos = new THREE.Vector3(j, i, k);
                        pos.multiplyScalar(cubeSize);
                        cubes.push(addCube(cubeSize, pos, colours[cell], false));
                    }
                }
            }
        }
        //console.log(dimensions);
        player.position.addSelf(new THREE.Vector3(j / 2 - 1, 1, k / 2 - 1));
        playercube.position = player.position;
        moveCamera();
    };

    var render = function(){
        if (paused) { return; }

        renderer.render(scene, camera);
    };

    var logic = function(){
        if (paused) { return; }

        // if (player.b > 0){
        //     playercube.position[player.axis] += 0.1 * player.direction;
        //     player.b--;
        // }
        playercube.position = player.position;


        for (var i = 0; i < animals.length; i++) {
            var axis = randbool() ? 'z' : 'x',
                dir = randbool() ? 1 : -1,
                animal = animals[i];
            updatePos(animal, axis, dir);
            updatePos(animal, 'y', -1);
            var p = player.position, a = animal.position;
            if (p.x === a.x && p.y === a.y && p.z === a.z){
                //console.log("absorb");
                animals.splice(i);
                animalsdata.splice(i);
                scene.remove(animals[i]);
            }

            //animals[i].position[axis] += dir * 1;//addSelf(animalsdata[i].speed);
        }

        //Some falling stuff
        updatePos(player, 'y', -1);
    };

    var canMove = function(thing, axis, direction){
        //Calculate the place the cube would be if it moved,
        //return true if that place is available
        var p = thing.position,
            q = {x: p.x, y: p.y, z: p.z};
            q[axis] += direction;

        //Check that the cube is within the bounds of the world
        if (q.x < 0 || q.x >= dimensions.x){
            return false;
        }
        if (q.z < 0 || q.z >= dimensions.z){
            return false;
        }
        if (q.y < 0 || q.y >= dimensions.y){
            return false;
        }
        //Check whether the block is empty
        if(world[q.y][q.x].charAt(q.z) === '0'){
            return true;
        }
        //console.log('hit');
    };

    var updatePos = function(thing, axis, direction){
        if (canMove(thing, axis, direction)){
            thing.position[axis] += direction;
            // thing.b = 1;
            // thing.axis = axis;
            // thing.direction = direction;
        }
    };

    var moveCamera = function(){
        var c = cameraOffset;
        var tmp = new THREE.Vector3(c[0], c[1], c[2]);
        tmp.addSelf(player.position);
        camera.position = tmp;
    };

    var bindInputs = function(){
        // var setSpeed = function(direction, angle){
        //     if (player.position.x >= 0 || player.position.z >= 0){
        //         player.speed.x += direction * player.step * Math.sin(angle);
        //         player.speed.z += direction * player.step * Math.cos(angle);
        //     }
        // };

        key('w', function(){
            //setSpeed(-1, player.rotation.angle.x);
            updatePos(player, 'z', -1);
            moveCamera();
        });

        key('a', function(){
            //setSpeed(-1, player.rotation.angle.x + halfpi);
            updatePos(player, 'x', -1);
            moveCamera();
        });

        key('s', function(){
            //setSpeed(1, player.rotation.angle.x);
            updatePos(player, 'z', 1);
            moveCamera();
        });

        key('d', function(){
            //setSpeed(1, player.rotation.angle.x + halfpi);
            updatePos(player, 'x', 1);
            moveCamera();
        });

        key('space', function(){
            updatePos(player, 'y', 1);
            moveCamera();
        });

        key('\\', function(){
            updatePos(player, 'y', -1);
            moveCamera();
        });

        // key('l', function(){ player.rotation.speed.x -= 0.1; });
        // key('k', function(){ player.rotation.speed.x += 0.1; });

        key('p', function(){ paused = !paused; });
        key('f', function(){ flying = !flying; });

        // $("canvas").click(function(e){
        //     mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        //     mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        //     ray.direction = projector.unprojectVector( mouse.clone(), camera );
        //     ray.direction.subSelf( camera.position ).normalize();

        //     intersects = ray.intersectObject(floor);
        //     console.log(intersects);
        //     // var pos = new THREE.Vector3(
        //     //     (player.position.x + 10) * Math.cos(player.rotation.angle.x),
        //     //     player.position.y,
        //     //     (player.position.z + 10) * Math.sin(player.rotation.angle.x)
        //     // );
        //     addCube(cubeSize, intersects.point, 0x0000ff, cubes, false);
        // });

        // $("canvas").mousemove(function(e){
        //     //rotate the view based on the distance moved relative to the previous frame
        //     var scaling = 0.005,
        //         x = e.clientX,
        //         y = e.clientY,
        //         deltax = mousepos.x - x,
        //         deltay = mousepos.y - y;
        //     player.rotation.speed.x = deltax * scaling;
        //     player.rotation.speed.y = deltay * scaling;

        //     //save previous values for next time
        //     mousepos.x = x;
        //     mousepos.y = y;
        // });
    };

    var init = function(){
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);
        scene.add(camera);
        //camera.rotation.x = -0.4;
        camera.rotation.y = pi / 4;

        addLight(170, 330, -160);
        addLight(-170, 330, 160);

        // var fog = new THREE.Fog();
        // fog.color = 0x444444;
        // fog.near = 40;
        // scene.fog = fog;

        createWorld();
        
        for (var i = 0; i < numAnimals; i++) {
            var a = new Animal();
            animalsdata.push(a);
            animals.push(addCube(a.height, a.position, a.colour, true));
        }

        // addPlane();
        playercube = addCube(cubeSize, player.position, 0x0000ff, true);

        //mouse = new THREE.Vector3( 0, 0, 1 );
        //projector = new THREE.Projector();
        //ray = new THREE.Ray( camera.position );

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true;

        $('body').append(renderer.domElement);

        $('canvas').css({background : 'skyblue'});

        bindInputs();
    };

    var animate = function(){
        requestAnimationFrame(animate);
        render();
    };

    



    // var applyFriction = function(thing){
    //     //thing.friction = thing.accel.multiplyScalar(0.1);
    //     thing.speed.multiplyScalar(0.9);
    // };

    // var jump = function(thing, dir){
    //     if (flying){
    //         //player.speed.y = dir * 0.04;
    //         thing.position.y += dir;
    //     } else {
            
    //     }
    // };

    var addCube = function(size, position, colour, shadows){
        geometry = new THREE.CubeGeometry(size, size, size);
        material = new THREE.MeshLambertMaterial({color: colour});

        mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = shadows;
        mesh.receiveShadow = true;

        mesh.position.addSelf(position);
        
        scene.add(mesh);

        return mesh;
    };

    var addLight = function(x, y, z){
        var light = new THREE.SpotLight();
        light.position.set(x, y, z);
        light.castShadow = true;
        scene.add(light);
        return light;
    };

    init();
    animate();
    var foo = window.setInterval(logic, 200);
});
