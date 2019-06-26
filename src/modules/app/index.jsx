/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import { ReactComponent as Top } from 'assets/svg/top.svg'
import { ReactComponent as Logo } from 'assets/svg/logo.svg'
import { ReactComponent as Bottom } from 'assets/svg/bottom.svg'
import City from 'components/city'


class App extends Component {
	constructor(props) {
		super(props)
		this.state = {}

		/**
		 * binded funcs
		 */
		// this.initializeCanvas = this.initializeCanvas.bind(this)

	}

	/**
	 * lifecycle
	 */
	componentDidMount() {}

	/**
	 * funcs
	 */


	/**
	 * helpers
	 */


	/**
	 * events
	 */
	startCityAnimation() {
		window.dispatchEvent(new CustomEvent('startCityAnimation'))
	}
	stopCityAnimation() {
		window.dispatchEvent(new CustomEvent('stopCityAnimation'))
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
		const _header = `${_root}-header`
		const _headerText = `${_header}-text`
		const _headerTitle = `${_headerText}-title`
		const _headerDescription = `${_headerText}-description`
		const _navigation = `${_header}-navigation`
		const _navigationBackground = `${_navigation}-background`
		const _logo = `${_header}-logo`
		const _bottom = `${_header}-bottom`

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root}>
				<City />
				{/* {logo()} */}
				{headerText()}
				{navigationBackground()}
				{navigation()}
				{bottom()}
			</div>
		)

		const headerText = () => (
			<div className={_headerText}>
				<div className={_headerTitle}>
					<h1>Lorem Ipsum</h1>
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
					<li><a href="#header" onClick={this.startCityAnimation}>Home</a></li>
					<li><a href="#header" onClick={this.stopCityAnimation}>About</a></li>
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