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
    const earthTexture = new THREE.TextureLoader().load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8BsVr__MysKQ6BCotY5BEK0G1hDyrN6zEg&s');
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

// Añadir evento de clic a la Tierra
    earth.userData = { clickable: true }; // Marcar la Tierra como clickable
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
        // Convertir las coordenadas del mouse a el rango de -1 a 1
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // Actualizar el raycaster con la cámara y la posición del mouse
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        // Verificar si se hace clic en la Tierra
        if (intersects.length > 0 && intersects[0].object.userData.clickable) {
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

// Ajustar el tamaño del canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});function travelAroundEarth() {
    const travelDistance = 400; // Distancia del viaje
    const travelTime = 4000; // Tiempo total del viaje en milisegundos

    const originalPosition = camera.position.clone(); // Guardar la posición original
    const targetPosition = new THREE.Vector3(0, travelDistance, 0); // Posición objetivo

    const startTime = Date.now();

    function animateTravel() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / travelTime, 1); // Normalizar tiempo entre 0 y 1

        // Interpolar posición
        camera.position.lerpVectors(originalPosition, targetPosition, t);
        camera.lookAt(earth.position); // Mirar a la Tierra

        if (t < 1) {
            requestAnimationFrame(animateTravel);
        } else {
            // Regresar a la Tierra
            returnToEarth();
        }
    }

    animateTravel();
}

function returnToEarth() {
    const returnTime = 2000; // Tiempo para regresar a la posición original
    const startTime = Date.now();

    function animateReturn() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / returnTime, 1); // Normalizar tiempo entre 0 y 1

        // Interpolar posición
        camera.position.lerpVectors(new THREE.Vector3(0, 400, 0), new THREE.Vector3(0, 0, 700), t);
        camera.lookAt(earth.position); // Mirar a la Tierra

        if (t < 1) {
            requestAnimationFrame(animateReturn);
        } else {
            // Redirigir a index.html
            window.location.href = '../index.html';
        }
    }

    animateReturn();
}
