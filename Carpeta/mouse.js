let scene, camera, renderer, particles = [];
let mouse = new THREE.Vector2();
const planetDistance = 45; // Distancia promedio de los planetas para las partículas

// Inicializar escena y cámara
function initParticles() {
    // Crear la escena
    scene = new THREE.Scene();

    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // Crear el renderizador
    renderer = new THREE.WebGLRenderer({ alpha: true }); // Permitir transparencia
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Detectar el movimiento del mouse
    document.addEventListener('mousemove', onMouseMove, false);

    // Ajustar al redimensionar la ventana
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// Manejar el redimensionamiento de la ventana
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// Manejar el movimiento del mouse
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Crear una nueva partícula en la posición del mouse
    createParticle(event.clientX, event.clientY);
}

// Crear una partícula en la posición del mouse, al nivel de los planetas
function createParticle(x, y) {
    const particleGeometry = new THREE.CircleGeometry(0.5, 32);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0
    });

    const particle = new THREE.Mesh(particleGeometry, particleMaterial);

    // Posicionar la partícula en la coordenada del mouse
    const vector = new THREE.Vector3(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera);

    const dir = vector.sub(camera.position).normalize();
    const distance = (planetDistance - camera.position.z) / dir.z; // Distancia a la altura de los planetas
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    particle.position.set(pos.x, pos.y, pos.z);
    scene.add(particle);

    // Guardar la partícula y establecer un tiempo de vida para desaparecer
    particles.push({ mesh: particle, life: 100 }); // Vida de la partícula en fotogramas
}

// Animar las partículas
function animate() {
    requestAnimationFrame(animate);

    // Actualizar la vida de las partículas
    particles.forEach((p, index) => {
        p.life--;
        p.mesh.material.opacity -= 0.01; // Desvanecerse con el tiempo

        if (p.life <= 0) {
            scene.remove(p.mesh); // Eliminar la partícula cuando desaparezca
            particles.splice(index, 1); // Quitarla de la lista
        }
    });

    renderer.render(scene, camera);
}

// Inicializar todo
initParticles();
