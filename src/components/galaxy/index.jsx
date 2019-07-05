/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import canvasWorkerJS from './canvas.worker.js'

const THREE = window.THREE

class Galaxy extends Component {
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
		this.getActiveAttr = this.getActiveAttr.bind(this)
		this.onWindowResize = this.onWindowResize.bind(this)
		this.startAnimation = this.startAnimation.bind(this)
		this.stopAnimation = this.stopAnimation.bind(this)
		this.start = this.start.bind(this)
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
		const { animationRunning } = this.state
		const canvasElement = document.getElementById('galaxy')
		const offscreen = canvasElement.transferControlToOffscreen()

		this.canvasWorker.postMessage({
			type: 'start',
			data: {
				canvas: offscreen,
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight,
				animationRunning
			}
		}, [offscreen])
	}

	handleWorkerCallback(data) {
		// do nothing.
		// console.log('call back data: ', data)
	}

	/**
	 * helpers
	 */
	onWindowResize() {
		this.canvasWorker.postMessage({
			type: 'resize',
			data: {
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight
			}
		})
	}

	startAnimation() {
		this.canvasWorker.postMessage({
			type: 'startAnimation',
			data: {
				animationRunning: true
			}
		})

		this.setState({ animationRunning: true })
	}

	stopAnimation() {
		this.canvasWorker.postMessage({
			type: 'stopAnimation',
			data: {
				animationRunning: false
			}
		})

		this.setState({ animationRunning: false })
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
			<div className={_root} data-active={this.getActiveAttr()}>
				<canvas id='galaxy'></canvas>
			</div>
		)


		return (
			<appContext.Consumer>
				{context => main(context)}
			</appContext.Consumer>
		)
	}
}

export default Galaxy