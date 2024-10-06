let scene, camera, renderer, controls;
let planets = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let video;
const MAX = 499;  // Límite superior
const MIN = -499; // Límite inferior
let planetPaths = [];

function limitCameraPosition() {
    const distanceFromOrigin = Math.sqrt(camera.position.x * 2 + camera.position.y * 2 + camera.position.z ** 2);
    if (distanceFromOrigin > MAX) {
        const scale = MAX / distanceFromOrigin;
        camera.position.x *= scale;
        camera.position.y *= scale;
        camera.position.z *= scale;
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 500;  // Límite de zoom
    controls.minDistance = 10;    // Límite mínimo de zoom

    setupVideoBackground();

    const sun = createPlanet({
        radius: 5,
        textureUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHdGxTN_mqLCVMzlhBrWDmdMVl5z0xVnUcgw&s',
        position: { x: 0, y: 0, z: 0 }
    });
    scene.add(sun);

    const planetData = [
        { radius: 1, distance: 10, texture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8BsVr__MysKQ6BCotY5BEK0G1hDyrN6zEg&s', url: './planetas/mercurio.html', eccentricity: 0.2, inclination: 66 },
        { radius: 1.5, distance: 15, texture: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg', url: './planetas/venus.html', eccentricity: 0.1, inclination: 76 },
        { radius: 2, distance: 20, texture: 'https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg', url: './planetas/tierra.html', eccentricity: 0.017, inclination: 140 },
        { radius: 1.8, distance: 25, texture: 'https://cdn.pixabay.com/photo/2020/02/04/17/04/map-4818860_1280.jpg', url: './planetas/marte.html', eccentricity: 0.093, inclination: 112 },
        { radius: 4, distance: 35, texture: 'https://external-preview.redd.it/JJTceYLFNKh1trdhGTiDAku5dMw24H61e8xyi2_TS6g.jpg?auto=webp&s=1f3d29a36611e75f0fa8bf6e25865809a41771ad', url: './planetas/jupiter.html', eccentricity: 0.048, inclination: 120 },
        { radius: 3, distance: 45, texture: 'https://1.bp.blogspot.com/-KBL1f1hFhWI/Xnk2-C_qlQI/AAAAAAAAUKY/7g78bkJUTMYKtkhUMtOLD_BFiwwnNFQqgCLcBGAsYHQ/s1600/2k_saturn.jpg', url: './planetas/saturno.html', hasRings: true, eccentricity: 0.056, inclination: 110 },
        { radius: 2.5, distance: 55, texture: 'https://www.rtve.es/imagenes/462126main-image-1686-946-710/1276194002537.jpg', url: './planetas/urano.html', eccentricity: 0.046, inclination: 128 },
        { radius: 2.2, distance: 65, texture: 'https://static.vecteezy.com/system/resources/previews/002/097/266/original/abstract-background-of-neptune-surface-free-vector.jpg', url: './planetas/neptuno.html', eccentricity: 0.009, inclination: 220 }
    ];

    planetData.forEach(data => {
        const planet = createPlanet({
            radius: data.radius,
            textureUrl: data.texture,
            position: { x: data.distance, y: 0, z: 0 },
            url: data.url,
            hasRings: data.hasRings,
            inclination: data.inclination
        });

        planets.push({ planet, distance: data.distance, eccentricity: data.eccentricity, inclination: data.inclination });

        const orbit = createOrbit(data.distance, data.inclination);
        scene.add(planet);
        // scene.add(orbit);

        planetPaths.push({
            planet: planet,
            points: [],
            completedOrbit: false,
            lastPosition: null
        });
    });

    createAsteroidBelt();

    const light = new THREE.PointLight(0xffffff, 1.5, 1000);
    light.position.set(0, 0, 0);
    scene.add(light);

    animate();
}

function createPlanet({ radius, textureUrl, position, url = null, hasRings = false, inclination = 0 }) {
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load(textureUrl);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(geometry, material);
    
    planet.position.set(position.x, position.y, position.z);
    planet.userData = { url };

    if (hasRings) {
        const ringGeometry = new THREE.RingGeometry(radius * 1.1, radius * 1.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }

    return planet;
}

function createOrbit(distance, inclination) {
    const orbitGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
       color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    orbit.rotation.z = THREE.Math.degToRad(inclination); 
    return orbit;
}

function createAsteroidBelt() {
    const numAsteroids = 900;
    const beltRadiusMin = 30;
    const beltRadiusMax = 30;
    const asteroidSize = 0.3;

    const textureLoader = new THREE.TextureLoader();
    const asteroidTexture = textureLoader.load('https://static.vecteezy.com/system/resources/previews/046/105/391/non_2x/high-resolution-image-texture-of-asteroid-stone-craters-photo.jpg');

    for (let i = 0; i < numAsteroids; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = THREE.MathUtils.lerp(beltRadiusMin, beltRadiusMax, Math.random());

        const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, 8, 8);
        const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTexture });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        asteroid.position.x = radius * Math.cos(angle);
        asteroid.position.z = radius * Math.sin(angle);
        asteroid.position.y = (Math.random() - 0.5) * 2;

        scene.add(asteroid);
    }
}

function setupVideoBackground() {
    video = document.createElement('video');
    video.src = 'img/fondo1.mp4';
    video.load();
    video.play();
    video.loop = true;

    const videoTexture = new THREE.VideoTexture(video);
    const sphereGeometry = new THREE.SphereGeometry(500, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.5
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    limitCameraPosition(); // Llamar a la función para limitar la posición de la cámara

    planets.forEach((obj, index) => {
        const speed = 0.0001 * (index + 1);
        const time = Date.now() * speed;

        const a = obj.distance;
        const b = obj.distance * Math.sqrt(1 - obj.eccentricity ** 2);

        obj.planet.position.x = a * Math.cos(time);
        obj.planet.position.z = b * Math.sin(time);
        obj.planet.position.y = obj.planet.position.z * Math.tan(THREE.Math.degToRad(obj.inclination));

        const planetPath = planetPaths[index];
        const initialPosition = { x: a, z: 0, y: 0 };

        if (isPlanetAtPosition(obj.planet.position, initialPosition)) {
            if (!planetPath.completedOrbit) {
                drawEllipse(planetPath.points);
                planetPath.completedOrbit = true;
            }
        } else {
            planetPath.completedOrbit = false;
        }

        planetPath.points.push(obj.planet.position.clone());
    });

    renderer.render(scene, camera);
}

function isPlanetAtPosition(planetPosition, initialPosition) {
    const threshold = 0.5; 
    return (
        Math.abs(planetPosition.x - initialPosition.x) < threshold &&
        Math.abs(planetPosition.z - initialPosition.z) < threshold
    );
}

function drawEllipse(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const ellipseLine = new THREE.Line(geometry, material);
    scene.add(ellipseLine);
}

function onDocumentDoubleClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.planet));

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const url = clickedPlanet.userData.url;
        window.open(url, '_blank');
    }
}

window.addEventListener('click', onDocumentDoubleClick);

init();