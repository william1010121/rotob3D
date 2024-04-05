import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';


// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const canvas = document.querySelector('.webgl');
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
camera.position.z = 5;

// Constants for bone and mesh colors
const BONE_COLOR = 0xff0000;
const MESH_COLOR = 0x00ff00;
const BOX_COLOR = 0x00ff00;
const GRAY_COLOR = 0x808080;

function addFloor() {
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = true;
    scene.add(floor);

}

function addSunLikeLight(position) {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(position.x, position.y, position.z);
    light .lookAt(0,0,0);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    scene.add(light);
}

function addAmbientLight() {
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);
}
function addLight() {
    addSunLikeLight({x: 1, y: 10, z: 10});
    addAmbientLight();
}


// Bone creation utilities
function createBone(position, fathers= []) {
    const bone = new THREE.Bone();
    bone.position.set(position.x, position.y, position.z);
    fathers.forEach(father => father.add(bone));
    return bone;
}


function addBoxToBone(bone, size={x: 0.5, y: 0.5, z: 0.5}, position={x: 0, y: 0, z: 0}) {
    const BoxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const BoxMaterial = new THREE.MeshStandardMaterial({ color: BOX_COLOR }); 
    const Box = new THREE.Mesh(BoxGeometry, BoxMaterial);
    Box.receiveShadow = true;
    Box.castShadow = true;
    Box.position.set(position.x, position.y, position.z);
    bone.add(Box);
}
function addSphereToBone(bone) {
    // Constants for sphere properties
    const SPHERE_RADIUS = 0.1;
    const SPHERE_SEGMENTS = 8;
    const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: BONE_COLOR });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    bone.add(sphere);
}
function addSphereToBones(bones=[]) {
    bones.forEach(bone => addSphereToBone(bone));
}

function createSkinnedMesh(scene, bones) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ skinning: true, color: MESH_COLOR });
    const mesh = new THREE.SkinnedMesh(geometry, material);

    const skeleton = new THREE.Skeleton(bones);
    mesh.add(bones[8]);
    mesh.bind(skeleton);

    scene.add(mesh);
    return mesh;
}

function setupGuiControls() {
    const settings = {
        leftLowerArmY: 0,
        leftUpperArmZ: 0,
        leftShouderX: 0,
        leftHipZ: 0,
        leftHighLegX: 0,
        leftLowLegX: 0,
        leftAnkleX: 0,

        rightLowerArmY: 0,
        rightUpperArmZ: 0,
        rightShouderX: 0,
        rightHipZ: 0,
        rightHighLegX: 0,
        rightLowLegX: 0,
        rightAnkleX: 0,

        headY: 0,
        abdomenY: 0
    };

    const gui = new dat.GUI();
    const folder = gui.addFolder('Bone Rotations');
    // set the GUI controls
    Object.keys(settings).forEach(key => {
        folder.add(settings, key, -Math.PI/3, Math.PI/3, 0.01);
    });
    folder.open();
    return settings;
}

// Create bones
function createBones() {
    const abdomen = createBone({ x: 0, y: 0, z: 0 });
    const rootBone = createBone({ x: 0, y: 0.5, z: 0 }, [abdomen]);
    const head = createBone({ x: 0, y: 0.5, z: 0 }, [rootBone]);
    //left
    const leftShoulderBone = createBone({ x: 0.5, y: 0, z: 0 }, [rootBone]);
    const leftUpperArmBone = createBone({ x: 0.5, y: 0, z: 0 }, [leftShoulderBone]);
    const leftLowerArmBone = createBone({ x: 0.5, y: 0, z: 0 }, [leftUpperArmBone]);
    const rightShoulderBone = createBone({ x: -0.5, y: 0, z: 0 }, [rootBone]);
    const rightUpperArmBone = createBone({ x: -0.5, y: 0, z: 0 }, [rightShoulderBone]);
    const rightLowerArmBone = createBone({ x: -0.5, y: 0, z: 0 }, [rightUpperArmBone]);

    const leftHipBone = createBone({ x: 0.5, y: 0, z: 0 }, [abdomen]);
    const leftHighLegBone = createBone({ x: 0, y: -0.5, z: 0 }, [leftHipBone]);
    const leftLowLegBone = createBone({ x: 0, y: -0.5, z: 0 }, [leftHighLegBone]);
    const leftAnkle= createBone({ x: 0, y: -0.5, z: 0 }, [leftLowLegBone]);
    const rightHipBone = createBone({ x: -0.5, y: 0, z: 0 }, [abdomen]);
    const rightHighLegBone = createBone({ x: 0, y: -0.5, z: 0 }, [rightHipBone]);
    const rightLowLegBone = createBone({ x: 0, y: -0.5, z: 0 }, [rightHighLegBone]);
    const rightAnkle = createBone({ x: 0, y: -0.5, z: 0 }, [rightLowLegBone]);

    const bones = [
        rootBone,
        leftLowerArmBone,
        leftUpperArmBone,
        leftShoulderBone,
        leftHipBone,
        leftHighLegBone,
        leftLowLegBone,
        leftAnkle,
        abdomen,
        head,
        rightAnkle,
        rightLowLegBone,
        rightHighLegBone,
        rightHipBone,
        rightShoulderBone,
        rightUpperArmBone,
        rightLowerArmBone,
        leftUpperArmBone,
        leftLowerArmBone
    ];


    addBoxToBone(leftLowerArmBone, {x: 0.5, y: 0.5, z: 0.1});
    addBoxToBone(leftUpperArmBone, {x: 0.5, y: 0.1, z: 0.5});
    addBoxToBone(leftShoulderBone, {x: 0.1, y: 0.5, z: 0.5});

    addBoxToBone(rightLowerArmBone, {x: 0.5, y: 0.5, z: 0.1});
    addBoxToBone(rightUpperArmBone, {x: 0.5, y: 0.1, z: 0.5});
    addBoxToBone(rightShoulderBone, {x: 0.1, y: 0.5, z: 0.5});

    addBoxToBone(leftHipBone, {x: 0.1, y: 0.5, z: 0.5});
    addBoxToBone(leftHighLegBone, {x: 0.5, y: 0.5, z: 0.1});
    addBoxToBone(leftLowLegBone, {x: 0.5, y: 0.5, z: 0.1});
    addBoxToBone(leftAnkle, {x: 0.5, y: 0.1, z: 0.5});

    addBoxToBone(rightHipBone, {x: 0.1, y: 0.5, z: 0.5});
    addBoxToBone(rightHighLegBone, {x: 0.5, y: 0.5, z: 0.1});
    addBoxToBone(rightLowLegBone, {x: 0.5, y: 0.5, z: 0.1});
    addBoxToBone(rightAnkle, {x: 0.5, y: 0.1, z: 0.5});

    addBoxToBone(head, {x: 0.1, y: 0.5, z: 0.5});
    addBoxToBone(abdomen, {x: 0.1, y: 0.5, z: 0.5});
    addBoxToBone(rootBone, {x: 0.5, y: 0.5, z: 0.1})

    return bones;
}

addLight()
addFloor();

// Create bones and skinned mesh
const bones = createBones();
const mesh = createSkinnedMesh(scene, bones);
const skeletonHelper = new THREE.SkeletonHelper(mesh);
scene.add(skeletonHelper);

// Setup GUI controls
const settings = setupGuiControls();

// Update bone rotations based on GUI settings
function updateBoneRotations(mesh, settings) {
    mesh.skeleton.bones[1].rotation.y = settings.leftLowerArmY;
    mesh.skeleton.bones[2].rotation.z = settings.leftUpperArmZ;
    mesh.skeleton.bones[3].rotation.x = settings.leftShouderX;
    mesh.skeleton.bones[4].rotation.z = settings.leftHipZ;
    mesh.skeleton.bones[5].rotation.x = settings.leftHighLegX;
    mesh.skeleton.bones[6].rotation.x = settings.leftLowLegX;
    mesh.skeleton.bones[7].rotation.x = settings.leftAnkleX;

    mesh.skeleton.bones[16].rotation.y = settings.rightLowerArmY;
    mesh.skeleton.bones[15].rotation.z = settings.rightUpperArmZ;
    mesh.skeleton.bones[14].rotation.x = settings.rightShouderX;
    mesh.skeleton.bones[13].rotation.z = settings.rightHipZ;
    mesh.skeleton.bones[12].rotation.x = settings.rightHighLegX;
    mesh.skeleton.bones[11].rotation.x = settings.rightLowLegX;
    mesh.skeleton.bones[10].rotation.x = settings.rightAnkleX;


    mesh.skeleton.bones[9].rotation.y = settings.headY;
    mesh.skeleton.bones[0].rotation.y = settings.abdomenY;
}

// Window resize listener
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update bone rotations based on GUI settings
    updateBoneRotations(mesh, settings);

    renderer.render(scene, camera);
}

animate();




