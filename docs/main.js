window.addEventListener("resize", function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);


const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.canvas'),
    antialias: true,
    alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.setZ(30);

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(0, 0, 0);
scene.add(ambientLight);


const mosesTexture = new THREE.TextureLoader().load('./moses.jpg');
const moses = new THREE.Mesh(
    new THREE.BoxGeometry(6, 6, 6),
    new THREE.MeshStandardMaterial({ map: mosesTexture })
);
scene.add(moses);
moses.position.setY(7);




function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    moses.rotation.y += 0.005;
    moses.rotation.z += 0.005;
    moses.rotation.x += 0.005;
}
animate();