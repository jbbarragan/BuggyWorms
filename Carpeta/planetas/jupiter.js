let scene, camera, renderer;
let earth, iss;
let video, videoTexture;
let isTraveling = false; // Para controlar el estado del viaje
let travelTime = 2000; // Duración del viaje en milisegundos
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

    // Esfera de la Tierra (100 veces más grande)
    const earthGeometry = new THREE.SphereGeometry(150, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://external-preview.redd.it/JJTceYLFNKh1trdhGTiDAku5dMw24H61e8xyi2_TS6g.jpg?auto=webp&s=1f3d29a36611e75f0fa8bf6e25865809a41771ad');
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

// Agregar evento de clic a la Tierra
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
        // Calcular la posición del mouse
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Actualizar el raycaster
        raycaster.setFromCamera(mouse, camera);

        // Calcular objetos intersectados
        const intersects = raycaster.intersectObject(earth);

        // Si se intersectó la Tierra
        if (intersects.length > 0) {
            travelToEarth();
        }
    });
}

function travelToEarth() {
    if (isTraveling) return; // Evitar múltiples clics
    isTraveling = true;

    // Animación de viaje alrededor de la Tierra
    const startTime = Date.now();
    const startPosition = camera.position.clone(); // Posición inicial de la cámara
    const endPosition = new THREE.Vector3(0, 0, 700); // Posición final (vuelve a la Tierra)

    function animateTravel() {
        const elapsedTime = Date.now() - startTime;
        const t = Math.min(elapsedTime / travelTime, 1); // Normalizar el tiempo entre 0 y 1

        // Movimiento de la cámara
        const angle = t * Math.PI * 2; // Un viaje alrededor de la Tierra
        camera.position.x = Math.cos(angle) * 300; // Radio del viaje
        camera.position.z = Math.sin(angle) * 300;

        // Enfocar hacia la Tierra
        camera.lookAt(earth.position);

        if (t < 1) {
            requestAnimationFrame(animateTravel);
        } else {
            // Volver a la posición inicial
            camera.position.copy(startPosition);
            camera.lookAt(earth.position);
            isTraveling = false; // Viaje completado
            setTimeout(() => {
                window.location.href = '../index.html'; // Redirigir a index.html después de un breve retraso
            }, 500);
        }
    }

    animateTravel();
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de la Tierra
    earth.rotation.y += 0.01;

    renderer.render(scene, camera);
}

function setupVideoBackground() {
    // Crear el elemento de video
    video = document.createElement('video');
    video.src = '../img/fondo1.mp4';
    video.load();
    video.play();
    video.loop = true;

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
