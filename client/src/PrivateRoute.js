import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import AuthFunctions from './AuthFunctions';

const Auth = new AuthFunctions();

class PrivateRecruiterRoute extends Route {
    render(){
        if(this.state.match){
            return (this.props.redirect != null ? 
                <Redirect to={this.props.redirect} /> :
                (Auth.loggedIn() === true && Auth.getUser().userType === 1
                    ? super.render()
                    : <Redirect to='/login' />))
        }else{
            return null
        }
    }
}
class PrivateEmployerRoute extends Route {
    render(){
        if(this.state.match){
            return (this.props.redirect != null ? 
                <Redirect to={this.props.redirect} /> :
                (Auth.loggedIn() === true && Auth.getUser().userType === 2
                    ? super.render()
                    : <Redirect to='/login' />))
        }else{
            return null
        }
    }
}
module.exports = {
    PrivateEmployerRoute:PrivateEmployerRoute,
    PrivateRecruiterRoute:PrivateRecruiterRoute
};