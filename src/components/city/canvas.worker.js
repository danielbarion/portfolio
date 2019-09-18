/**
 * imports
 */
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/three.js/106/three.min.js')
self.importScripts('OrbitControls.js')

/**
 * Settings
 */
let myState = {
  renderGPU: true,
  animationRunning: true,
  canRotate: true,
  buildings: 200,
  particles: 1500,
  renderer: null,
  initialCameraPositions: {
    x: Math.cos(performance.now() / 10000) * 20,
    y: 12,
    z: Math.sin(performance.now() / 10000) * 20,
  },
  camera: null,
  controls: null,
  createCarPos: true,
  uSpeed: 0.001,
  // Fog Background
  setColor: 0x55adff,
  // setColor: 0x00adff,
  // setColor: 0x00A1F2,
  // setColor: 0xF02050,
  // setColor: 0xF2F111,
  // setColor: 0xFF6347,
  setTintNum: true,
  scene: new THREE.Scene(),
  city: new THREE.Object3D(),
  smoke: new THREE.Object3D(),
  town: new THREE.Object3D(),
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2()
}

/**
 * funcs
 */
const mathRandom = (num = 8) => {
  return - Math.random() * num + Math.random() * num
}

const initializeCanvas = (resolve, canvas) => {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: true,
    depth: true,
    canvas
  })

  renderer.setSize(myState.innerWidth, myState.innerHeight, false)

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
  const { initialCameraPositions } = myState
  const camera = new THREE.PerspectiveCamera(20, myState.innerWidth / myState.innerHeight, 1, 500)

  camera.position.set(0, 6, 16)
  camera.position.x = initialCameraPositions.x
  camera.position.y = initialCameraPositions.y
  camera.position.z = initialCameraPositions.z

  myState.camera = camera
}

const initializeFogBackground = () => {
  const { scene, setColor } = myState

  scene.background = new THREE.Color(setColor)
  // scene.fog = new THREE.Fog(setColor, 6, 30)
  scene.fog = new THREE.FogExp2(setColor, 0.05)

  myState.scene = scene
}

const initializeCity = () => {
  const {
    town,
    smoke,
    city,
    camera,
    renderer,
    buildings,
    particles,
    renderGPU
  } = myState

  const segments = 1

  const cubes = new THREE.Group();
  const floors = new THREE.Group();

  for (let i = 1; i < buildings; i++) {
    let geometry
    if (renderGPU) {
      geometry = new THREE.BoxBufferGeometry(1, 0, 0, segments, segments, segments)
    } else {
      geometry = new THREE.BoxGeometry(1, 0, 0, segments, segments, segments)
    }
    const material = new THREE.MeshStandardMaterial({
      color: setTintColor(),
      wireframe: false,
      roughness: 0.3,
      flatShading: THREE.SmoothShading,
      side: THREE.DoubleSide
    })

    const cube = new THREE.Mesh(geometry, material)
    const floor = new THREE.Mesh(geometry, material)

    // Disable shadows to improve fps...
    cube.castShadow = false
    cube.receiveShadow = false

    cube.rotationValue = 0.1 + Math.abs(mathRandom(8))

    floor.scale.y = 0.05
    cube.scale.y = 0.1 + Math.abs(mathRandom(8)) / 2

    const cubeWidth = 0.9
    cube.scale.z = cubeWidth + mathRandom(1 - cubeWidth)
    cube.scale.x = cube.scale.z
    cube.position.y = cube.scale.y / 2
    cube.position.x = Math.round(mathRandom())
    cube.position.z = Math.round(mathRandom())

    floor.position.set(cube.position.x, 0, cube.position.z)

    cubes.add(cube)
    floors.add(floor)
  }

  town.add(floors)
  town.add(cubes)

  // Particles
  const gmaterial = new THREE.MeshToonMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
  let gparticular

  if (renderGPU) {
    gparticular = new THREE.SphereBufferGeometry(0.01, 32, 32)
  } else {
    gparticular = new THREE.SphereGeometry(0.01, 32, 32)
  }

  const aparticular = 10
  const particlesGroup = new THREE.Group()

  for (let h = 1; h < particles; h++) {
    const particular = new THREE.Mesh(gparticular, gmaterial)
    particular.position.set(mathRandom(aparticular), mathRandom(aparticular), mathRandom(aparticular))
    particular.rotation.set(mathRandom(), mathRandom(), mathRandom())
    particlesGroup.add(particular)
  }

  smoke.add(particlesGroup)

  const pmaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    opacity: 0.9,
    transparent: true
  })

  const pgeometry = new THREE.PlaneGeometry(60, 60)
  const pelement = new THREE.Mesh(pgeometry, pmaterial)
  pelement.rotation.x = -90 * Math.PI / 180
  pelement.position.y = -0.001
  pelement.receiveShadow = false // disable shadow

  city.add(pelement)

  myState.town = town
  myState.smoke = smoke
  myState.city = city
  myState.camera = camera
  myState.renderer = renderer
  myState.buildings = buildings
  myState.particles = particles
}

const initializeLights = () => {
  const {
    smoke,
    city,
    scene,
    town
  } = myState

  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 4)
  const lightFront = new THREE.SpotLight(0xFFFFFF, 20, 10)
  const lightBack = new THREE.PointLight(0xFFFFFF, 0.5)

  const spotLightHelper = new THREE.SpotLightHelper(lightFront)
  // scene.add(spotLightHelper)

  lightFront.rotation.x = 45 * Math.PI / 180
  lightFront.rotation.z = -45 * Math.PI / 180
  lightFront.position.set(5, 5, 5)
  lightFront.castShadow = true
  lightFront.shadow.mapSize.width = 6000
  lightFront.shadow.mapSize.height = lightFront.shadow.mapSize.width
  lightFront.penumbra = 0.1
  lightBack.position.set(0, 6, 0)

  smoke.position.y = 2

  scene.add(ambientLight)
  city.add(lightFront)
  scene.add(lightBack)
  scene.add(city)
  city.add(smoke)
  city.add(town)

  myState.scene = scene
  myState.city = city
}

const mouseFunctions = () => {
  const {
    camera,
    renderer
  } = myState

  const onMouseDown = (event) => {
    event.preventDefault()
    myState.canRotate = false
  }

  const onMouseUp = (event) => {
    event.preventDefault()
    myState.canRotate = true
  }

  // THREE.OrbitControls(camera, renderer.domElement)

  renderer.domElement.addEventListener('mousedown', onMouseDown, false)
  renderer.domElement.addEventListener('mouseup', onMouseUp, false)
}

const animate = () => {
  const {
    smoke,
    city,
    camera,
    renderer,
    scene,
    canRotate,
    animationRunning
  } = myState

  if (!animationRunning) return

  requestAnimationFrame(animate)

  if (canRotate) {
    const now = performance.now() / 10000
    const cameraRotationX = Math.cos(now) * 20
    const cameraRotationZ = Math.sin(now) * 20
    const cameraRotationY = 12

    if (camera.position.y !== 12) {
      camera.position.x += (cameraRotationX - camera.position.x) * 0.005
      camera.position.y += (cameraRotationY - camera.position.y) * 0.005
      camera.position.z += (cameraRotationZ - camera.position.z) * 0.005
    } else {
      camera.position.x = cameraRotationX
      camera.position.z = cameraRotationZ
    }
  }

  // Snow Fall
  smoke.children.forEach(snow => {
    if (snow.position.y < -2.5) {
      snow.position.y = 5
    } else {
      snow.position.y -= 0.03
    }
  })

  camera.lookAt(city.position)
  renderer.render(scene, camera)
}

const start = (canvas) => {
  new Promise(resolve => initializeCanvas(resolve, canvas))
  .then(() => initializeCamera())
  .then(() => initializeFogBackground())
  .then(() => initializeCity())
  .then(() => initializeLights())
  .then(() => mouseFunctions())
  // .then(() => {
  // 	this.gridHelper()
  // })
  .then(() => animate())
}


/**
 * utils
 */
const setTintColor = () => {
  let { setColor, setTintNum } = myState

  if (setTintNum) {
    setTintNum = false
    setColor = 0x000000
  } else {
    setTintNum = true
    setColor = 0x000000
  }

  myState.setColor = setColor
  myState.setTintNum = setTintNum

  return setColor
}

const changeBuildingColors = () => {
  setTintColor()
}

/**
 * helpers
 */
const gridHelper = () => {
  const { city } = myState
  const gridHelper = new THREE.GridHelper(60, 120, 0xFF0000, 0x000000)
  city.add(gridHelper)

  myState.city = city
}

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

onmessage = function(event) {
  const { type, data } = event.data
  let response = null

  switch (type) {
    case 'start':
      const canvas = data.canvas

      myState.innerWidth = data.innerWidth
      myState.innerHeight = data.innerHeight
      myState.animationRunning = data.animationRunning

      start(canvas)
      break;

    case 'resize':
      myState.innerWidth = data.innerWidth
      myState.innerHeight = data.innerHeight

      onWindowResize()
      break;

    case 'setState':
      myState = {...myState, ...data}
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