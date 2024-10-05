let scene, camera, renderer, controls;
let planets = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let video;
let cube;

// Crear etiquetas para las posiciones del cubo
const labels = {
    top: { x: 0, y: 100, z: 0 },
    bottom: { x: 0, y: -100, z: 0 },
    front: { x: 0, y: 0, z: 100 },
    back: { x: 0, y: 0, z: -100 },
    left: { x: -100, y: 0, z: 0 },
    right: { x: 100, y: 0, z: 0 }
};

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

    // Crear el cubo para cambiar la vista
    createCubeHelper();

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
        { radius: 1, distance: 10, texture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8BsVr__MysKQ6BCotY5BEK0G1hDyrN6zEg&s', url: 'mercurio.html' },
        { radius: 1.5, distance: 15, texture: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg', url: 'venus.html' },
        { radius: 2, distance: 20, texture: 'https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg', url: './planetas/tierra.html' },
        { radius: 1.8, distance: 25, texture: 'https://cdn.pixabay.com/photo/2020/02/04/17/04/map-4818860_1280.jpg', url: 'marte.html' },
        { radius: 4, distance: 35, texture: 'https://external-preview.redd.it/JJTceYLFNKh1trdhGTiDAku5dMw24H61e8xyi2_TS6g.jpg?auto=webp&s=1f3d29a36611e75f0fa8bf6e25865809a41771ad', url: 'jupiter.html' },
        { radius: 3, distance: 45, texture: 'https://1.bp.blogspot.com/-KBL1f1hFhWI/Xnk2-C_qlQI/AAAAAAAAUKY/7g78bkJUTMYKtkhUMtOLD_BFiwwnNFQqgCLcBGAsYHQ/s1600/2k_saturn.jpg', url: 'saturno.html', hasRings: true },
        { radius: 2.5, distance: 55, texture: 'https://www.rtve.es/imagenes/462126main-image-1686-946-710/1276194002537.jpg', url: 'urano.html' },
        { radius: 2.2, distance: 65, texture: 'https://static.vecteezy.com/system/resources/previews/002/097/266/original/abstract-background-of-neptune-surface-free-vector.jpg', url: 'neptuno.jpg' }
    ];

    // Crear planetas y órbitas
    planetData.forEach(data => {
        const planetTexture = textureLoader.load(data.texture);
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({ map: planetTexture });
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = data.distance;
        planet.userData = { url: data.url };
        planets.push({ planet, distance: data.distance });

        if (data.hasRings) {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.1, data.radius * 1.5, 64); // Ajuste de tamaño
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7 // Ajustar opacidad
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2; // Alinear el anillo
            planet.add(rings); // Añadir los anillos como hijos del planeta Saturno
        }

        const orbitGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;

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

// Función para crear el cubo interactivo
function createCubeHelper() {
    const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // Crear etiquetas en las caras del cubo
    const loader = new THREE.FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        for (const [key, position] of Object.entries(labels)) {
            const textGeometry = new THREE.TextGeometry(key, {
                font: font,
                size: 1,
                height: 0.1
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.copy(position).normalize().multiplyScalar(5.5);
            textMesh.lookAt(cube.position);
            cube.add(textMesh);
        }
    });

    // Posicionar el cubo en la esquina
    cube.position.set(0, 0, 0);
    
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
        obj.planet.position.x = obj.distance * Math.cos(time);
        obj.planet.position.z = obj.distance * Math.sin(time);
    });

    renderer.render(scene, camera);
}

// Evento de clic para cambiar la posición de la cámara al hacer clic en una cara del cubo
function onDocumentClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);

    if (intersects.length > 0) {
        const faceIndex = intersects[0].faceIndex;

        if (faceIndex < 2) {
            camera.position.set(labels.top.x, labels.top.y, labels.top.z);
        } else if (faceIndex < 4) {
            camera.position.set(labels.bottom.x, labels.bottom.y, labels.bottom.z);
        } else if (faceIndex < 6) {
            camera.position.set(labels.front.x, labels.front.y, labels.front.z);
        }
        controls.update();
    }
}

// Llamar la función de clic
window.addEventListener('click', onDocumentClick);

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
