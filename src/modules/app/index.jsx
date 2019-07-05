/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import { ReactComponent as Top } from 'assets/svg/top.svg'
import { ReactComponent as Logo } from 'assets/svg/logo.svg'
import { ReactComponent as Bottom } from 'assets/svg/bottom.svg'
import City from 'components/city'
import Galaxy from 'components/galaxy'


class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			scenes: [
				{ name: 'city', active: true },
				{ name: 'galaxy', active: false }
			]
		}

		/**
		 * binded funcs
		 */
		this.getActiveScene = this.getActiveScene.bind(this)
		this.selectScene = this.selectScene.bind(this)
	}

	/**
	 * lifecycle
	 */
	componentWillMount() {
		window.showTransitionElement = this.showTransitionElement
		window.hideTransitionElement = this.hideTransitionElement
	}

	componentDidMount() {}

	componentWillUnmount() {
		window.showTransitionElement = null
		window.hideTransitionElement = null
	}

	/**
	 * funcs
	 */
	getActiveScene(name) {
		const { scenes } = this.state

		const [selectedScene] = scenes.filter(scene => scene.name == name)

		return selectedScene.active
	}

	selectScene(name) {
		const { scenes } = this.state
		let previousActiveIndex
		let nextActiveIndex

		scenes.forEach((scene, index) => {
			if (scene.active) previousActiveIndex = index
			if (scene.name == name)	nextActiveIndex = index
		})

		if (nextActiveIndex == previousActiveIndex) {
			return
		}

		window.showTransitionElement()

		setTimeout(() => {
			this.stopSelectedAnimation(previousActiveIndex)
			this.startSelectedAnimation(nextActiveIndex)
			window.hideTransitionElement()
		}, 650)
	}

	/**
	 * helpers
	 */


	/**
	 * events
	 */
	startSelectedAnimation(index) {
		const { scenes } = this.state
		const scene = scenes[index]
		scene.active = true

		this.setState({ scene }, () => {
			window.dispatchEvent(new CustomEvent(`start${scene.name.charAt(0).toUpperCase() + scene.name.slice(1)}Animation`))
		})
	}
	stopSelectedAnimation(index) {
		const { scenes } = this.state
		const scene = scenes[index]
		scene.active = false

		this.setState({ scene }, () => {
			window.dispatchEvent(new CustomEvent(`stop${scene.name.charAt(0).toUpperCase() + scene.name.slice(1)}Animation`))
		})
	}

	showTransitionElement() {
		// Todo: move this function to context
		const transitionElement = document.querySelector('.transition-element')
		transitionElement.setAttribute('active', 'true')
	}

	hideTransitionElement() {
		// Todo: move this function to context
		const transitionElement = document.querySelector('.transition-element')
		transitionElement.setAttribute('active', 'false')
		setTimeout(() => transitionElement.removeAttribute('active'), 650)
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


		// Fundamentals
		// https://threejsfundamentals.org/threejs/lessons/threejs-primitives.html

		/**
		 * classNames
		 */
		const _root = 'app'
		const _header = `${_root}-header`
		const _headerText = `${_header}-text`
		const _headerTitle = `${_headerText}-title`
		const _headerDescription = `${_headerText}-description`
		const _navigation = `${_header}-navigation`
		const _navigationBackground = `${_navigation}-background`
		const _logo = `${_header}-logo`
		const _bottom = `${_header}-bottom`
		const _transitionElement = 'transition-element'

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root}>
				<City isActive={this.getActiveScene('city')} />
				<Galaxy isActive={this.getActiveScene('galaxy')} />
				{transitionElement()}
				{/* {logo()} */}
				{headerText()}
				{navigationBackground()}
				{navigation()}
				{bottom()}
			</div>
		)

		const transitionElement = () => (
			<div className={_transitionElement}></div>
		)

		const headerText = () => (
			<div className={_headerText}>
				<div className={_headerTitle}>
					<h1>Hello, welcome!</h1>
				</div>
				<div className={_headerDescription}>
					<p>Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet .</p>
				</div>
			</div>
		)

		const navigationBackground = () => (
			<div className={_navigationBackground}>
				<Top />
			</div>
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
					<li><a href="#" onClick={this.selectScene.bind(this, 'city')}>Home</a></li>
					<li><a href="#" onClick={this.selectScene.bind(this, 'galaxy')}>About</a></li>
					<li><a href="#" onClick={this.selectScene.bind(this, 'city')}>Projects</a></li>
					<li><a href="#" onClick={this.selectScene.bind(this, 'galaxy')}>Contact</a></li>
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