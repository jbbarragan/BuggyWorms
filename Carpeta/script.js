let scene, camera, renderer, controls;
let planets = [];
let trails = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let video;
const MAX = 499;  // Límite superior
const MIN = -499; // Límite inferior

function limitCameraPosition() {
    const distanceFromOrigin = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
    if (distanceFromOrigin > MAX) {
        const scale = MAX / distanceFromOrigin;
        camera.position.x *= scale;
        camera.position.y *= scale;
        camera.position.z *= scale;
    }
}

function init() {
    // Crear la escena
    scene = new THREE.Scene();

    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // Crear el renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Crear controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Agregar video de fondo
    setupVideoBackground();

    // Crear el Sol usando la misma función
    const sun = createPlanet({
        radius: 5,
        textureUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHdGxTN_mqLCVMzlhBrWDmdMVl5z0xVnUcgw&s',
        position: { x: 0, y: 0, z: 0 }
    });
    scene.add(sun);

    // Datos de los planetas
    const planetData = [
        { radius: 1, distance: 10, texture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8BsVr__MysKQ6BCotY5BEK0G1hDyrN6zEg&s', url: 'mercurio.html', eccentricity: 0.2, inclination: 66 },
        { radius: 1.5, distance: 15, texture: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg', url: 'venus.html', eccentricity: 0.1, inclination: 76 },
        { radius: 2, distance: 20, texture: 'https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg', url: './planetas/tierra.html', eccentricity: 0.017, inclination: 140 },
        { radius: 1.8, distance: 25, texture: 'https://cdn.pixabay.com/photo/2020/02/04/17/04/map-4818860_1280.jpg', url: 'marte.html', eccentricity: 0.093, inclination: 112 },
        { radius: 4, distance: 35, texture: 'https://external-preview.redd.it/JJTceYLFNKh1trdhGTiDAku5dMw24H61e8xyi2_TS6g.jpg?auto=webp&s=1f3d29a36611e75f0fa8bf6e25865809a41771ad', url: 'jupiter.html', eccentricity: 0.048, inclination: 120 },
        { radius: 3, distance: 45, texture: 'https://1.bp.blogspot.com/-KBL1f1hFhWI/Xnk2-C_qlQI/AAAAAAAAUKY/7g78bkJUTMYKtkhUMtOLD_BFiwwnNFQqgCLcBGAsYHQ/s1600/2k_saturn.jpg', url: 'saturno.html', hasRings: true, eccentricity: 0.056, inclination: 110 },
        { radius: 2.5, distance: 55, texture: 'https://www.rtve.es/imagenes/462126main-image-1686-946-710/1276194002537.jpg', url: 'urano.html', eccentricity: 0.046, inclination: 128 },
        { radius: 2.2, distance: 65, texture: 'https://static.vecteezy.com/system/resources/previews/002/097/266/original/abstract-background-of-neptune-surface-free-vector.jpg', url: 'neptuno.jpg', eccentricity: 0.009, inclination: 220 }
    ];

    // Crear planetas y órbitas con inclinación
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
        //scene.add(orbit);

        // Crear trazo para el planeta
        const trail = createTrail();
        trails.push(trail);
        scene.add(trail);
    });

    // Crear el cinturón de asteroides entre Marte y Júpiter
    createAsteroidBelt();

    // Luz
    const light = new THREE.PointLight(0xffffff, 1.5, 1000);
    light.position.set(0, 0, 0);
    scene.add(light);

    // Comenzar animación
    animate();
}

// Función para crear planetas o el Sol
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

// Crear trazo para un planeta
function createTrail() {
    const trailLength = 5000;  // Ajusta el número de puntos
    const trailGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(trailLength * 3);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    return new THREE.Line(trailGeometry, trailMaterial);
}

// Actualizar la trayectoria del planeta
function updateTrail(trail, position) {
    const positions = trail.geometry.attributes.position.array;

    for (let i = positions.length - 3; i > 0; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
    }

    positions[0] = position.x;
    positions[1] = position.y;
    positions[2] = position.z;

    trail.geometry.attributes.position.needsUpdate = true;
}

// Función para crear órbitas
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
    orbit.rotation.z = THREE.Math.degToRad(inclination); // Inclinación en radianes
    return orbit;
}

//crear asteroides
function createAsteroidBelt() {
    const numAsteroids = 900;  // Más asteroides
    const beltRadiusMin = 30;  // Radio mínimo (alrededor de Marte)
    const beltRadiusMax = 30;  // Radio máximo (antes de Júpiter)
    const asteroidSize = 0.3;  // Tamaño de los asteroides

    const textureLoader = new THREE.TextureLoader();
    const asteroidTexture = textureLoader.load('https://static.vecteezy.com/system/resources/previews/046/105/391/non_2x/high-resolution-image-texture-of-asteroid-stone-craters-photo.jpg');  // Textura de asteroides

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

// Función para configurar el video de fondo
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

// Animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    planets.forEach((obj, index) => {
        const speed = 0.0001 * (index + 1);
        const time = Date.now() * speed;

        const a = obj.distance;
        const b = obj.distance * Math.sqrt(1 - obj.eccentricity ** 2);

        // Movimiento de la órbita con inclinación
        obj.planet.position.x = a * Math.cos(time);
        obj.planet.position.z = b * Math.sin(time);

        // Ajustar la posición 'y' para tener en cuenta la inclinación
        obj.planet.position.y = obj.planet.position.z * Math.tan(THREE.Math.degToRad(obj.inclination));

        // Actualizar la trayectoria (rastro) del planeta
        updateTrail(trails[index], obj.planet.position);
    });

    renderer.render(scene, camera);
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
