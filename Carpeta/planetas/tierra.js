let scene, camera, renderer;
let earth, moon, iss;
let video, videoTexture;

init();
animate();

function init() {
    // Escena
    scene = new THREE.Scene();

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000); // Aumenta el valor de la distancia de cámara
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

    // Esfera de la Tierra (100 veces más grande)
    const earthGeometry = new THREE.SphereGeometry(150, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg'); // Textura de la Tierra
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Esfera de la Luna (100 veces más grande y más lejos)
    const moonGeometry = new THREE.SphereGeometry(60, 32, 32); // Proporción de tamaño de la Luna
    const moonTexture = new THREE.TextureLoader().load('https://t4.ftcdn.net/jpg/06/67/12/37/360_F_667123727_SD1QORXK3Ezvgoja8aTwh9k2IJ2NGsvN.jpg'); // Textura de la Luna
    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Cargar el modelo 3D de la ISS
    const loader = new THREE.GLTFLoader();
    loader.load('../img/ISS_stationary.glb', function (gltf) {
        iss = gltf.scene;
        iss.scale.set(.1, .1,.1);  // Aumentar el tamaño del modelo ISS
        scene.add(iss);
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de la Tierra
    earth.rotation.y += 0.01;

    // Órbita de la Luna (más lejana y más grande)
    const time = Date.now() * 0.001;
    const moonDistance = 600; // Distancia de la Luna 100 veces mayor
    moon.position.set(Math.cos(time) * moonDistance, 0, Math.sin(time) * moonDistance);

    // Órbita de la ISS (más cercana a la Tierra, pero ajustada)
    if (iss) {
        const issDistance = 250; // Distancia más corta de la ISS a la Tierra, 100 veces mayor
        iss.position.set(Math.cos(time * 2) * issDistance, 0, Math.sin(time * 2) * issDistance);
        iss.rotation.y += 0.01; // Rotación de la ISS
    }

    renderer.render(scene, camera);
}

function setupVideoBackground() {
    // Crear el elemento de video
    video = document.createElement('video');
    video.src = '../img/fondo1.mp4'; // Ruta al video
    video.load();
    video.play();
    video.loop = true; // Hacer que el video se repita

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
}

// Ajustar el tamaño del canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
