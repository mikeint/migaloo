import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import AuthFunctions from './AuthFunctions';

const Auth = new AuthFunctions();

const PrivateRecruiterRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
        rest.redirect != null ? 
            <Redirect to={rest.redirect} /> :
            (Auth.loggedIn() === true  && Auth.getUser().userType === 1
                ? <Component {...rest} {...props} />
                : <Redirect to='/login' />)
    )} />
)
const PrivateEmployerRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
        rest.redirect != null ? 
            <Redirect to={rest.redirect} /> :
            (Auth.loggedIn() === true && Auth.getUser().userType === 2
                ? <Component {...rest} {...props} />
                : <Redirect to='/login' />)
    )} />
)
module.exports = {
    PrivateEmployerRoute:PrivateEmployerRoute,
    PrivateRecruiterRoute:PrivateRecruiterRoute
};