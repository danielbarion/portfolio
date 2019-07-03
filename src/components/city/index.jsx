/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import canvasWorkerJS from './canvas.worker.js'

const THREE = window.THREE

class City extends Component {
	constructor(props) {
		super(props)

    /**
     * worker
     */
		this.canvasWorker = canvasWorkerJS()
		this.canvasWorker.onmessage = (data) => this.handleWorkerCallback(data)

		/**
		 * state
		 */
		this.state = {
			animationRunning: this.props.isActive,
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
		 * binded funcs
		 */
		this.getActiveAttr = this.getActiveAttr.bind(this)
	}

	/**
	 * lifecycle
	 */
	componentDidMount() {
		// window.addEventListener('resize', this.onWindowResize, false)
		// window.addEventListener('startCityAnimation', this.startAnimation, false)
		// window.addEventListener('stopCityAnimation', this.stopAnimation, false)
		this.start()
	}

	componentWillUnmount() {
		this.canvasWorker.terminate()
	}

	/**
	 * funcs
	 */
	start() {
		const canvasElement = document.getElementById('city')
		const offscreen = canvasElement.transferControlToOffscreen()

		this.canvasWorker.postMessage({
			type: 'start',
			data: {
				canvas: offscreen,
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight
			}
		}, [offscreen])
	}

	handleWorkerCallback(data) {
		console.log('call back data: ', data)
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
		const _root = 'city'

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root} data-active={this.getActiveAttr()}>
				<canvas id='city'></canvas>
			</div>
		)


		return (
			<appContext.Consumer>
				{context => main(context)}
			</appContext.Consumer>
		)
	}
}

export default City