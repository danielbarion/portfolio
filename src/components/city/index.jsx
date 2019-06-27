/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'

const THREE = window.THREE

class City extends Component {
	constructor(props) {
		super(props)
		this.state = {
			animationRunning: true,
			canRotate: true,
			buildings: 200,
			particles: 1500,
			renderer: null,
			cityElem: null,
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
			setColor: 0x00adff,
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
		 * binded funcs
		 */
		this.initializeCanvas = this.initializeCanvas.bind(this)
		this.initializeCamera = this.initializeCamera.bind(this)
		this.initializeFogBackground = this.initializeFogBackground.bind(this)
		this.initializeCity = this.initializeCity.bind(this)
		this.initializeLights = this.initializeLights.bind(this)
		this.createLine = this.createLine.bind(this)
		this.setTintColor = this.setTintColor.bind(this)
		this.mouseFunctions = this.mouseFunctions.bind(this)
		this.onWindowResize = this.onWindowResize.bind(this)
		this.animate = this.animate.bind(this)
		this.startAnimation = this.startAnimation.bind(this)
		this.stopAnimation = this.stopAnimation.bind(this)
		this.hideCity = this.hideCity.bind(this)
		this.showCity = this.showCity.bind(this)
	}

	/**
	 * lifecycle
	 */
	componentDidMount() {
		window.addEventListener('resize', this.onWindowResize, false)
		window.addEventListener('startCityAnimation', this.startAnimation, false)
		window.addEventListener('stopCityAnimation', this.stopAnimation, false)
		this.start()
	}

	/**
	 * funcs
	 */
	start() {
		new Promise(resolve => this.initializeCanvas(resolve))
		.then(() => this.initializeCamera())
		.then(() => this.initializeFogBackground())
		.then(() => this.initializeCity())
		.then(() => this.initializeLights())
		.then(() => this.mouseFunctions())
		.then(() => this.generateLines())
		// .then(() => {
		// 	this.gridHelper()
		// })
		.then(() => this.animate())
	}

	initializeCanvas(resolve) {
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: 'high-performance',
			alpha: true,
			depth: true,
		})
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.domElement.id = "city"

		if (window.innerWidth > 800) {
			//disable shadow map and tonemapping to improve fps
			// renderer.shadowMap.enabled = true
			// renderer.shadowMap.type = THREE.PCFSoftShadowMap
			// renderer.shadowMap.needsUpdate = true
			// renderer.toneMapping = THREE.ReinhardToneMapping
		}

		const cityElem = document.querySelector('.city')
		cityElem.appendChild(renderer.domElement)

		this.setState({ renderer, cityElem }, () => resolve())
	}

	initializeCamera() {
		const { initialCameraPositions } = this.state
		const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 500)

		camera.position.set(0, 6, 16)
		camera.position.x = initialCameraPositions.x
		camera.position.y = initialCameraPositions.y
		camera.position.z = initialCameraPositions.z

		this.setState({ camera })
	}

	initializeFogBackground() {
		const { scene, setColor } = this.state

		scene.background = new THREE.Color(setColor)
		// scene.fog = new THREE.Fog(setColor, 6, 30)
		scene.fog = new THREE.FogExp2(setColor, 0.05)

		this.setState({ scene })
	}

	mathRandom(num = 8) {
		return - Math.random() * num + Math.random() * num
	}

	setTintColor() {
		let { setColor, setTintNum } = this.state

		if (setTintNum) {
			setTintNum = false
			setColor = 0x000000
		} else {
			setTintNum = true
			setColor = 0x000000
		}

		this.setState({ setColor, setTintNum })

		return setColor
	}

	changeBuildingColors() {
		this.setTintColor()
	}

	initializeCity() {
		const {
			town,
			smoke,
			city,
			camera,
			renderer,
			buildings,
			particles
		} = this.state

		const segments = 1

		for (let i = 1; i < buildings; i++) {
			const geometry = new THREE.BoxBufferGeometry(1, 0, 0, segments, segments, segments)
			const material = new THREE.MeshStandardMaterial({
				color: this.setTintColor(),
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

			cube.rotationValue = 0.1 + Math.abs(this.mathRandom(8))

			floor.scale.y = 0.05
			cube.scale.y = 0.1 + Math.abs(this.mathRandom(8)) / 2

			const cubeWidth = 0.9
			cube.scale.z = cubeWidth + this.mathRandom(1 - cubeWidth)
			cube.scale.x = cube.scale.z
			cube.position.y = cube.scale.y / 2
			cube.position.x = Math.round(this.mathRandom())
			cube.position.z = Math.round(this.mathRandom())

			floor.position.set(cube.position.x, 0, cube.position.z)

			town.add(floor)
			town.add(cube)
		}

		// Particles
		const gmaterial = new THREE.MeshToonMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
		const gparticular = new THREE.SphereBufferGeometry(0.01, 32, 32)
		const aparticular = 10

		for (let h = 1; h < particles; h++) {
			const particular = new THREE.Mesh(gparticular, gmaterial)
			particular.position.set(this.mathRandom(aparticular), this.mathRandom(aparticular), this.mathRandom(aparticular))
			particular.rotation.set(this.mathRandom(), this.mathRandom(), this.mathRandom())
			smoke.add(particular)
		}

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

		this.setState({
			town,
			smoke,
			city,
			camera,
			renderer,
			buildings,
			particles
		})
	}

	initializeLights() {
		const {
			smoke,
			city,
			scene,
			town
		} = this.state

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
	}

	mouseFunctions() {
		const {
			camera,
			renderer
		} = this.state

		const onMouseDown = (event) => {
			event.preventDefault()
			this.setState({ canRotate: false })
		}

		const onMouseUp = (event) => {
			event.preventDefault()
			this.setState({ canRotate: true })
		}

		THREE.OrbitControls(camera, renderer.domElement)

		renderer.domElement.addEventListener('mousedown', onMouseDown, false )
		renderer.domElement.addEventListener('mouseup', onMouseUp, false )
	}

	createLine(cScale = 2, cPos = 20, cColor = 0xFFFF00) {
		const { city } = this.state
		let {	createCarPos } = this.state
		const cMat = new THREE.MeshToonMaterial({ color: cColor, side: THREE.DoubleSide })
		const cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40)
		const cElem = new THREE.Mesh(cGeo, cMat)
		const cAmp = 3

		if (createCarPos) {
			createCarPos = false
			cElem.position.x = -cPos
			cElem.position.z = (this.mathRandom(cAmp))
		} else {
			createCarPos = true
			cElem.position.x = (this.mathRandom(cAmp))
			cElem.position.z = -cPos
			cElem.rotation.y = 90 * Math.PI / 180
		}

		cElem.receiveShadow = true
		cElem.castShadow = true
		cElem.position.y = Math.abs(this.mathRandom(5))
		city.add(cElem)
	}

	initializeLines() {}

	generateLines() {
		// for (let i = 0; i < 60; i++) {
		// 	this.createLine(0.1, 20)
		// }
	}

	setCamera() {
		this.createLine(0.1, 20, 0xFFFFFF)
	}

	animate() {
		const {
			smoke,
			city,
			camera,
			renderer,
			scene,
			canRotate,
			animationRunning
		} = this.state

		if (!animationRunning) return

		requestAnimationFrame(this.animate)

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

	/**
	 * helpers
	 */
	gridHelper() {
		const { city } = this.state
		const gridHelper = new THREE.GridHelper(60, 120, 0xFF0000, 0x000000)
		city.add(gridHelper)
	}

	startAnimation() {
		const { animationRunning } = this.state

		if (!animationRunning) {
			this.setState({ animationRunning: true }, () => this.animate())
		}
	}

	stopAnimation() {
		const { animationRunning } = this.state

		if (animationRunning) {
			this.setState({ animationRunning: false })
			this.hideCity()
		}
	}

	hideCity() {}

	showCity() {}

	/**
	 * events
	 */
	onWindowResize() {
		const { renderer, camera } = this.state

		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
	}

	/**
	* React Render
	*/
	render() {
		/**
		 * classNames
		 */
		const _root = 'city'

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root}></div>
		)


		return (
			<appContext.Consumer>
				{context => main(context)}
			</appContext.Consumer>
		)
	}
}

export default City