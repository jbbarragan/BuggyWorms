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
    camera.position.set(0, 0, 700); // Posición inicial de la cámara
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
    const earthGeometry = new THREE.SphereGeometry(50, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/9/9b/Earth_political_divisions.jpg');
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Añadir evento de clic a la Tierra
    earth.userData = { clickable: true };
    window.addEventListener('click', onDocumentMouseDown);
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
	earth.rotation.y += 0.01; // Rotación de la Tierra

    renderer.render(scene, camera);
}

function setupVideoBackground() {
    // Crear el elemento de video
    video = document.createElement('video');
    video.src = '../img/fondo1.mp4'; // Asegúrate de que esta ruta sea correcta
    video.load();
	video.play();
    video.loop = true;
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

    const intersects = raycaster.intersectObjects([earth]);

    if (intersects.length > 0 && intersects[0].object.userData.clickable) {
        travelAroundEarth();
    }
}

function travelAroundEarth() {
    const travelDistance = 200; // Acercarse a la Tierra
    const travelTime = 4000; 

    const originalPosition = camera.position.clone(); 
    const targetPosition = new THREE.Vector3(0, 0, travelDistance); 

    const startTime = Date.now();

    function animateTravel() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / travelTime, 1);

        camera.position.lerpVectors(originalPosition, targetPosition, t);
        camera.lookAt(earth.position); 

        if (t < 1) {
            requestAnimationFrame(animateTravel);
        } else {
            returnToEarth(); // Comenzar a regresar
        }
    }

    animateTravel();
}

function returnToEarth() {
    const returnTime = 2000; 
    const startTime = Date.now();

    function animateReturn() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / returnTime, 1);

        // Volver a la posición original
        camera.position.lerpVectors(new THREE.Vector3(0, 0, 200), new THREE.Vector3(0, 0, 700), t);
        camera.lookAt(earth.position); 

        if (t < 1) {
            requestAnimationFrame(animateReturn);
        } else {
            window.location.href = '../index.html'; 
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
