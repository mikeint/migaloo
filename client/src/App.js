import React, { Component } from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import { PrivateAccountManagerRoute, PrivateRecruiterRoute, PrivateEmployerRoute } from './PrivateRoute'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import BrowserTracer from './components/BrowserTracer/BrowserTracer'

//App routes
import Login from './pages/Login/Login'
import RecruiterRouter from './pages/recruiter/RecruiterRouter'
import AccountManagerRouter from './pages/accountManager/AccountManagerRouter'
import EmployerRouter from './pages/employer/EmployerRouter'
import EmployerJobPost from './pages/employer/EmployerJobPost/EmployerJobPost'
import AuthRouter from './pages/auth/AuthRouter'


//Landing page 2 routes
import Landing from './landing_2/Landing/Landing'
import LandingRouter from './landing_2/LandingRouter'
import red from '@material-ui/core/colors/red';

import './App.css';

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    movingBackground:{
        backgroundImage: 'linear-gradient(120deg, #a6c4ce 0%, #465c74 100%)',
        animation: 'Gradient 7s ease infinite',
        textAlign: 'center',
        position: 'fixed',
        width: '100%',
        height: '100%',
        backgroundSize: '400% 400%'
    }, 
    redButton: {
      color: 'white',
      backgroundColor: red[500],
      '&:hover': {
        backgroundColor: red[700],
      },
    },
    table:{
        tableBody:{
            width: '100%', 
        },
        tableHeading:{
            color: "#000", 
            backgroundColor: "#efefef", 
            padding: '0px 10px',
            textAlign: "center",
            fontWeight: 'bold',
            '@media (max-width: 1024px)': {
                padding: "0px 5px 0px 5px",
            }, 
        },
        tableCellHeader:{ 
            textAlign: 'center',
            padding: '0px 10px'
        }, 
        tableCell: { 
            borderBottom: "1px solid #1a2b6d14",
            padding: '0px 10px',
            textAlign: "center",
            '@media (max-width: 1024px)': {
                padding: "0px 5px 0px 5px",
            }, 
        }, 
        tableRow: {
            "&:nth-child(even)": {
                background: "#f2f3f5",
            },  
        }
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
                            <PrivateRecruiterRoute exact path='/recruiter' redirect='/recruiter/jobList' /> { /* Reroute to the first recruiter page */ }
                            <PrivateRecruiterRoute strict path='/recruiter' component={RecruiterRouter} />
                        </Switch>
                        <Switch>
                            <PrivateAccountManagerRoute exact path='/accountManager' redirect='/accountManager/activeJobs' /> { /* Reroute to the first employer page */ }
                            <PrivateAccountManagerRoute strict path='/accountManager' component={AccountManagerRouter} />
                        </Switch>
                        <Switch>
                            <PrivateEmployerRoute exact path='/employer' redirect='/employer/activeJobs' /> { /* Reroute to the first employer page */ }
                            <PrivateEmployerRoute strict path='/employer' component={EmployerRouter} />
                        </Switch>
                        <Route exact path='/login' render={ () => (<Login />) } />
                        <Route exact path='/postJob/:token' component={EmployerJobPost} />
                        <Route exact path='/' component={Landing} />

                        <Route strict path='/recruiterPage' component={LandingRouter} />
                        <Route strict path='/employerPage' component={LandingRouter} />
                        <Route strict path='/landing' component={LandingRouter} />
                        <Route strict path='/auth' component={AuthRouter} />
                    </React.Fragment>
                </BrowserRouter> 
                <BrowserTracer />
                
            </MuiThemeProvider>
        );
    }
}

export default App;
