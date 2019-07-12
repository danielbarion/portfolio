/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import canvasWorkerJS from './canvas.worker.js'
import { city } from './canvas.main.js'

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
		window.addEventListener('startCityAnimation', this.startAnimation, false)
		window.addEventListener('stopCityAnimation', this.stopAnimation, false)
		console.log(city)
		this.start()
	}

	componentWillUnmount() {
		this.canvasWorker.terminate()
	}

	/**
	 * funcs
	 */
	start() {
		const { animationRunning } = this.state
		const canvasElement = document.getElementById('city')
		if (canvasElement.transferControlToOffscreen) {
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
		} else {
			city.startAnimation(
				{
					canvas: offscreen,
					innerWidth: window.innerWidth,
					innerHeight: window.innerHeight,
					animationRunning
				}
			)
		}
	}

	handleWorkerCallback(data) {
		// do nothing.
		// console.log('call back data: ', data)
	}

	/**
	* helpers
	*/
	onWindowResize() {
		const canvasElement = document.getElementById('city')
		if (canvasElement.transferControlToOffscreen) {
			this.canvasWorker.postMessage({
				type: 'resize',
				data: {
					innerWidth: window.innerWidth,
					innerHeight: window.innerHeight
				}
			})
		} else {
			city.resize({
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight
			})
		}
	}

	startAnimation() {
		const canvasElement = document.getElementById('city')
		if (canvasElement.transferControlToOffscreen) {
			this.canvasWorker.postMessage({
				type: 'startAnimation',
				data: {
					animationRunning: true
				}
			})
		} else {
			city.startAnimation()
		}

		this.setState({ animationRunning: true })
	}

	stopAnimation() {
		const canvasElement = document.getElementById('city')
		if (canvasElement.transferControlToOffscreen) {
			this.canvasWorker.postMessage({
				type: 'stopAnimation',
				data: {
					animationRunning: false
				}
			})
		} else {
			city.stopAnimation()
		}

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