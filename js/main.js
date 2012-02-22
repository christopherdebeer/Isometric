$(document).ready(function(){
    String.prototype.replaceAt=function(index, char) {
      return this.substr(0, index) + char + this.substr(index+char.length);
   };

    var camera, scene, renderer,
        geometry, material,
        cubes = [],
        cameraOffset = [4 * cubeSize, 6 * cubeSize, 4 * cubeSize];

    var mouse, projector, ray, floor;

    var fps,
        oldTime = +new Date(),
        tick = 1;

    var DOM = {
        fps: $("#fps"),
        absorbed: $("#absorbed"),
        game: $("#game")

    };
    
    var mousepos = {
        x : 0,
        y : 0
    };
    
    var gravity = 0;//0.00981;

    var paused = false,
        flying = false;
        

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
        $.getJSON('world.json', function(data){
            world = data.world;
            dimensions.y = world.length;
            parseWorld();
            for (var i = 0; i < numAnimals; i++) {
                var a = new Animal(dimensions);
                animalsdata.push(a);
                animals.push(addCube(a.height, a.position, a.colour, true));
            }
        });
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

        //console.log(dimensions);

        player.arrayPosition.addSelf(new THREE.Vector3(j / 2 - 1, 1, k / 2 - 1));
        player.position.addSelf(player.arrayPosition);
        player.position.multiplyScalar(cubeSize);
        playercube.position = player.position;
        moveCamera();
    };

    var rand = function(scale){
        scale = scale || 1;
        return Math.random() * scale;
    };

    var randbool = function(x){
        x = x || 0.5;
        return Math.random() > x;
    };

    var randColour = function(){
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
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

        var numEntities = animals.length + 1;
        for (i = 0; i < numEntities; i++) {
            var entity, data;
            if (i === numEntities - 1){
                entity = playercube;
                info = player;

                if(!flying){
                    updatePos(player, 'y', -1);
                }
            } else {
                entity = animals[i];
                info = animalsdata[i];

                var axis = randbool() ? 'z' : 'x',
                    dir = randbool() ? 1 : -1;

                updatePos(info, axis, dir);
                updatePos(info, 'y', -1);

                var p = player.arrayPosition,
                    a = info.arrayPosition;
                if (p.x === a.x && p.y === a.y && p.z === a.z){
                    console.log("absorb");
                    //animals.splice(i);
                    //animalsdata.splice(i);
                    //scene.remove(animals[i]);
                    absorbed++;
                }
            }

            if (info.distanceToMove > 0){
                info.position[info.axis] += info.animationIncrement * info.direction;
                info.distanceToMove -= info.animationIncrement;
            }
            if (info.distanceToMove === 0){
                info.isAnimating = false;
            }

            entity.position = info.position;
        }
        moveCamera();

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
        var c = cameraOffset;
        var tmp = new THREE.Vector3(c[0], c[1], c[2]);
        tmp.addSelf(player.position);
        camera.position = tmp;
        camera.lookAt(player.position);
    };

    var bindInputs = function(){
        key('w', function(){
            updatePos(player, 'z', -1);
        });

        key('a', function(){
            updatePos(player, 'x', -1);
        });

        key('s', function(){
            updatePos(player, 'z', 1);
        });

        key('d', function(){
            updatePos(player, 'x', 1);
        });

        key('space', function(){
            var p = player.arrayPosition;
            //Check if there's a block underneath before letting the player jump
            if(flying || (p.y === 0 || world[p.y - 1][p.x].charAt(p.z) !== '0')){
                updatePos(player, 'y', 1);
            }
        });

        key('\\', function(){
            updatePos(player, 'y', -1);
        });

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

        camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100 * cubeSize);
        scene.add(camera);

        addLight(17 * cubeSize, 33 * cubeSize, -16 * cubeSize);
        addLight(-17 * cubeSize, 33 * cubeSize, 16 * cubeSize);

        // var fog = new THREE.Fog();
        // fog.color = 0x444444;
        // fog.near = 40;
        // scene.fog = fog;

        createWorld();
        
        playercube = addCube(cubeSize, player.position, 0x0000ff, true);

        //mouse = new THREE.Vector3( 0, 0, 1 );
        //projector = new THREE.Projector();
        //ray = new THREE.Ray( camera.position );

        renderer = new THREE.WebGLRenderer();
        var border = 100;
        renderer.setSize(window.innerWidth - border, window.innerHeight - border);
        renderer.shadowMapEnabled = true;

        DOM.game.append(renderer.domElement);
        GUI.setAbsorbed();

        $('canvas').css({background : 'skyblue'});

        bindInputs();
    };

    var run = function(time){
        requestAnimationFrame(run);
        render();
        logic(time);
    };

    var GUI = {
        setAbsorbed: function(){
            var plural = absorbed === 1 ? '' : 's';
            DOM.absorbed.text(absorbed + " other cube" + plural + " absorbed");
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
