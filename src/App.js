import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {time: new Date(), connected: false, message: 'started'};
  }

  componentDidMount() {
    
    this.client = new WebSocket("ws://192.168.1.109:1337/")
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
    this.setState({message: 'error: ' + e + ' ' + JSON.stringify(e)})
  }

  SetLeds = (color) => {
    if (!this.state.connected) {
      return;
    }
    this.client.send(`LED ${color}`);
  }

  Reload = () => {
    window.location.reload()
  }

  render() {

    let information = [];
    let cells = [];
    if( this.state.data && this.state.data.PackVoltage ) {
      information = [
        {title: 'Voltage', value: this.state.data.PackVoltage.toFixed(2) + ' V' },
        {title: 'Current', value: this.state.data.PrimaryCurrent.toFixed(2) + ' A' },
        {title: 'Amp Hours', value: this.state.data.PackAmpHours.toFixed(2) + ' Ah' },
        {title: 'State of Charge', value: (this.state.data.PackAmpHours * 100 / 40).toFixed(2) + '%' },
      ];
      const cell_count = this.state.data.CellTemp.length;
      for( let i = 0; i < cell_count; ++i ) {
        cells.push( {index: i, voltage: this.state.data.CellVoltage[i].toFixed(2), temperature: this.state.data.CellTemp[i]});
      }
    }

    return (
      <div className="App">
        
        {(this.state.data && this.state.data.error) && <p>{this.state.data.error}</p>}
        {(this.state.data && this.state.data.success) && <p>Success!</p>}
       
        <div className="container">
          <h1>Sailboat</h1>
          <div className="item">
          {this.state.connected ? 'CONNECTED ' : 'DISCONNECTED '}
          <a onClick={() => this.Reload()}>(Refresh)</a>
          </div>
          {information.map( (element, i) => (<div className="item" key={i}><span>{element.title}: </span><span>{element.value}</span></div>) )}

          <div className="cellContainer">
            {cells.map((element, i) => (
            <div className="cell" key={i}>
            <span className="cellIndex">cell {element.index}</span>
            <span className="cellVoltage">{element.voltage} V</span>
            <span className="cellTemp">{element.temperature} F</span>
            </div>
          ))}
            </div>
        </div>
        <div className="LedControls">
          <button onClick={() => this.SetLeds('white')}>On</button>
          <button onClick={() => this.SetLeds('off')}>Off</button>
          <button onClick={() => this.SetLeds('red')}>Red</button>
          <button onClick={() => this.SetLeds('rainbow')}>Rainbow</button>
        </div>
      </div>
    );
  }
}

export default App;
