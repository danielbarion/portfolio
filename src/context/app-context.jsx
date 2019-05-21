import React from 'react'

export const appContext = React.createContext()

class appProvider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

	/**
	 * React Render
	 */
  render() {
    return (
      <appContext.Provider value={{}}>
        { this.props.children }
      </appContext.Provider>
    )
  }
}

export default appProvider