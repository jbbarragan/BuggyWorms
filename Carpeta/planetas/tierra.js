let scene, camera, renderer;
let earth, moon, iss;
let video, videoTexture;
let objectData = []; // Para almacenar datos de objetos recuperados

// Variables para el viaje
let traveling = false;
let travelTime = 3000; // Duración del viaje en milisegundos
let travelStartTime;
init();
animate();

async function init() {
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

    // Cargar datos de objetos
    await loadObjectData();

    // Esfera de la Tierra
    const earthGeometry = new THREE.SphereGeometry(150, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg');
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Esfera de la Luna
    const moonGeometry = new THREE.SphereGeometry(60, 32, 32);
    const moonTexture = new THREE.TextureLoader().load('https://t4.ftcdn.net/jpg/06/67/12/37/360_F_667123727_SD1QORXK3Ezvgoja8aTwh9k2IJ2NGsvN.jpg');
    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Cargar el modelo 3D de la ISS
    const loader = new THREE.GLTFLoader();
    loader.load('../img/ISS_stationary.glb', function (gltf) {
        iss = gltf.scene;
        iss.scale.set(.1, .1, .1);
        scene.add(iss);
    });

    // Manejador de clics en la Tierra
    earth.callback = () => {
        if (!traveling) {
            startTravel();
        }
    };

    // Detectar clics en la Tierra
    window.addEventListener('click', (event) => {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([earth]);

        if (intersects.length > 0) {
            earth.callback();
        }
    });
}

async function loadObjectData() {
    try {
        const response = await fetch('get_objects.php'); // URL de tu archivo PHP
        if (!response.ok) {
            throw new Error('Error en la respuesta de la red');
        }
        objectData = await response.json();

        // Aquí puedes procesar objectData y cargar texturas/objetos adicionales
        // Por ejemplo, si tienes texturas para objetos:
        objectData.forEach(obj => {
            const geometry = new THREE.SphereGeometry(obj.size, 32, 32); // Asumiendo que tienes un tamaño en obj
            const texture = new THREE.TextureLoader().load(obj.textureUrl); // Asumiendo que tienes una URL de textura en obj
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(obj.position.x, obj.position.y, obj.position.z); // Asumiendo que tienes posiciones en obj
            scene.add(mesh);
        });
    } catch (error) {
        console.error('Error cargando los datos de los objetos:', error);
    }
}

function startTravel() {
    traveling = true;
    travelStartTime = Date.now();
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de la Tierra
    earth.rotation.y += 0.01;

    // Órbita de la Luna
    const time = Date.now() * 0.001;
    const moonDistance = 600;
    moon.position.set(Math.cos(time) * moonDistance, 0, Math.sin(time) * moonDistance);

    // Órbita de la ISS
    if (iss) {
        const issDistance = 250;
        iss.position.set(Math.cos(time * 2) * issDistance, 0, Math.sin(time * 2) * issDistance);
        iss.rotation.y += 0.01;
    }

    // Manejo del viaje
    if (traveling) {
        const elapsed = Date.now() - travelStartTime;
        const progress = Math.min(elapsed / travelTime, 1);

        // Calcular posición de la cámara para el viaje
        const angle = Math.PI * 2 * progress; // Completa un círculo en el viaje
        camera.position.x = 700 * Math.cos(angle);
        camera.position.z = 700 * Math.sin(angle);
        camera.lookAt(earth.position); // Mantener la cámara mirando a la Tierra

        // Finalizar el viaje
        if (progress === 1) {
            traveling = false;
            window.location.href = "../index.html"; // Redirigir al finalizar
        }
    }

    renderer.render(scene, camera);
}

function setupVideoBackground() {
    // Crear el elemento de video
    video = document.createElement('video');
    video.src = '../img/fondo1.mp4'; // Ruta al video
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
