import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {time: new Date(), connected: false};
  }

  componentDidMount() {
    
    this.client = new WebSocket("ws://localhost:1337/")
    this.client.onopen = this.OnOpen;
    this.client.onclose = this.OnClose;
    this.client.onmessage = this.OnMessage;
    this.client.onerror = this.OnError;

    //this.tick();
    this.timer = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick = () => {
    if (!this.state.connected) {
      return;
    }
    this.client.send('STATUS');
    this.setState({time: new Date()});
  }

  OnOpen = () => {
    this.setState({connected: true});
  }

  OnClose = () => {
    this.setState({connected: false});
  }

  OnMessage = (e) => {
    const message = e.data;
    const data = JSON.parse(message);
    console.log('data', data);
    this.setState({data: data})
  }

  OnError = (e) => {
    console.log('error', e.data);
  }

  SetLeds = (color) => {
    if (!this.state.connected) {
      return;
    }
    this.client.send(`LED ${color}`);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>{this.state.time.toString()}</p>
        <p>{this.state.connected.toString()}</p>
        {(this.state.data && this.state.data.error) && <p>{this.state.data.error}</p>}
        {(this.state.data && this.state.data.success) && <p>Success!</p>}
        <button onClick={() => this.SetLeds('white')}>On</button>
        <button onClick={() => this.SetLeds('off')}>Off</button>
        <button onClick={() => this.SetLeds('red')}>Red</button>
        <button onClick={() => this.SetLeds('rainbow')}>Rainbow</button>
        {(this.state.data) && <p>{JSON.stringify(this.state.data, null, 2)}</p>}
      </div>
    );
  }
}

export default App;
