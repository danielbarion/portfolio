/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import { ReactComponent as Logo } from 'assets/svg/logo_test.svg'
import { ReactComponent as Bottom } from 'assets/svg/bottom.svg'

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {}

		/**
		 * binded funcs
		 */
		// this.firstFunction = this.firstFunction.bind(this)
	}

	/**
	 * lifecycle
	 */

	/**
	 * funcs
	 */

	/**
	* React Render
	*/
	render() {
		// https://codepen.io/vcomics/pen/aGmoae
		/**
		 * classNames
		 */
		const _root = 'app'
		const _header = `${_root}-header`
		const _navigation = `${_header}-navigation`
		const _logo = `${_header}-logo`
		const _bottom = `${_header}-bottom`

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root}>
				{header()}
			</div>
		)

		const header = () => (
			<div className={_header}>
				{logo()}
				{navigation()}
				{bottom()}
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