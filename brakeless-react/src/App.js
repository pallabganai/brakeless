import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props, context) {
      super(props, context);
      this.state = {
        items:[]
      }
  }
  render() {
    const {items} = this.state;

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Pallab Twitch!!!</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        { items.map(item => <p>{item.id}</p>)}
      </div>
    );
  }

  componentDidMount() {
    var that= this;
    console.log("In componentDidMount");

    var apigClient = window.apigClientFactory.newClient();

    var params = {
      // This is where any modeled request parameters should be added.
      // The key is the parameter name, as it is defined in the API in API Gateway.
      // param0: '',
      // param1: ''
    };

    var body = {
      // This is where you define the body of the request,
    };

    var additionalParams = {
      // If there are any unmodeled query parameters or headers that must be
      //   sent with the request, add them here.
      headers: {
        // param0: '',
        // param1: ''
      },
      queryParams: {
        // param0: '',
        // param1: ''
      }
    };

    apigClient.breaklessGet(params, body, additionalParams)
        .then(function(result){
          console.log(result.data);
          that.setState(result.data);
        }).catch( function(result){
          console.log(result);
        });
  }
}

export default App;
