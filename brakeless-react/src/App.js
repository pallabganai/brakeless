import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';

var poolData = {
    UserPoolId : 'us-west-2_T5m4Y3WHx', // Your user pool id here
    ClientId : '272479ctuhfg363hqpiig5fm8o' // Your client id here
};
var userPool = new CognitoUserPool(poolData);

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

        <hr/>
        <h3>AWS Cognito Registration</h3>
        <table>
          <tr><td>User Name : </td><td><input type="text" placeholder="User Name" ref={(input) => {this.userName=input}} /></td></tr>
          <tr><td>Email Id : </td><td><input type="text" placeholder="Email Id" ref={(input) => {this.emailId=input}} /></td></tr>
          <tr><td>Valid Phone Number : </td><td><input type="text" placeholder="Phone Number" ref={(input) => {this.phoneNumber=input}} /></td></tr>
          <tr><td>Location : </td><td><input type="text" placeholder="Location" ref={(input) => {this.location=input}} /></td></tr>
          <tr><td>Password : </td><td><input type="password" placeholder="Password" ref={(input) => {this.password=input}} /></td></tr>
          <tr><td colSpan="2">&nbsp;</td></tr>
          <tr><td colSpan="2"><button onClick={(e) => this.doRegister(e)}>Register</button></td></tr>
        </table>

        <hr/>
        <h3>AWS Cognito Registration Confirmation</h3>
        <table>
          <tr><td>User Name : </td><td><input type="text" placeholder="User Name" ref={(input) => {this.confirmUserName=input}} /></td></tr>
          <tr><td>Confirmation Code : </td><td><input type="text" placeholder="Confirmation Code" ref={(input) => {this.confirmationCode=input}} /></td></tr>
          <tr><td colSpan="2">&nbsp;</td></tr>
          <tr><td colSpan="2"><button onClick={(e) => this.doConfirmRegistration(e)}>Confirm Code</button></td></tr>
        </table>

        <hr/>
        <h3>AWS Cognito Authentication</h3>
        <table>
          <tr><td>User Name : </td><td><input type="text" placeholder="User Name" ref={(input) => {this.authUserName=input}} /></td></tr>
          <tr><td>Password : </td><td><input type="password" placeholder="Password" ref={(input) => {this.authPassword=input}} /></td></tr>
          <tr><td colSpan="2">&nbsp;</td></tr>
          <tr><td colSpan="2"><button onClick={(e) => this.doAuthentication(e)}>Sign In</button></td></tr>
        </table>

        <hr/>
        <h3>AWS Lambda Call Result</h3>
        { items.map(item => <p>{item.id}</p>)}
      </div>
    );
  }

  doAuthentication(event) {
    var userName = this.authUserName.value;
    console.log("userName-" +userName);
    var password = this.authPassword.value;

    var authenticationData = {
        Username : userName,
        Password : password,
    };

    var authenticationDetails = new AuthenticationDetails(authenticationData);

    var userData = {
        Username : userName,
        Pool : userPool
    };

    var cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('access token + ' + result.getAccessToken().getJwtToken());

            var credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : 'us-west-2:00a44276-ce02-42eb-a6c5-7a1df2933e7c', // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-west-2.amazonaws.com/us-west-2_T5m4Y3WHx' : result.getIdToken().getJwtToken()
                }
            }, {
              region:"us-west-2"
            });

            console.log(credentials);

            // Instantiate aws sdk service objects now that the credentials have been updated.
            // example: var s3 = new AWS.S3();

        },

        onFailure: function(err) {
            alert(err);
        },

    });
  }

  doConfirmRegistration(event) {
    var userName = this.confirmUserName.value;
    console.log("userName-" +userName);
    var confirmationCode = this.confirmationCode.value;
    console.log("confirmationCode-" +confirmationCode);

    var userData = {
        Username : userName,
        Pool : userPool
    };

    var cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('call result: ' + result);
    });
  }

  doRegister(event) {
    console.log("Register");

    var userName = this.userName.value;
    console.log("userName-" +userName);
    var emailId = this.emailId.value;
    console.log("emailId-" +emailId);
    var phoneNumber = this.phoneNumber.value;
    console.log("phoneNumber-" +phoneNumber);
    var location = this.location.value;
    console.log("location-" +location);
    var password = this.password.value;

    console.log(userPool);

    var attributeList = [];

    var dataEmail = {
        Name : 'email',
        Value : emailId
    };

    var dataPhoneNumber = {
        Name : 'phone_number',
        Value : phoneNumber
    };

    var dataLocation = {
        Name : 'custom:location',
        Value : location
    };

    var attributeEmail = new CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);
    var attributeLocation = new CognitoUserAttribute(dataLocation);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
    attributeList.push(attributeLocation);

    userPool.signUp(userName, password, attributeList, null, function(err, result){
        if (err) {
            console.error(err);
            return;
        }
        var cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
    });
  }

  loadAuthenticatedUser() {
    var that= this;
    var cognitoUser = userPool.getCurrentUser();
    var creds;

    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }

            console.log('session validity: ' + session.isValid());

            AWS.config.region = 'us-west-2'; // Region
            creds = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : 'us-west-2:00a44276-ce02-42eb-a6c5-7a1df2933e7c', // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-west-2.amazonaws.com/us-west-2_T5m4Y3WHx' : session.getIdToken().getJwtToken()
                }
            });

            console.log(creds);
            console.log(session.getIdToken().getJwtToken());


            creds.refresh(function(err, data) {
              if (err) {
                console.log(err);
              } else {
                console.log("=====================================================");
                console.log(creds);
                console.log("identityId-" +creds.identityId);
                console.log("accessKeyId-" +creds.accessKeyId);
                console.log("secretAccessKey-" +creds.secretAccessKey);
                console.log("sessionToken-" +creds.sessionToken);

                var apigClient = window.apigClientFactory.newClient({
                    accessKey: creds.accessKeyId,
                    secretKey: creds.secretAccessKey,
                    sessionToken: creds.sessionToken, //OPTIONAL: If you are using temporary credentials you must include the session token
                    region: 'us-west-2' // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
                });

                // var apigClient = window.apigClientFactory.newClient({
                //   accessKey: credentials.accessKeyId,
                //   secretKey:  credentials.secretAccessKey,
                //   sessionToken: credentials.sessionToken, //OPTIONAL: If you are using temporary credentials you must include the session token
                //   region: "us-west-2" // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
                // });

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

                // //lAMBDA
                // var lambda = new AWS.Lambda({credentials: credentials, region: "us-west-2"});
                // var params = {
                //   FunctionName: 'breaklessFeatureList', /* required */
                //   InvocationType: 'RequestResponse',
                //   LogType: 'Tail',
                //   Payload: new Buffer('')
                // };
                // lambda.invoke(params, function(err, result) {
                //   if (err) console.log(err, err.stack); // an error occurred
                //   else { // successful response
                //     console.log('result-');
                //     var lmdPay = JSON.parse(result.Payload);
                //     var lmdBody = JSON.parse(lmdPay.body);
                //     console.log(lmdBody);
                //     console.log('result end');
                //     that.setState(lmdBody);
                //   }
                // });
              }
            });
        });
    }
  }

  componentDidMount() {
    this.loadAuthenticatedUser();

    // var that= this;
    // console.log("In componentDidMount");
    //
    // var apigClient = window.apigClientFactory.newClient();
    //
    // var params = {
    //   // This is where any modeled request parameters should be added.
    //   // The key is the parameter name, as it is defined in the API in API Gateway.
    //   // param0: '',
    //   // param1: ''
    // };
    //
    // var body = {
    //   // This is where you define the body of the request,
    // };
    //
    // var additionalParams = {
    //   // If there are any unmodeled query parameters or headers that must be
    //   //   sent with the request, add them here.
    //   headers: {
    //     // param0: '',
    //     // param1: ''
    //   },
    //   queryParams: {
    //     // param0: '',
    //     // param1: ''
    //   }
    // };
    //
    // apigClient.breaklessGet(params, body, additionalParams)
    //     .then(function(result){
    //       console.log(result.data);
    //       that.setState(result.data);
    //     }).catch( function(result){
    //       console.log(result);
    //     });
  }
}

export default App;
