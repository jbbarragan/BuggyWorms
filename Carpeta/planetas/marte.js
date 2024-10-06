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

    // Esfera de la Tierra (100 veces más grande)
    const earthGeometry = new THREE.SphereGeometry(150, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://cdn.pixabay.com/photo/2020/02/04/17/04/map-4818860_1280.jpg');
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

// Agregar evento de clic a la Tierra
    earth.userData.interactable = true; // Marcar la Tierra como interactiva
    earth.callback = travelAroundEarth; // Asignar la función de viaje

    // Iniciar el rayo para detectar clics
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
        // Calcular la posición del mouse en el espacio de la escena
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Actualizar el rayo
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([earth]);

        if (intersects.length > 0) {
            // Si se hace clic en la Tierra, ejecutar la función de viaje
            travelAroundEarth();
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de la Tierra
    earth.rotation.y += 0.01;

    // Órbita de la ISS
    if (iss) {
        const time = Date.now() * 0.001;
        const issDistance = 250; // Distancia más corta de la ISS a la Tierra
        iss.position.set(Math.cos(time * 2) * issDistance, 0, Math.sin(time * 2) * issDistance);
        iss.rotation.y += 0.01; // Rotación de la ISS
    }

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
// Función para el viaje alrededor de la Tierra
function travelAroundEarth() {
    const travelDistance = 500; // Distancia del viaje
    const duration = 3000; // Duración del viaje en milisegundos
    const startTime = performance.now();

    function animateTravel() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Calcular nueva posición de la cámara
        const angle = progress * Math.PI * 2; // Completa un viaje alrededor de la Tierra
        camera.position.x = Math.cos(angle) * travelDistance;
        camera.position.z = Math.sin(angle) * travelDistance;

        // Mantener la cámara enfocada en la Tierra
        camera.lookAt(earth.position);

        if (progress < 1) {
            requestAnimationFrame(animateTravel); // Continuar animando
        } else {
            // Una vez terminado el viaje, volver a la posición inicial
            setTimeout(() => {
                window.location.href = '../index.html'; // Redirigir a index.html
            }, 1000); // Esperar 1 segundo antes de redirigir
        }
    }

    animateTravel(); // Iniciar la animación del viaje
}// Ajustar el tamaño del canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});