import React, { Component } from 'react';
import Pages from "./pages"
import SocketClient from 'socket.io-client';

export default class App extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
  
  }

  render() {
    return <Pages />
  }

}

// export default App;
