/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import { ReactComponent as Logo } from 'assets/svg/logo.svg'
import { ReactComponent as Bottom } from 'assets/svg/bottom.svg'
import { TweenMax, Power1, Power2 } from "gsap/TweenMax"

const THREE = window.THREE

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			buildings: 100,
			particles: 3000,
			renderer: null,
			cityElem: null,
			camera: null,
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
	}

	/**
	 * lifecycle
	 */
	componentDidMount() {
		window.addEventListener('resize', this.onWindowResize, false)
		this.start()
	}

	/**
	 * funcs
	 */
	start() {
		this.initializeCanvas()
		setTimeout(() => (
			this.initializeFogBackground(),
			this.initializeCity(),
			this.initializeLights(),
			this.mouseFunctions(),
			this.generateLines()
			// this.gridHelper()
		), 300)
		setTimeout(() => this.animate(), 600)
	}

	initializeCanvas() {
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			powerPreference: 'high-performance',
			alpha: true,
			depth: true,
		})
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.domElement.id = "city"

		if (window.innerWidth > 800) {
			renderer.shadowMap.enabled = true
			renderer.shadowMap.type = THREE.PCFSoftShadowMap
			renderer.shadowMap.needsUpdate = true
			renderer.toneMapping = THREE.ReinhardToneMapping
		}

		const cityElem = document.querySelector('.app-city')
		cityElem.appendChild(renderer.domElement)

		this.setState({ renderer, cityElem }, () => this.initializeCamera())
	}

	initializeCamera() {
		const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 500)

		// very close
		// camera.position.set(0, 2, 14)
		// little far
		camera.position.set(0, 6, 16)

		this.setState({ camera })
	}

	initializeFogBackground() {
		const { scene, setColor } = this.state

		scene.background = new THREE.Color(setColor)
		scene.fog = new THREE.Fog(setColor, 6, 30)
		// scene.fog = new THREE.Fog(setColor, 10, 16)
		// scene.fog = new THREE.FogExp2(setColor, 0.05)

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
				//opacity:0.9,
				//transparent:true,
				roughness: 0.3,
				// metalness: 1,
				flatShading: THREE.SmoothShading,
				// flatShading: THREE.FlatShading,
				side: THREE.DoubleSide
			})

			// const wmaterial = new THREE.MeshLambertMaterial({
			// 	// color: 0xFFFFFF,
			// 	color: 0x000000,
			// 	wireframe: true,
			// 	transparent: true,
			// 	opacity: 0.03,
			// 	side: THREE.DoubleSide,
			// 	// shading:THREE.FlatShading
			// })

			const cube = new THREE.Mesh(geometry, material)
			// const wire = new THREE.Mesh(geometry, wmaterial)
			const floor = new THREE.Mesh(geometry, material)
			// const wfloor = new THREE.Mesh(geometry, wmaterial)

			// cube.add(wfloor)
			cube.castShadow = true
			cube.receiveShadow = true
			cube.rotationValue = 0.1 + Math.abs(this.mathRandom(8))

			// floor.scale.x = floor.scale.z = 1+this.mathRandom(0.33)
			floor.scale.y = 0.05 //+this.mathRandom(0.5)
			cube.scale.y = 0.1 + Math.abs(this.mathRandom(8)) / 2
			// cube.scale.y = 0.1 + Math.abs(this.mathRandom(8))

			// TweenMax.to(cube.scale, 1, {y:cube.rotationValue, repeat:-1, yoyo:true, delay:i*0.005, ease:Power1.easeInOut})
			/* cube.setScale = 0.1+Math.abs(this.mathRandom())

			TweenMax.to(cube.scale, 4, {y:cube.setScale, ease:Elastic.easeInOut, delay:0.2*i, yoyo:true, repeat:-1})
			TweenMax.to(cube.position, 4, {y:cube.setScale / 2, ease:Elastic.easeInOut, delay:0.2*i, yoyo:true, repeat:-1}) */

			var cubeWidth = 0.9
			cube.scale.z = cubeWidth + this.mathRandom(1 - cubeWidth)
			cube.scale.x = cube.scale.z
			cube.position.y = cube.scale.y / 2
			cube.position.x = Math.round(this.mathRandom())
			cube.position.z = Math.round(this.mathRandom())

			floor.position.set(cube.position.x, 0/*floor.scale.y / 2*/, cube.position.z)
			// floor.position.set(cube.position.x, floor.scale.y / 2, cube.position.z)

			town.add(floor)
			town.add(cube)
		}

		// Particles
		const gmaterial = new THREE.MeshToonMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
		const gparticular = new THREE.CircleBufferGeometry(0.01, 3)
		const aparticular = 5

		for (let h = 1; h < particles; h++) {
			const particular = new THREE.Mesh(gparticular, gmaterial)
			particular.position.set(this.mathRandom(aparticular), this.mathRandom(aparticular), this.mathRandom(aparticular))
			particular.rotation.set(this.mathRandom(), this.mathRandom(), this.mathRandom())
			smoke.add(particular)
		}

		var pmaterial = new THREE.MeshPhongMaterial({
			color: 0x000000,
			side: THREE.DoubleSide,
			// roughness: 10,
			// metalness: 0.6,
			opacity: 0.9,
			transparent: true
		})

		var pgeometry = new THREE.PlaneGeometry(60, 60)
		var pelement = new THREE.Mesh(pgeometry, pmaterial)
		pelement.rotation.x = -90 * Math.PI / 180
		pelement.position.y = -0.001
		pelement.receiveShadow = true
		//pelement.material.emissive.setHex(0xFFFFFF + Math.random() * 100000)

		city.add(pelement)
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
			raycaster,
			mouse
		} = this.state

		function onMouseMove(event) {
			event.preventDefault()
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
		}
		function onDocumentTouchStart(event) {
			if (event.touches.length == 1) {
				event.preventDefault()
				mouse.x = event.touches[0].pageX - window.innerWidth / 2
				mouse.y = event.touches[0].pageY - window.innerHeight / 2
			}
		}
		function onDocumentTouchMove(event) {
			if (event.touches.length == 1) {
				event.preventDefault()
				mouse.x = event.touches[0].pageX - window.innerWidth / 2
				mouse.y = event.touches[0].pageY - window.innerHeight / 2
			}
		}

		function onMouseClick(event) {
			event.preventDefault()

			mouse.x = (event.clientX / window.innerWidth) * 3 - 1
			mouse.y = -(event.clientY / window.innerHeight) * 3 + 1
		}

		// window.addEventListener('mousemove', onMouseMove, false)
		// window.addEventListener('touchstart', onDocumentTouchStart, false )
		// window.addEventListener('touchmove', onDocumentTouchMove, false )
		// window.addEventListener('click', onMouseClick, false )
	}

	createLine(cScale = 2, cPos = 20, cColor = 0xFFFF00) {
		const { city } = this.state
		let {	createCarPos } = this.state
		var cMat = new THREE.MeshToonMaterial({ color: cColor, side: THREE.DoubleSide })
		var cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40)
		var cElem = new THREE.Mesh(cGeo, cMat)
		var cAmp = 3

		if (createCarPos) {
			createCarPos = false
			cElem.position.x = -cPos
			cElem.position.z = (this.mathRandom(cAmp))

			TweenMax.to(cElem.position, 3, { x: cPos, repeat: -1, yoyo: true, delay: this.mathRandom(3) })
		} else {
			createCarPos = true
			cElem.position.x = (this.mathRandom(cAmp))
			cElem.position.z = -cPos
			cElem.rotation.y = 90 * Math.PI / 180

			TweenMax.to(cElem.position, 5, { z: cPos, repeat: -1, yoyo: true, delay: this.mathRandom(3), ease: Power1.easeInOut })
		}
		cElem.receiveShadow = true
		cElem.castShadow = true
		cElem.position.y = Math.abs(this.mathRandom(5))
		city.add(cElem)
	}

	initializeLines() {

	}

	generateLines() {
		// for (var i = 0; i < 60; i++) {
		// 	this.createLine(0.1, 20)
		// }
	}

	setCamera() {
		this.createLine(0.1, 20, 0xFFFFFF)
		// TweenMax.to(camera.position, 1, {y:1+Math.random()*4, ease:Expo.easeInOut})
	}

	animate() {
		const {
			smoke,
			city,
			camera,
			renderer,
			scene,
			mouse,
			uSpeed,
			town
		} = this.state

		requestAnimationFrame(this.animate)

		const cityRotationX = Math.sin(performance.now() / 5000) * 15
		city.rotation.x = cityRotationX * Math.PI / 180

		const cityRotationY = (performance.now() / 5000) * 15
		city.rotation.y = cityRotationY * 0.025

		// const time = performance.now() * 0.00005

		// for (let index = 0, length = town.children.length; index < length; index++) {
		// 	const object = town.children[index]
		// 	// object.scale.y = Math.sin(time*50) * object.rotationValue
		// 	// object.rotation.y = (Math.sin((time/object.rotationValue) * Math.PI / 180) * 180)
		// 	// object.rotation.z = (Math.cos((time/object.rotationValue) * Math.PI / 180) * 180)
		// }

		smoke.rotation.y += 0.01
		smoke.rotation.x += 0.01

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
		// city
		// https://codepen.io/vcomics/pen/aGmoae

		// scenario
		// https://codepen.io/Mamboleoo/pen/MOwqOp

		// three
		// https://codepen.io/Mamboleoo/pen/XzXazN
		/**
		 * classNames
		 */
		const _root = 'app'
		const _city = `${_root}-city`
		const _header = `${_root}-header`
		const _navigation = `${_header}-navigation`
		const _logo = `${_header}-logo`
		const _bottom = `${_header}-bottom`

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root}>
				{city()}
				{header()}
			</div>
		)

		const header = () => (
			<div className={_header}>
				{/* {logo()} */}
				{/* {navigation()} */}
				{/* {bottom()} */}
			</div>
		)

		const city = () => (
			<div className={_city}></div>
		)

		const logo = () => (
			<div className={_logo}>
				<Logo />
			</div>
		)

		const bottom = () => (
			<div className={_bottom}>
				<Bottom />
			</div>
		)

		const navigation = () => (
			<div className={_navigation}>
				<ul>
					<li><a href="#header">Home</a></li>
					<li><a href="#header">About</a></li>
					<li><a href="#header">Projects</a></li>
					<li><a href="#header">Contact</a></li>
				</ul>
			</div>
		)

		return (
			<appContext.Consumer>
				{context => main(context)}
			</appContext.Consumer>
		)
	}
}

export default App