import React, { Component } from "react"
import { Route, BrowserRouter, Switch } from "react-router-dom"
import { PrivateEmployerRoute, PrivateRecruiterRoute } from './PrivateRoute'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

//App routes
import Login from './pages/Login/Login'
import RecruiterRouter from './pages/recruiter/RecruiterRouter'
import EmployerRouter from './pages/employer/EmployerRouter'
import AuthRouter from './pages/auth/AuthRouter'

//Landing page 2 routes
import Landing from './landing_2/Landing/Landing'
import LandingRouter from './landing_2/LandingRouter'
import SignUpFormEmployer from './landing_2/components/SignUpFormEmployer/SignUpFormEmployer'
import SignUpFormRecruiter from './landing_2/components/SignUpFormRecruiter/SignUpFormRecruiter'

import './App.css';

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    movingBackground:{
        backgroundImage: "linear-gradient(120deg, #a6c4ce 0%, #465c74 100%)",
        animation: "Gradient 7s ease infinite",
        textAlign: "center",
        position: "fixed",
        width: "100%",
        height: "100%",
        backgroundSize: "400% 400%"
    },
    palette: {
        primary: {
          // light: will be calculated from palette.primary.main,
          main: '#263c54',
          // dark: will be calculated from palette.primary.main,
          // contrastText: will be calculated to contrast with palette.primary.main
        },
        secondary: {
          // light: will be calculated from palette.primary.main,
          main: '#546f82',
          // dark: will be calculated from palette.secondary.main,
        },
        disabled: {
          // light: will be calculated from palette.primary.main,
          main: '#222222',
          // dark: will be calculated from palette.secondary.main,
        },
        // error: will use the default color
    },
    overrides: {
      Button: { // Name of the component ⚛️ / style sheet
        text: { // Name of the rule
          color: '#ff0000', // Some CSS
        },
      },
      MuiToolbar: { // Name of the component :atom_symbol: / style sheet
        root: { // Name of the rule
            backgroundColor: '#263c54', // Some CSS
            color: 'white', // Some CSS
        }
    }

    },
});

class App extends Component { 
    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <BrowserRouter>
                    <React.Fragment>
                        <Switch>
                            <PrivateRecruiterRoute exact path="/recruiter" redirect="/recruiter/jobList" /> { /* Reroute to the first recruiter page */ }
                            <PrivateRecruiterRoute strict path="/recruiter" component={RecruiterRouter} />
                        </Switch>
                        <Switch>
                            <PrivateEmployerRoute exact path="/employer" redirect="/employer/activeJobs" /> { /* Reroute to the first employer page */ }
                            <PrivateEmployerRoute strict path="/employer" component={EmployerRouter} />
                        </Switch>
                        <Route exact path='/login' render={ () => (<Login />) } />
                        <Route strict path="/auth" component={AuthRouter} />
                        <Route exact path="/" component={Landing} />

                        <Route strict path="/recruiterPage" component={LandingRouter} />
                        <Route strict path="/employerPage" component={LandingRouter} />
                        <Route strict path="/landing" component={LandingRouter} />

 
                        <Route exact path="/signUpFormEmployer" component={SignUpFormEmployer} /> 
                        <Route exact path="/signUpFormRecruiter" component={SignUpFormRecruiter} /> 
                    </React.Fragment>
                </BrowserRouter> 
                
            </MuiThemeProvider>
        );
    }
}

export default App;
