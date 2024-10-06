let scene, camera, renderer;
let earth, moon, issGroup;
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
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Luz ambiental suave
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Luz direccional fuerte
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Fondo de video
    setupVideoBackground();

    // Esfera de la Tierra
    const earthGeometry = new THREE.SphereGeometry(150, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg'); // Textura de la Tierra
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Esfera de la Luna
    const moonGeometry = new THREE.SphereGeometry(60, 32, 32);
    const moonTexture = new THREE.TextureLoader().load('https://t4.ftcdn.net/jpg/06/67/12/37/360_F_667123727_SD1QORXK3Ezvgoja8aTwh9k2IJ2NGsvN.jpg'); // Textura de la Luna
    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Grupo de ISS
    issGroup = new THREE.Group();
    scene.add(issGroup);

    // Cargar la textura de la ISS
    const issTexture = new THREE.TextureLoader().load('../img/mercurio.jpg', function (texture) {
        const issMaterial = new THREE.MeshBasicMaterial({ map: texture });
    
        const numISS = 1000; // Número de ISS
        const radius = 170; // Radio de la esfera
    
        for (let j = 0; j < 3; j++) { // Tres tamaños diferentes de ISS
            for (let i = 0; i < numISS; i++) {
                const theta = Math.acos(2 * Math.random() - 1); // Ángulo theta
                const phi = 2 * Math.PI * Math.random(); // Ángulo phi
    
                const x = radius * Math.sin(theta) * Math.cos(phi);
                const y = radius * Math.sin(theta) * Math.sin(phi);
                const z = radius * Math.cos(theta);
    
                // Crear nueva geometría con diferente tamaño
                const issGeometry = new THREE.BoxGeometry(3, j, j);
                const issMesh = new THREE.Mesh(issGeometry, issMaterial);
                issMesh.position.set(x, y, z);
                issMesh.lookAt(earth.position); // Hacer que la ISS apunte hacia la Tierra
                issGroup.add(issMesh);
            }
        }
    }, undefined, function (error) {
        console.error('Error al cargar la textura de la ISS:', error);
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de la Tierra
    earth.rotation.y += 0.01;

    // Órbita de la Luna
    const time = Date.now() * 0.0015;
    const moonDistance = 600;
    moon.position.set(Math.cos(time) * moonDistance, 0, Math.sin(time) * moonDistance);

    // Rotar el grupo de ISS alrededor de la Tierra
    issGroup.rotation.y += 0.005;

    renderer.render(scene, camera);
}

function setupVideoBackground() {
    // Crear el elemento de video
    video = document.createElement('video');
    video.src = '../img/fondo1.mp4'; // Ruta al video
    video.load();
    video.loop = true; // Hacer que el video se repita

    // Esperar a que el video esté cargado antes de crear la textura
    video.addEventListener('loadeddata', () => {
        video.play(); // Reproducir el video

        // Crear textura a partir del video
        videoTexture = new THREE.VideoTexture(video);

        // Crear una esfera grande para el fondo
        const sphereGeometry = new THREE.SphereGeometry(5000, 64, 64); // Aumentar el tamaño del fondo
        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.BackSide, // Usar el lado interior
            transparent: true, // Habilitar la transparencia
            opacity: 0.5 // Ajustar la opacidad
        });
        const videoSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(videoSphere);
    });
}

// Ajustar el tamaño del canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});