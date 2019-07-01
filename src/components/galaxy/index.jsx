/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'

const THREE = window.THREE

class Galaxy extends Component {
	constructor(props) {
		super(props)
		this.state = {
			animationRunning: this.props.isActive,
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
		 * binded funcs
		 */
		this.initializeCanvas = this.initializeCanvas.bind(this)
		this.initializeCamera = this.initializeCamera.bind(this)
		this.initializeFogBackground = this.initializeFogBackground.bind(this)
		this.initializeLights = this.initializeLights.bind(this)
		this.createMoon = this.createMoon.bind(this)
		this.createTerrain = this.createTerrain.bind(this)
		this.createStars = this.createStars.bind(this)
		this.updateStar = this.updateStar.bind(this)
		this.onWindowResize = this.onWindowResize.bind(this)
		this.animate = this.animate.bind(this)
		this.startAnimation = this.startAnimation.bind(this)
		this.stopAnimation = this.stopAnimation.bind(this)
		this.getActiveAttr = this.getActiveAttr.bind(this)
	}

	/**
	 * lifecycle
	 */
	componentDidMount() {
		window.addEventListener('resize', this.onWindowResize, false)
		window.addEventListener('startGalaxyAnimation', this.startAnimation, false)
		window.addEventListener('stopGalaxyAnimation', this.stopAnimation, false)
		this.start()
	}

	/**
	 * funcs
	 */
	start() {
		new Promise(resolve => this.initializeCanvas(resolve))
		.then(() => this.initializeFogBackground())
		.then(() => this.initializeCamera())
		.then(() => this.initializeLights())
		.then(() => this.createMoon())
		.then(() => this.createTerrain())
		.then(() => this.createStars())
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
		renderer.setClearColor(0x001a2d)
		renderer.domElement.id = "galaxy"

		if (window.innerWidth > 800) {
			//disable shadow map and tonemapping to improve fps
			// renderer.shadowMap.enabled = true
			// renderer.shadowMap.type = THREE.PCFSoftShadowMap
			// renderer.shadowMap.needsUpdate = true
			// renderer.toneMapping = THREE.ReinhardToneMapping
		}

		const galaxyElem = document.querySelector('.galaxy')
		galaxyElem.appendChild(renderer.domElement)

		this.setState({ renderer }, () => resolve())
	}

	initializeCamera() {
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200)

		camera.position.x = 70
		camera.position.y = 30
		camera.position.z = 5
		camera.lookAt(new THREE.Vector3())

		this.setState({ camera })
	}

	initializeFogBackground() {
		const { scene, setColor } = this.state

		// scene.background = new THREE.Color(setColor)
		scene.fog = new THREE.Fog(0x001a2d, 80, 140)
		// scene.fog = new THREE.FogExp2(setColor, 0.05)

		this.setState({ scene })
	}

	initializeLights() {
		const { scene } = this.state
		const moonLight = new THREE.PointLight(0xffffff, 2, 150)
		const moonLight2 = new THREE.PointLight(0xffffff, 0.6, 150)

		moonLight2.position.x += 20
		moonLight2.position.y -= 20
		moonLight2.position.z -= 25

		scene.add(moonLight)
		scene.add(moonLight2)

		this.setState({ moonLight, moonLight2 })
	}

	createMoon() {
		const {
			scene,
			moonLight
		} = this.state

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

		this.setState({ scene, moonLight })
	}

	createTerrain() {
		const {	scene	} = this.state
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

		this.setState({ scene, plane })
	}

	createStars() {
		const {
			stars,
			starsLights,
			scene,
			starsAmount
		} = this.state

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

		this.setState({ scene, stars, starsLights })
	}

	updateStar(star, index) {
		const { starsLights } = this.state

		if (star.position.x < -75) {
			star.position.x = 75
		} else 	if (star.position.x > 75) {
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

		this.setState({ starsLights })
	}

	animate() {
		const {
			camera,
			renderer,
			scene,
			animationRunning,
			stars,
			starsAmount
		} = this.state

		if (!animationRunning) return

		requestAnimationFrame(this.animate)

		for (let index = 0; index < starsAmount; index++) {
			this.updateStar(stars.children[index], index)
		}

		renderer.render(scene, camera)
	}

	/**
	 * helpers
	 */
	startAnimation() {
		const { animationRunning } = this.state

		if (!animationRunning) {
			this.setState({ animationRunning: true }, () => this.animate())
		}
	}

	stopAnimation() {
		const { animationRunning } = this.state

		if (animationRunning) {
			setTimeout(() => this.setState({ animationRunning: false }), 650)
		}
	}

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
	 * attrs
	 */
	getActiveAttr() {
		const { isActive } = this.props

		return isActive.toString()
	}

	/**
	* React Render
	*/
	render() {
		/**
		 * classNames
		 */
		const _root = 'galaxy'

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root} data-active={this.getActiveAttr()}></div>
		)


		return (
			<appContext.Consumer>
				{context => main(context)}
			</appContext.Consumer>
		)
	}
}

export default Galaxy