$(document).ready(function(){
    String.prototype.replaceAt=function(index, char) {
      return this.substr(0, index) + char + this.substr(index+char.length);
   };

    var camera, scene, renderer,
        geometry, material,
        rendering = true,
        cubes = [],
        cameraOffset = new THREE.Vector3(4, 6, 7).multiplyScalar(cubeSize);

    //var mouse, projector, ray, floor;

    var fps,
        oldTime = +new Date(),
        tick = 1;

    var DOM = {
        fps: $("#fps"),
        absorbed: $("#absorbed"),
        game: $("#game")

    };

    var GUI = {
        setAbsorbed: function(){
            var plural = absorbed === 1 ? '' : 's';
            DOM.absorbed.text(absorbed + " other cube" + plural + " absorbed");
        }
    };
    
    // var mousepos = {
    //     x : 0,
    //     y : 0
    // };
    
    //var gravity = 0.00981;

    var paused = false,
        flying = false;
        
    var colours = [
        null,
        0x333333, //grey
        0x0CA80C, //grass green
        0x0D4FBF, //water blue
        0x5C3C06 //mud brown
    ];

    var animalscubes = [],
        animalsdata = [],
        playerdata,
        goaldata;

    var createWorld = function(){
        $.getJSON('worlds/' + currentLevel + '.json', function(data){
            animalscubes = [];
            animalsdata = [];
            cubes = [];

            world = data.world;
            var s = data.startPosition,
                g = data.goalPosition;

            dimensions.y = world.length;
            parseWorld();

            goaldata = new Goal(g);
            playerdata = new Player(s);

            playercube = addCube(cubeSize, playerdata.position, playerdata.colour, true);
            goalcube = addCube(cubeSize, goaldata.position, goaldata.colour, true);
            
            playercube.position = playerdata.position;
            goalcube.position = goaldata.position;

            moveCamera();

            for (var i = 0; i < numAnimals; i++) {
                var a = new Animal(dimensions);
                animalsdata.push(a);
                animalscubes.push(addCube(a.height, a.position, a.colour, true));
            }
        });
    };

    var clearScene = function(){
        var i;
        for (i = 0; i < cubes.length; i++) {
            var cube = cubes[i];
            scene.remove(cube);
        }
        for (i = 0; i < animalscubes.length; i++) {
            var animal = animalscubes[i];
            scene.remove(animal);
        }
        scene.remove(playercube);
        scene.remove(goalcube);
    };

    var parseWorld = function(){
        var i, j, k,
            layer, line, cell;
        
        for (i = 0; i < dimensions.y; i++) {
            layer = world[i];

            for (j = 0; j < layer.length; j++) {
                line = layer[j].split('');

                for (k = 0; k < line.length; k++) {
                    cell = +line[k];

                    if(cell !== 0){
                        var pos = new THREE.Vector3(j, i, k);
                        pos.multiplyScalar(cubeSize);
                        cubes.push(addCube(cubeSize, pos, colours[cell], true));
                    }
                }
            }

        }

        dimensions.x = j;
        dimensions.z = k;
    };

    var render = function(){
        if (paused) { return; }

        renderer.render(scene, camera);
    };

    var logic = function(time){
        if (paused) { return; }

        var i;

        tick = tick > 100 ? 1 : tick + 1;
        fps = Math.round(1000 / (time - oldTime));
        oldTime = time;

        var numEntities = animalscubes.length + 1;
        for (i = 0; i < numEntities; i++) {
            var entity, data;
            if (i === numEntities - 1){
                entity = playercube;
                data = playerdata;

                if(!flying){
                    updatePos(playerdata, 'y', -1);
                }
            } else {
                entity = animalscubes[i];
                data = animalsdata[i];

                var axis = randbool() ? 'z' : 'x',
                    dir = randbool() ? 1 : -1;

                updatePos(data, axis, dir);
                updatePos(data, 'y', -1);

                //This should be replaced with vector1.equals(vector2) if
                //the method appears. Couldn't find it in Chrome.
                if (playerdata.arrayPosition.distanceTo(data.arrayPosition) === 0){
                    console.log("absorb");
                    scene.remove(entity);
                    //animalscubes.splice(i);
                    //animalsdata.splice(i);
                    absorbed++;
                }
            }
            if (data.distanceToMove > 0){
                data.position[data.axis] += data.animationIncrement * data.direction;
                data.distanceToMove -= data.animationIncrement;
            }
            if (data.distanceToMove === 0){
                data.isAnimating = false;
            }

            entity.position = data.position;
        }
        moveCamera();

        //This should be replaced with vector1.equals(vector2) if
        //the method appears. Couldn't find it in Chrome.
        if (playerdata.arrayPosition.distanceTo(goaldata.arrayPosition) === 0){
            if (currentLevel < numLevels){
                rendering = false;

                alert("You win the current level");
                currentLevel++;

                clearScene();
                createWorld();

                rendering = true;
                run();

                return;
            } else {
                alert("You've finished the game");
            }
        }

        //These don't need updating every frame
        if (tick % 20 === 0){
            DOM.fps.text(fps + " FPS");
            GUI.setAbsorbed();
        }
        
    };

    var canMove = function(thing, axis, direction){
        //Calculate the place the cube would be if it moved,
        //return true if that place is available
        //console.log(thing);

        var p = thing.arrayPosition,
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

        //Check whether the block is empty
        if(world[q.y][q.x].charAt(q.z) === '0'){
            return true;
        }
        //console.log('hit');
    };

    var updatePos = function(thing, axis, direction){
        //Don't try to move it again if its currently in the process of moving
        if (thing.isAnimating){ return; }

        if (canMove(thing, axis, direction)){
            thing.isAnimating = true;
            thing.arrayPosition[axis] += direction;
            thing.distanceToMove = cubeSize;
            thing.axis = axis;
            thing.direction = direction;
        }
    };

    var moveCamera = function(){
        camera.position = cameraOffset.clone().addSelf(playerdata.position);
        camera.lookAt(playerdata.position);
    };

    var bindInputs = function(){
        //Try and bind these keys in a loop, lots of duplication here
        //Couldn't get it to work previously.

        $.getJSON('settings.json', function(data){
            var k = data.keyboard.movement;
            key(k.forwards, function(){
                updatePos(playerdata, 'z', -1);
            });

            key(k.left, function(){
                updatePos(playerdata, 'x', -1);
            });

            key(k.back, function(){
                updatePos(playerdata, 'z', 1);
            });

            key(k.right, function(){
                updatePos(playerdata, 'x', 1);
            });

            key(data.keyboard.jump.up, function(){
                var p = playerdata.arrayPosition;
                //Check if there's a block underneath before letting the player jump
                if(flying || (p.y === 0 || world[p.y - 1][p.x].charAt(p.z) !== '0')){
                    updatePos(playerdata, 'y', 1);
                }
            });

            key(data.keyboard.jump.down, function(){
                updatePos(playerdata, 'y', -1);
            });

            key(data.keyboard.misc.pause, function(){ paused = !paused; });
            key(data.keyboard.fly, function(){ flying = !flying; });

        });
    };

    var init = function(){
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100 * cubeSize);
        scene.add(camera);

        addLight(17 * cubeSize, 33 * cubeSize, -16 * cubeSize);
        addLight(-17 * cubeSize, 33 * cubeSize, 16 * cubeSize);

        // var fog = new THREE.Fog();
        // fog.color = 0x444444;
        // fog.near = 40;
        // scene.fog = fog;

        createWorld();

        //mouse = new THREE.Vector3( 0, 0, 1 );
        //projector = new THREE.Projector();
        //ray = new THREE.Ray( camera.position );

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth - 300, window.innerHeight - 50);
        renderer.shadowMapEnabled = true;

        DOM.game.append(renderer.domElement);
        GUI.setAbsorbed();

        $('canvas').css({background : 'skyblue'});

        bindInputs();
    };

    var run = function(time){
        if (rendering){
            requestAnimationFrame(run);
            render();
            logic(time);
        }
    };

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
        var light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(x, y, z);
        light.castShadow = true;
        scene.add(light);
        return light;
    };

    init();
    run();
});
