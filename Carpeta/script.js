let scene, camera, renderer, controls;
let planets = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let video;

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

    // Crear el Sol
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const sunTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHdGxTN_mqLCVMzlhBrWDmdMVl5z0xVnUcgw&s');
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Datos de los planetas
    const planetData = [
        { radius: 1, distance: 10, texture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8BsVr__MysKQ6BCotY5BEK0G1hDyrN6zEg&s', url: 'mercurio.html', eccentricity: 0.2, inclination: 7 },
        { radius: 1.5, distance: 15, texture: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg', url: 'venus.html', eccentricity: 0.1, inclination: 3.4 },
        { radius: 2, distance: 20, texture: 'https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg', url: './planetas/tierra.html', eccentricity: 0.017, inclination: 0 },
        { radius: 1.8, distance: 25, texture: 'https://cdn.pixabay.com/photo/2020/02/04/17/04/map-4818860_1280.jpg', url: 'marte.html', eccentricity: 0.093, inclination: 1.85 },
        { radius: 4, distance: 35, texture: 'https://external-preview.redd.it/JJTceYLFNKh1trdhGTiDAku5dMw24H61e8xyi2_TS6g.jpg?auto=webp&s=1f3d29a36611e75f0fa8bf6e25865809a41771ad', url: 'jupiter.html', eccentricity: 0.048, inclination: 1.3 },
        { radius: 3, distance: 45, texture: 'https://1.bp.blogspot.com/-KBL1f1hFhWI/Xnk2-C_qlQI/AAAAAAAAUKY/7g78bkJUTMYKtkhUMtOLD_BFiwwnNFQqgCLcBGAsYHQ/s1600/2k_saturn.jpg', url: 'saturno.html', hasRings: true, eccentricity: 0.056, inclination: 2.5 },
        { radius: 2.5, distance: 55, texture: 'https://www.rtve.es/imagenes/462126main-image-1686-946-710/1276194002537.jpg', url: 'urano.html', eccentricity: 0.046, inclination: 0.8 },
        { radius: 2.2, distance: 65, texture: 'https://static.vecteezy.com/system/resources/previews/002/097/266/original/abstract-background-of-neptune-surface-free-vector.jpg', url: 'neptuno.jpg', eccentricity: 0.009, inclination: 1.77 }
    ];

    // Crear planetas y órbitas con inclinación
    planetData.forEach(data => {
        const planetTexture = textureLoader.load(data.texture);
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({ map: planetTexture });
        const planet = new THREE.Mesh(geometry, material);
        planet.userData = { url: data.url };
        planets.push({ planet, distance: data.distance, eccentricity: data.eccentricity });

        if (data.hasRings) {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.1, data.radius * 1.5, 64);
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

        const orbitGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        
        // Aplicar inclinación en radianes
        orbit.rotation.x = Math.PI / 2;
        orbit.rotation.z = THREE.Math.degToRad(data.inclination); // Inclinación en grados

        scene.add(planet);
        scene.add(orbit);
    });

    // Luz
    const light = new THREE.PointLight(0xffffff, 1.5, 1000);
    light.position.set(0, 0, 0);
    scene.add(light);

    // Comenzar animación
    animate();
}

// Función para configurar el video de fondo
function setupVideoBackground() {
    // Crear el elemento de video
    video = document.createElement('video');
    video.src = 'img/fondo1.mp4'; // Ruta al video
    video.load();
    video.play();
    video.loop = true; // Hacer que el video se repita

    // Crear textura a partir del video
    const videoTexture = new THREE.VideoTexture(video);

    // Crear una esfera que será el fondo
    const sphereGeometry = new THREE.SphereGeometry(500, 64, 64); // Ajusta el tamaño según sea necesario
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.BackSide, // Usar el lado interior
        transparent: true, // Habilitar la transparencia
        opacity: 0.5 // Ajustar la opacidad (0.0 a 1.0)
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Colocar la esfera en el centro de la escena
    scene.add(sphere);
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    planets.forEach((obj, index) => {
        const speed = 0.0001 * (index + 1);
        const time = Date.now() * speed;

        // Parámetros de la órbita elíptica
        const a = obj.distance; // Semi-eje mayor
        const b = obj.distance * Math.sqrt(1 - obj.eccentricity ** 2); // Semi-eje menor

        // Actualizar la posición del planeta para una órbita elíptica
        obj.planet.position.x = a * Math.cos(time);
        obj.planet.position.z = b * Math.sin(time);
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

