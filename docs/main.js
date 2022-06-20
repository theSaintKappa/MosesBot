import './style.css'
import * as THREE from 'three'

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const scene = new THREE.Scene();
scene.backgroundColor = 0xffffff;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.setZ(2);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);




const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(0, 0, 0);
scene.add(ambientLight);




const torusGeometry = new THREE.TorusGeometry(.7, .2, 32, 200)
const torusMaterial = new THREE.PointsMaterial({ size: 0.005 })
const torus = new THREE.Points(torusGeometry, torusMaterial);
scene.add(torus);


const mosesMaterial = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('/moses.jpg') })
const mosesGeometry = new THREE.BoxGeometry(6, 6, 6)
const moses = new THREE.Mesh(mosesGeometry, mosesMaterial)
scene.add(moses);
moses.position.setZ(-40)


const particlesGeometry = new THREE.BufferGeometry
const particlesMaterial = new THREE.PointsMaterial({ size: 0.0035 })
const particlesCount = 5000
const posArray = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (Math.random() * 5)
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particlesMesh)



document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX
    mouseY = event.clientY
})
document.addEventListener('mouseout', () => {
    mouseX = 0
    mouseY = 0
})
let mouseX = 0
let mouseY = 0


const clock = new THREE.Clock()
const animate = () => {
    const elapsedTime = clock.getElapsedTime()


    torus.rotation.y = .5 * elapsedTime

    particlesMesh.rotation.y = -.1 * elapsedTime
    particlesMesh.rotation.x = .1 * elapsedTime

    if (mouseX > 0 || mouseY > 0) {
        particlesMesh.rotation.x = mouseY * 0.001
        particlesMesh.rotation.y = mouseX * 0.001
    }

    moses.rotation.y += 0.005;
    moses.rotation.z += 0.005;
    moses.rotation.x += 0.005;


    renderer.render(scene, camera)

    window.requestAnimationFrame(animate)
}
animate()