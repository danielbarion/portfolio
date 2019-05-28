/**
 * dependencies
 */
import React, { Component } from 'react'
import { appContext } from 'context/app-context'
import { ReactComponent as LogoTest } from 'assets/svg/logo_test.svg'

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
		/**
		 * classNames
		 */
		const _root = 'app'
		const _header = `${_root}-header`
		const _navigation = `${_header}-navigation`
		const _logo = `${_header}-logo`

		/**
		 * render functions
		 */
		const main = () => (
			<div className={_root}>
				{header()}
			</div>
		)

		const header = () => (
			<div className={_header} id="header">
				{logo()}
				{navigation()}
			</div>
		)

		const logo = () => (
			<div className={_logo}>
				<LogoTest />
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