$(document).ready(function(){
   //  String.prototype.replaceAt=function(index, char) {
   //    return this.substr(0, index) + char + this.substr(index+char.length);
   // };

    var camera, scene, renderer,
        geometry, material,
        levelFinished = false,
        cubes = [],
        cameraOffset = new THREE.Vector3(4, 6, 7).multiplyScalar(cubeSize);

    //var mouse, projector, ray, floor;

    var oldTime = +new Date(),
        tick = 1;

    var ids = ['game', 'overlay', 'message', 'splash', 'timer'];
    DOM = {};
    for (var i = 0; i < ids.length; i++) {
        id = ids[i];
        DOM[id] = $('#' + id);
    }

    var empty = "023gpa", //blocks that can be moved through
        dangerous = "3"; //blocks that cause death

    var secs = 0,
        hundredths = 0;

    var GUI = {
        // setAbsorbed: function(){
        //     var plural = absorbed === 1 ? '' : 's';
        //     DOM.absorbed.text(absorbed + " other cube" + plural + " absorbed");
        // }
    };

    var muted = true; //false for production

    var freeSpaces = [];

    var stats = new Stats(),
        fpsCounter = $(stats.getDomElement()).addClass('fps');
    $('body').append(fpsCounter);
    window.setInterval(function(){ stats.update(); }, 1000 / 60);

    startTimer = function(){
        secs = 0;
        hundredths = 0;
        timer = window.setInterval(function(){
            if (paused) { return; }
            timeString = ((secs < 10 ? "0" : "") + secs);
            DOM.timer.text(timeString);
            hundredths++;
            secs = hundredths / 100;
        }, 10);
    };

    var loadMusic = function(){
        music = new Audio("audio/music/level" + currentLevel + ".ogg");
        //there's a loop property but its not supported everywhere so an event listener is letter for now.
        music.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        music.muted = muted;
        music.play();
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

    var createWorld = function(){
        animalscubes = [];
        animalsdata = [];
        cubes = [];
        animalsAreDefinedInLevelFile = false;

        playerdata = new Player(0, 0, 0);
        goaldata = new Goal(0, 0, 0);
        $.getJSON('worlds/' + currentLevel + '.json', function(data){
            world = data.world;

            //if you want randomly generated animals specify how many in this property of the level file
            //you can have a mix of random and level-defined ones, both or neither.
            numberOfRandomlyPositionedAnimals = data.numberOfRandomlyPositionedAnimals || 0;
            console.log(numberOfRandomlyPositionedAnimals);

            dimensions.y = world.length;
            parseWorld();

            playercube = addCube(cubeSize, playerdata.position, false, true, playerdata.texture);
            goalcube = addCube(cubeSize, goaldata.position, goaldata.colour, true);
            
            moveCamera();

            //console.log(freeSpaces);
            for (var i = 0; i < numberOfRandomlyPositionedAnimals; i++) {
                var pos = freeSpaces[Math.floor(Math.random() * freeSpaces.length)];

                var a = new Animal(pos.x, pos.y, pos.z);
                animalsdata.push(a);
                animalscubes.push(addCube(a.height, a.position, a.colour, true));
            }

            loadMusic();
            
        });
        startTimer();
    };

    //Add cubes to the scene based on level data
    var parseWorld = function(){
        var i, j, k,
            layer, line, cell;
        
        for (i = 0; i < dimensions.y; i++) {
            layer = world[i];

            for (j = 0; j < layer.length; j++) {
                line = layer[j].split('');

                cellsLoop:
                for (k = 0; k < line.length; k++) {
                    cell = line[k];
                    var texture = false;
                    switch (cell){
                        case '0':
                            if(i > 0 && world[i - 1][j][k] !== '0'){
                                freeSpaces.push({ x : j, y: i, z: k });
                            }
                            
                            break;
                        case 'p':
                            startPos = {x : j, y: i, z: k};
                            playerdata = new Player(j, i, k);
                            break;
                        case 'g':
                            goaldata = new Goal(j, i, k);
                            break;
                        case 'a':
                            animalsAreDefinedInLevelFile = true;
                            var a = new Animal(j, i, k);
                            animalsdata.push(a);
                            animalscubes.push(addCube(a.height, a.position, a.colour, true));
                            break;
                        case '1':
                            texture = textures.grey;
                            break;
                        case '2':
                            texture = textures.water;
                            break;
                        case '3':
                            texture = textures.fire;
                            break;
                    }

                    if(texture){
                        var pos = new THREE.Vector3(j, i, k);
                        pos.multiplyScalar(cubeSize);
                        cubes.push(addCube(cubeSize, pos, false, true, texture));
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
        //fps = Math.round(1000 / (time - oldTime));
        oldTime = time;

        checkKeyboard();
        
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
                    //console.log("absorb");
                    //scene.remove(entity);
                    //animalscubes.splice(i);
                    //animalsdata.splice(i);
                    //absorbed++;
                    die();
                }
            }
            if (data.distanceToMove > 0){
                data.position[data.axis] += data.animationIncrement * data.direction;
                data.distanceToMove -= data.animationIncrement;
            }
            if (data.distanceToMove === 0){
                data.isAnimating = false;
            }

            var a = data.arrayPosition;
            if (dangerous.indexOf(world[a.y][a.x][a.z]) !== -1){
                //The entity is on a block that causes death, like fire or spikes
                console.log("dead");
                if (data === playerdata){
                    die();
                } else {
                    scene.remove(entity);
                }
            }

            entity.position = data.position;
        }

        moveCamera();


        //This should be replaced with vector1.equals(vector2) if
        //the method appears. Couldn't find it in Chrome.
        if (playerdata.arrayPosition.distanceTo(goaldata.arrayPosition) === 0){
            levelFinished = true;
        }

        //These don't need updating every frame
        // if (tick % 20 === 0){

        // }
        
    };

    var die = function(){
        paused = true;
        window.clearInterval(timer);
        previousTimes.push(+timeString);
        var best = Math.max.apply(Math, previousTimes);
        var message = "Game Over" +
            "<br>You survived for " + timeString + " seconds" +
            "<br>Your best time is " + best + " seconds" +
            "<br>Press enter to restart";
        DOM.message.html(message);
        DOM.overlay.show();
        died = true;
    };

    canMove = function(thing, axis, direction){
        //Calculate the place the cube would be if it moved,
        //return true if that place is available

        var p, q;
        p = thing.arrayPosition;

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

    updatePos = function(thing, axis, direction){
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

    var init = function(){
        //Things that only happen once, when the page loads happen here
        //If it happens any other time, put it in an external function and call it here.
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100 * cubeSize);
        scene.add(camera);

        addLight(17 * cubeSize, 33 * cubeSize, -16 * cubeSize);
        addLight(-17 * cubeSize, 33 * cubeSize, 16 * cubeSize);

        // var fog = new THREE.Fog();
        // fog.color = 0x444444;
        // fog.near = 40;
        // scene.fog = fog;

        

        //mouse = new THREE.Vector3( 0, 0, 1 );
        //projector = new THREE.Projector();
        //ray = new THREE.Ray( camera.position );

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        var border = 20;
        renderer.setSize(window.innerWidth - border, window.innerHeight - border);
        renderer.shadowMapEnabled = true;

        DOM.game.append(renderer.domElement);
        //GUI.setAbsorbed();

        $('canvas').css({background : 'skyblue'});

        bindInputs();

        createWorld();
    };

    var run = function(time){
        if (levelFinished){
            console.log("You win the current level");
            currentLevel++;

            music.pause();

            clearScene();
            createWorld();

            levelFinished = false;
        }
        requestAnimationFrame(run);
        render();
        logic(time);

    };

    var addCube = function(size, position, colour, shadows, texture){
        geometry = new THREE.CubeGeometry(size, size, size);
        
        var args = {
            shading: THREE.SmoothShading
        };
        if (colour) {
            args.color = colour;
        }
        if (texture) {
            args.map = texture;
        }

        material = new THREE.MeshLambertMaterial(args);

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
