import React, { Component } from "react";
import { Route, HashRouter } from "react-router-dom";
import Landing from './layout/Landing/Landing';
import Login from './Admin/Login/Login';
import AddCar from './Admin/AddCar/AddCar';

import Hub from './Admin/Hub/Hub';
import PrivateRoute from './PrivateRoute';
import AuthFunctions from './AuthFunctions'; 

import './App.css';
 
class App extends Component { 
    constructor() {
        super();
		this.state = {
            user: '',
			token: '',
		};
        this.Auth = new AuthFunctions();
	}

    componentDidMount = () => {
        this.setState({
            user: this.Auth.getUser() || "",
			token: this.Auth.getToken() || ""
        });
    }

    render() {

        return ( 
            <HashRouter>
                <React.Fragment>
                    <PrivateRoute exact path="/hub" component={Hub} user={this.state.user} token={this.state.token}/>
                    <PrivateRoute exact path="/addCar" component={AddCar} user={this.state.user} token={this.state.token}/>
                    <Route exact path="/" component={Landing} />
                    <Route exact path='/login' render={ () => (<Login />) } />

                    <Route exact path="/carSaleSlider" component={Landing} />
                    <Route exact path="/carSoldSlider" component={Landing} />
                    <Route exact path="/about" component={Landing} /> 
                    <Route exact path="/contact" component={Landing} />
                </React.Fragment>
            </HashRouter> 
        );
    }
}

export default App;

