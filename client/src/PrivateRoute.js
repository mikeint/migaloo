import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import AuthFunctions from './AuthFunctions';

const Auth = new AuthFunctions();

class PrivateRecruiterRoute extends Route {
    render(){
        if(this.state.match){
            if(this.props.redirect != null)
                return <Redirect to={this.props.redirect} />
            else{
                if(Auth.loggedIn() === true && Auth.getUser().userType === 1){
                    if(Auth.isVerified())
                        return super.render()
                    else
                        return <Redirect to='/auth/pendingVerification' />
                }
                else
                    return <Redirect to='/login' />
            }
        }else{
            return null
        }
    }
}
class PrivateEmployerRoute extends Route {
    render(){
        if(this.state.match){
            if(this.props.redirect != null)
                return <Redirect to={this.props.redirect} />
            else{
                if(Auth.loggedIn() === true && Auth.getUser().userType === 2){
                    if(Auth.isVerified())
                        return super.render()
                    else
                        return <Redirect to='/auth/pendingVerification' />
                }
                else
                    return <Redirect to='/login' />
            }
        }else{
            return null
        }
    }
}
export {
    PrivateEmployerRoute,
    PrivateRecruiterRoute
 };