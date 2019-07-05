/**
 * imports
 */
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/106/three.min.js')
self.importScripts('perlin.js')

/**
 * Settings
 */
let myState = {
  animationRunning: true,
  renderer: null,
  starsAmount: 30,
  // Fog Background
  setColor: 0x00adff,
  moonLight: null,
  moonLight2: null,
  plane: null,
  scene: new THREE.Scene(),
  stars: new THREE.Group(),
  starsLights: new THREE.Group()
}

/**
 * funcs
 */
const initializeCanvas = (resolve, canvas) => {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: true,
    depth: true,
    canvas
  })

  renderer.setSize(myState.innerWidth, myState.innerHeight, false)
  renderer.setClearColor(0x001a2d)

  if (myState.innerWidth > 800) {
    //disable shadow map and tonemapping to improve fps
    // renderer.shadowMap.enabled = true
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // renderer.shadowMap.needsUpdate = true
    // renderer.toneMapping = THREE.ReinhardToneMapping
  }

  myState.renderer = renderer

  resolve()
}

const initializeCamera = () => {
  const camera = new THREE.PerspectiveCamera(45, myState.innerWidth / myState.innerHeight, 0.1, 200)

  camera.position.x = 70
  camera.position.y = 30
  camera.position.z = 5
  camera.lookAt(new THREE.Vector3())

  myState.camera = camera
}

const initializeFogBackground = () => {
  const { scene } = myState

  // scene.background = new THREE.Color(setColor)
  scene.fog = new THREE.Fog(0x001a2d, 80, 140)
  // scene.fog = new THREE.FogExp2(setColor, 0.05)

  myState.scene = scene
}

const initializeLights = () => {
  const { scene } = myState
  const moonLight = new THREE.PointLight(0xffffff, 2, 150)
  const moonLight2 = new THREE.PointLight(0xffffff, 0.6, 150)

  moonLight2.position.x += 20
  moonLight2.position.y -= 20
  moonLight2.position.z -= 25

  scene.add(moonLight)
  scene.add(moonLight2)

  myState.moonLight = moonLight
  myState.moonLight2 = moonLight2
}

const createMoon = () => {
  const {
    scene,
    moonLight
  } = myState

  const geometry = new THREE.SphereBufferGeometry(8, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    color: 0x26fdd9,
    shininess: 15,
    emissive: 0x2bb2e6,
    emissiveIntensity: 0.8
  })

  const moon = new THREE.Mesh(geometry, material)
  moon.position.x = -9
  moon.position.y = 1
  moon.position.z = -6.5

  moon.rotation.y = -1

  scene.add(moon)

  moonLight.position.copy(moon.position)
  moonLight.position.y += 4

  myState.scene = scene
  myState.moonLight = moonLight
}

const createTerrain = () => {
  const { scene } = myState
  const geometry = new THREE.PlaneBufferGeometry(150, 150, 120, 120)
  const matrix = new THREE.Matrix4()

  matrix.makeRotationX(Math.PI * - 0.5)
  geometry.applyMatrix(matrix)

  for (let index = 0; index < geometry.index.count; index++) {
    const positionX = geometry.attributes.position.getX(index)
    const positionZ = geometry.attributes.position.getZ(index)

    const ratio = noise.simplex3(positionX * 0.03, positionZ * 0.03, 0)

    geometry.attributes.position.setY(index, (ratio * 10))
  }

  const material = new THREE.MeshPhongMaterial({
    color: 0x198257,
    emissive: 0x032f50
  })
  const plane = new THREE.Mesh(geometry, material)

  scene.add(plane)

  myState.scene = scene
  myState.plane = plane
}

const createStars = () => {
  const {
    stars,
    starsLights,
    scene,
    starsAmount
  } = myState

  const geometry = new THREE.SphereBufferGeometry(0.3, 16, 16)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  })

  for (let index = 0; index < starsAmount; index++) {
    const star = new THREE.Mesh(geometry, material)
    star.position.x = (Math.random() - 0.5) * 150
    star.position.z = (Math.random() - 0.5) * 150

    const ratio = noise.simplex3(star.position.x * 0.03, star.position.z * 0.03, 0)
    star.position.y = ratio * 10 + 0.3

    stars.add(star)

    const velX = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1)
    const velY = (Math.random() + 0.1) * 0.1 * (Math.random() < 0.5 ? -1 : 1)
    star.vel = new THREE.Vector2(velX, velY)

    const starLight = new THREE.PointLight(0xffffff, 0.8, 3)
    starLight.position.copy(star.position)
    starLight.position.y += 0.5

    starsLights.add(starLight)
  }

  scene.add(stars)
  scene.add(starsLights)

  myState.scene = scene
  myState.stars = stars
  myState.starsLights = starsLights
}

const updateStar = (star, index) => {
  const { starsLights } = myState

  if (star.position.x < -75) {
    star.position.x = 75
  } else if (star.position.x > 75) {
    star.position.x = -75
  }

  if (star.position.z < -75) {
    star.position.z = 75
  } else if (star.position.z > 75) {
    star.position.z = -75
  }

  star.position.x += star.vel.x
  star.position.z += star.vel.y

  const ratio = noise.simplex3(star.position.x * 0.03, star.position.z * 0.03, 0)
  star.position.y = ratio * 10 + 0.3

  starsLights.children[index].position.copy(star.position)
  starsLights.children[index].position.y += 1

  myState.starsLights = starsLights
}

const animate = () => {
  const {
    camera,
    renderer,
    scene,
    animationRunning,
    stars,
    starsAmount
  } = myState

  if (!animationRunning) return

  requestAnimationFrame(animate)

  for (let index = 0; index < starsAmount; index++) {
    updateStar(stars.children[index], index)
  }

  renderer.render(scene, camera)
}

const start = (canvas) => {
  	new Promise(resolve => initializeCanvas(resolve, canvas))
		.then(() => initializeFogBackground())
		.then(() => initializeCamera())
		.then(() => initializeLights())
		.then(() => createMoon())
		.then(() => createTerrain())
		.then(() => createStars())
		.then(() => animate())
}

/**
 * utils
 */


/**
 * helpers
 */
const startAnimation = () => {
  const { animationRunning } = myState

  if (!animationRunning) {
    myState.animationRunning = true
    animate()
  }
}

const stopAnimation = () => {
  const { animationRunning } = myState

  if (animationRunning) {
    setTimeout(() => myState.animationRunning = false, 650)
  }
}

/**
 * events
 */
const onWindowResize = () => {
  const { renderer, camera } = myState

  camera.aspect = myState.innerWidth / myState.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(myState.innerWidth, myState.innerHeight, false)

  myState.renderer = renderer
  myState.camera = camera
}

/**
 * worker
 */

onmessage = function (event) {
  const { type, data } = event.data
  let response = null

  switch (type) {
    case 'start':
      const canvas = data.canvas

      myState.innerWidth = data.innerWidth
      myState.innerHeight = data.innerHeight

      start(canvas)
      break;

    case 'resize':
      myState.innerWidth = data.innerWidth
      myState.innerHeight = data.innerHeight

      onWindowResize()
      break;

    case 'setState':
      myState = { ...myState, ...data }
      break;

    case 'startAnimation':
      startAnimation()
      break;

    case 'stopAnimation':
      stopAnimation()
      break;

    default:
      break;
  }

  postMessage(response)
}