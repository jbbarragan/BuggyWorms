let scene, camera, renderer;
let earth, iss;
let video, videoTexture;

init();
animate();

function init() {
    // Escena
    scene = new THREE.Scene();

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.z = 700;

    // Renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Fondo de video
    setupVideoBackground();

    // Esfera de Saturno
    const saturnGeometry = new THREE.SphereGeometry(100, 32, 32);
    const saturnTexture = new THREE.TextureLoader().load('https://static.vecteezy.com/system/resources/previews/002/284/795/non_2x/abstract-background-of-saturn-surface-vector.jpg');
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: saturnTexture });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    scene.add(saturn);

    // Crear los anillos de Saturno
    createSaturnRings(saturn.position);

    // Esfera de la Tierra
    const earthGeometry = new THREE.SphereGeometry(50, 32, 32); // Ajusta el tamaño según sea necesario
    const earthTexture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/9/9b/Earth_political_divisions.jpg'); // Asegúrate de usar una textura válida
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial); // Inicializa 'earth'
    scene.add(earth);
}

function createSaturnRings(position) {
    const ringCount = 7;
    const ringRadius = 150; // Ajustar para estar más cerca de Saturno
    const ringThickness = 3;

    for (let i = 0; i < ringCount; i++) {
        const ringGeometry = new THREE.TorusGeometry(ringRadius, ringThickness, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: 0.6, transparent: true });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Girar el anillo para que esté horizontal
        ring.position.copy(position);
        ring.position.y += (i - ringCount / 2) * 5; // Ajusta el espacio entre los anillos
        scene.add(ring);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de la Tierra
    if (earth) {
        earth.rotation.y += 0.01; // Asegúrate de que 'earth' esté definido
    }

    renderer.render(scene, camera);
}

function setupVideoBackground() {
    // Crear el elemento de video
    video = document.createElement('video');
    video.src = '../img/fondo1.mp4'; // Asegúrate de que esta ruta sea correcta
    video.load();
    video.loop = true;

    video.addEventListener('loadeddata', function () {
        video.play();
    });

    // Crear textura a partir del video
    videoTexture = new THREE.VideoTexture(video);

    // Crear una esfera grande para el fondo
    const sphereGeometry = new THREE.SphereGeometry(5000, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.5
    });
    const videoSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(videoSphere);
}

// Ajustar el tamaño del canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
