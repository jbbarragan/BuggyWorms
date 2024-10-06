let scene, camera, renderer;
let venus; // Cambié el nombre de la variable a venus
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

    // Esfera de Venus
    const venusGeometry = new THREE.SphereGeometry(150, 32, 32); // Tamaño del planeta
    const venusTexture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg'); // Textura de Venus
    const venusMaterial = new THREE.MeshBasicMaterial({ map: venusTexture });
    venus = new THREE.Mesh(venusGeometry, venusMaterial);
    scene.add(venus);

    // Añadir evento de clic a Venus
    venus.userData = { clickable: true };
    window.addEventListener('click', onDocumentMouseDown);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de Venus
    venus.rotation.y += 0.01;

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

function onDocumentMouseDown(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([venus]); // Intersección con Venus

    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
        travelAroundVenus();
    }
}

function travelAroundVenus() {
    const travelTime = 6000; // Tiempo total para el viaje
    const radius = 300; // Radio del viaje alrededor de Venus
    const startAngle = Math.PI / 2; // Comenzar desde arriba

    const startTime = Date.now();

    function animateTravel() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / travelTime, 1);

        // Calcular el ángulo de la cámara en función del tiempo transcurrido
        const angle = startAngle + (t * Math.PI * 2); // Recorrer 360 grados
        camera.position.x = radius * Math.cos(angle);
        camera.position.y = radius * Math.sin(angle);
        camera.position.z = 150; // Altura constante
        camera.lookAt(venus.position); // Mirar a Venus

        if (t < 1) {
            requestAnimationFrame(animateTravel);
        } else {
            returnToVenus(); // Volver a la posición inicial
        }
    }

    animateTravel();
}

function returnToVenus() {
    const returnTime = 2000; 
    const startTime = Date.now();

    function animateReturn() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / returnTime, 1);

        // Volver a la posición original
        camera.position.lerpVectors(camera.position.clone(), new THREE.Vector3(0, 0, 700), t);
        camera.lookAt(venus.position); 

        if (t < 1) {
            requestAnimationFrame(animateReturn);
        } else {
            window.location.href = '../index.html'; // Redirigir al índice
        }
    }

    animateReturn();
}

// Ajustar el tamaño del canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
