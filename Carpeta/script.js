let scene, camera, renderer, controls;
let planets = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let video;
const MAX = 499;  // Límite superior
const MIN = -499; // Límite inferior
let planetPaths = [];
let normalSpeed = 0.0001;
let slowSpeed = 0;
let cometPaths = []; // Arreglo para almacenar las trayectorias de los cometas
function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    tooltip.style.color = 'black';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.display = 'none'; // Se oculta inicialmente
    tooltip.style.pointerEvents = 'none'; // No interfiere con el clic del mouse
    tooltip.innerHTML = 'Jugar';
    document.body.appendChild(tooltip);
}

createTooltip();

function limitCameraPosition() {
    const distanceFromOrigin = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
    if (distanceFromOrigin > MAX) {
        const scale = MAX / distanceFromOrigin;
        camera.position.x *= scale;
        camera.position.y *= scale;
        camera.position.z *= scale;
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 500;  // Límite de zoom
    controls.minDistance = 10;    // Límite mínimo de zoom

    setupVideoBackground();

    

    const sun = createPlanet({
        radius: 5,
        textureUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHdGxTN_mqLCVMzlhBrWDmdMVl5z0xVnUcgw&s',
        position: { x: 0, y: 0, z: 0 }
    });
    scene.add(sun);

    const planetData = [
        { radius: 1, distance: 10, texture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8BsVr__MysKQ6BCotY5BEK0G1hDyrN6zEg&s', url: './planetas/mercurio.html', eccentricity: 0.2, inclination: 6.6 },
        { radius: 1.5, distance: 15, texture: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg', url: './planetas/venus.html', eccentricity: 0.1, inclination: 7.6 },
        { radius: 2, distance: 20, texture: 'https://static.diariovasco.com/www/multimedia/201808/22/media/cortadas/mapamundi-kVxD-U60705670296r0C-984x608@Diario%20Vasco.jpg', url: './planetas/tierra.html', eccentricity: 0.017, inclination: 14.0 },
        { radius: 1.8, distance: 25, texture: 'https://cdn.pixabay.com/photo/2020/02/04/17/04/map-4818860_1280.jpg', url: './planetas/marte.html', eccentricity: 0.093, inclination: 11.2 },
        { radius: 4, distance: 35, texture: 'https://external-preview.redd.it/JJTceYLFNKh1trdhGTiDAku5dMw24H61e8xyi2_TS6g.jpg?auto=webp&s=1f3d29a36611e75f0fa8bf6e25865809a41771ad', url: './planetas/jupiter.html', eccentricity: 0.048, inclination: 12.0 },
        { radius: 3, distance: 45, texture: 'https://1.bp.blogspot.com/-KBL1f1hFhWI/Xnk2-C_qlQI/AAAAAAAAUKY/7g78bkJUTMYKtkhUMtOLD_BFiwwnNFQqgCLcBGAsYHQ/s1600/2k_saturn.jpg', url: './planetas/saturno.html', hasRings: true, eccentricity: 0.056, inclination: 11.0 },
        { radius: 2.5, distance: 55, texture: 'https://www.rtve.es/imagenes/462126main-image-1686-946-710/1276194002537.jpg', url: './planetas/urano.html', eccentricity: 0.046, inclination: 12.8 },
        { radius: 2.2, distance: 65, texture: 'https://static.vecteezy.com/system/resources/previews/002/097/266/original/abstract-background-of-neptune-surface-free-vector.jpg', url: './planetas/neptuno.html', eccentricity: 0.009, inclination: 22.0 }
    ];

    planetData.forEach(data => {
        const planet = createPlanet({
            radius: data.radius,
            textureUrl: data.texture,
            position: { x: data.distance, y: 0, z: 0 },
            url: data.url,
            hasRings: data.hasRings,
            inclination: data.inclination
        });

        planets.push({ planet, distance: data.distance, eccentricity: data.eccentricity, inclination: data.inclination });

        const orbit = createOrbit(data.distance, data.inclination);
        scene.add(planet);
        // scene.add(orbit);

        planetPaths.push({
            planet: planet,
            points: [],
            completedOrbit: false,
            lastPosition: null
        });
    });
    
    loadComets();
    
    createAsteroidBelt();
    createAsteroidSphere(5000, 20, 30);

    

    const light = new THREE.PointLight(0xffffff, 1.5, 1000);
    light.position.set(0, 0, 0);
    scene.add(light);

    animate();
}
// Función para cargar cometas
function loadComets() {
    fetch('get_comets.php')
        .then(response => response.json())
        .then(data => {
            data.comets.forEach(data => {
                const comet = createComet({
                    diameter: data.diameter ? data.diameter : 0.5, // Ajusta el diámetro según sea necesario
                    position: { 
                        x: data.perihelion, // Establece la posición inicial usando el perihelio
                        y: 0, 
                        z: 0 
                    },
                });

                planets.push(comet); // Añadir a la lista de planetas (para movimiento)
                scene.add(comet);
            });
        })
        .catch(error => console.error('Error loading comet data:', error));
}
function createPlanet({ radius, textureUrl, position, url = null, hasRings = false, inclination = 0 }) {
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load(textureUrl);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(geometry, material);
    
    planet.position.set(position.x, position.y, position.z);
    planet.userData = { url };

    if (hasRings) {
        const ringGeometry = new THREE.RingGeometry(radius * 1.1, radius * 1.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }

    // Crear y agregar el nombre al planeta
    if (url) { // Asegurarse de que la URL exista para evitar errores
        const planetName = url.split('/').pop().replace('.html', '');
        const planetLabel = createPlanetLabel(planetName);
        planetLabel.position.set(0, radius + 0.5, 0); // Posiciona el texto ligeramente arriba del planeta
        planet.add(planetLabel);
    }

    return planet;
}

function createOrbit(distance, inclination) {
    const orbitGeometry = new THREE.RingGeometry(distance - 0.005, distance + 0.005, 300); // Aumenta el número de segmentos a 300
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    orbit.rotation.z = THREE.Math.degToRad(inclination);
    return orbit;
}

function createAsteroidBelt() {
    const numAsteroids = 900;
    const beltRadiusMin = 27;
    const beltRadiusMax = 31;
    const asteroidSize = 0.3;
    const beltInclination = THREE.Math.degToRad(-15.9); // Convertir grados a radianes

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const textureLoader = new THREE.TextureLoader();
    const asteroidTexture = textureLoader.load('https://static.vecteezy.com/system/resources/previews/046/105/391/non_2x/high-resolution-image-texture-of-asteroid-stone-craters-photo.jpg');

    for (let i = 0; i < numAsteroids; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = THREE.MathUtils.lerp(beltRadiusMin, beltRadiusMax, Math.random());

        // Posición de los asteroides en un anillo (en el plano xz)
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = (Math.random() - 0.5) * 2;

        // Aplicar inclinación al cinturón (rotación en el eje X)
        const inclinedX = x;
        const inclinedY = y * Math.cos(beltInclination) - z * Math.sin(beltInclination);
        const inclinedZ = y * Math.sin(beltInclination) + z * Math.cos(beltInclination);

        // Añadir la posición del asteroide a la geometría
        positions.push(inclinedX, inclinedY, inclinedZ);
    }

    // Convertir los datos de posición en un BufferAttribute para optimización
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        map: asteroidTexture,
        size: asteroidSize,
        transparent: true,
        opacity: 0.8
    });

    // Crear la nube de asteroides como un solo objeto
    const asteroidBelt = new THREE.Points(geometry, material);
    asteroidBelt.name = "asteroidBelt"; // Añadir nombre para la detección con raycaster
    scene.add(asteroidBelt);
}



function createAsteroidSphere(numAsteroids = 600, sphereRadiusMin = 70, sphereRadiusMax = 80) {
    const asteroidSize = 0.05;

    for (let i = 0; i < numAsteroids; i++) {
        // Coordenadas esféricas: radio, ángulo azimutal (horizontal), ángulo polar (vertical)
        const radius = THREE.MathUtils.lerp(sphereRadiusMin, sphereRadiusMax, Math.random()); // Radio aleatorio entre mínimo y máximo
        const azimuthalAngle = Math.random() * 2 * Math.PI; // Ángulo azimutal entre 0 y 360 grados
        const polarAngle = Math.acos(2 * Math.random() - 1); // Ángulo polar entre 0 y 180 grados (esfera completa)

        // Convertir coordenadas esféricas a cartesianas
        const x = radius * Math.sin(polarAngle) * Math.cos(azimuthalAngle);
        const y = radius * Math.sin(polarAngle) * Math.sin(azimuthalAngle);
        const z = radius * Math.cos(polarAngle);

        // Crear asteroide
        const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, 8, 8);
        const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Color azul
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        // Asignar la posición en el espacio 3D
        asteroid.position.set(x, y, z);

        // Añadir el asteroide a la escena
        scene.add(asteroid);
    }
}


function setupVideoBackground() {
    video = document.createElement('video');
    video.src = 'img/fondo1.mp4';
    video.load();
    video.play();
    video.loop = true;

    const videoTexture = new THREE.VideoTexture(video);
    const sphereGeometry = new THREE.SphereGeometry(500, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.5
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    limitCameraPosition();

    // Detección de intersección con las órbitas
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.planet));

    // Detener el planeta cuando el mouse esté sobre él
    planets.forEach((obj, index) => {
        if (intersects.length > 0 && intersects[0].object === obj.planet) {
            obj.currentSpeed = slowSpeed;  // Detener el planeta bajo el mouse
        } else {
            obj.currentSpeed = normalSpeed;  // Restablecer velocidad normal
        }

        const speed = obj.currentSpeed * (index + 1);
        const time = Date.now() * speed;

        const a = obj.distance;
        const b = obj.distance * Math.sqrt(1 - obj.eccentricity ** 2);

        // Actualiza la posición del planeta
        if (obj.currentSpeed !== slowSpeed) {
            obj.planet.position.x = a * Math.cos(time);
            obj.planet.position.z = b * Math.sin(time);
            obj.planet.position.y = obj.planet.position.z * Math.tan(THREE.Math.degToRad(obj.inclination));
        }

        const planetPath = planetPaths[index];

        // Agregar el punto actual a la trayectoria
        planetPath.points.push(obj.planet.position.clone());

        // Limitar la cantidad de puntos para evitar acumulaciones
        if (planetPath.points.length > 1000) {
            planetPath.points.shift(); // Elimina el primer punto para mantener la longitud
        }

        // Actualizar o dibujar los puntos en la órbita
        if (planetPath.particles) {
            planetPath.particles.geometry.setFromPoints(planetPath.points);
        } else {
            const geometry = new THREE.BufferGeometry().setFromPoints(planetPath.points);
            const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
            const particles = new THREE.Points(geometry, material);
            planetPath.particles = particles;
            scene.add(particles);
        }
    });

    renderer.render(scene, camera);
}



// Movimiento de los cometas
    planets.forEach((comet) => {
        if (comet.type === "comet") { // Verifica que el objeto sea un cometa
            const speed = 0.0002; // Ajusta la velocidad del cometa
            const time = Date.now() * speed;

            // Usa los parámetros del cometa para su movimiento
            comet.position.x = comet.perihelion * Math.cos(time); // Puede ser su perihelio o alguna fórmula
            comet.position.z = comet.perihelion * Math.sin(time); // Movimiento en el plano XZ

            // Si tienes inclinación para los cometas
            comet.position.y = comet.position.z * Math.tan(THREE.Math.degToRad(comet.inclination)); 

            // Similar al movimiento de los planetas, puedes registrar su trayectoria
            const cometPath = cometPaths[comet.index]; // Asegúrate de tener un arreglo para las trayectorias de los cometas

            cometPath.points.push(comet.position.clone());

            if (cometPath.points.length > 1000) {
                cometPath.points.shift();
            }

            if (cometPath.particles) {
                cometPath.particles.geometry.setFromPoints(cometPath.points);
            } else {
                const geometry = new THREE.BufferGeometry().setFromPoints(cometPath.points);
                const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.5 }); // Color rojo para los cometas
                const particles = new THREE.Points(geometry, material);
                cometPath.particles = particles;
                scene.add(particles);
            }
                    }
    });


function createPlanetLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '20px Arial';
    context.fillStyle = 'white';
    context.fillText(text, 0, 20);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    // Ajustar el tamaño de la etiqueta
    const scaleFactor = 0.05; // Ajusta este valor según sea necesario
    sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);

    return sprite;
}

function isPlanetAtPosition(planetPosition, initialPosition) {
    const threshold = 0.5; 
    return (
        Math.abs(planetPosition.x - initialPosition.x) < threshold &&
        Math.abs(planetPosition.z - initialPosition.z) < threshold
    );
}

function drawEllipse(points) {
    if (points.length < 2) return; // Necesitamos al menos dos puntos para dibujar

    // Eliminar el anterior si existe
    if (points.geometry) {
        scene.remove(points.geometry);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    ellipseLine.geometry = geometry; // Guardamos la geometría para eliminarla después
    scene.add(ellipseLine);
}

let orbitsVisible = true;

document.getElementById('toggle-orbits').addEventListener('click', () => {
    orbitsVisible = !orbitsVisible; // Cambia entre mostrar y ocultar

    planetPaths.forEach((path, index) => {
        if (path.particles) {
            path.particles.visible = orbitsVisible; // Oculta o muestra las órbitas
        }
    });
});

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseMove2(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Detección de objetos bajo el mouse
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let isOverAsteroids = false;

    for (let i = 0; i < intersects.length; i++) {
        const intersectedObject = intersects[i].object;
        if (intersectedObject.name === "asteroidBelt") {
            isOverAsteroids = true;
            document.body.style.cursor = 'pointer';  // Cambia el cursor a pointer (mano)

            break;
        }
        
    }

    if (!isOverAsteroids) {
        document.body.style.cursor = 'auto';  // Restablece el cursor al valor predeterminado
    }
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousemove', onMouseMove2, false);

function onDocumentDoubleClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.planet));

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const url = clickedPlanet.userData.url;
        window.open(url, '_blank');
    }
}

window.addEventListener('click', onDocumentDoubleClick);

function startCrisisGame(event){
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Detección de objetos bajo el mouse
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        const intersectedObject = intersects[i].object;
        if (intersectedObject.name === "asteroidBelt") {
            isOverAsteroids = true
            const url = './crisis1.1/WebGL Builds/index.html';
            window.open(url, '_blank');
            break;
        }
        
    }
}

window.addEventListener('click', startCrisisGame);

init();
