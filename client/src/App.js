import React, { Component } from "react";
import { Route, BrowserRouter, Switch } from "react-router-dom";
import { PrivateEmployerRoute, PrivateRecruiterRoute } from './PrivateRoute';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'; 

//App routes
import Login from './pages/Login/Login';
import RecruiterRouter from './pages/recruiter/RecruiterRouter';
import EmployerRouter from './pages/employer/EmployerRouter';

//Landing page 1 routes
import AboutTeamPage from './landing_1/AboutTeamPage/AboutTeam';
import SignUpFormEmployer from './landing_1/components/SignUpFormEmployer/SignUpFormEmployer';
import SignUpFormRecruiter from './landing_1/components/SignUpFormRecruiter/SignUpFormRecruiter';

//Landing page 2 routes
import Landing from './landing_2/Landing/Landing';

import RecruiterPage from './landing_2/Recruiter/Recruiter';
import HowItWorks_recruiter from './landing_2/Recruiter/HowItWorks/HowItWorks';
import Pricing_recruiter from './landing_2/Recruiter/Pricing/Pricing';
import EmployerPage from './landing_2/Employer/Employer';
import HowItWorks_employer from './landing_2/Employer/HowItWorks/HowItWorks';
import Pricing_employer from './landing_2/Employer/Pricing/Pricing';

import Contact from './landing_2/Contact/Contact';
import About from './landing_2/About/About';
import Team from './landing_2/Team/Team';

import './App.css';

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
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
                        <Route exact path="/" component={Landing} />
                        <Route exact path="/AboutTeamPage" component={AboutTeamPage} /> 

                        <Route exact path="/recruiterPage" component={RecruiterPage} />
                        <Route exact path="/howItWorks_recruiter" component={HowItWorks_recruiter} />
                        <Route exact path="/pricing_recruiter" component={Pricing_recruiter} />

                        <Route exact path="/employerPage" component={EmployerPage} /> 
                        <Route exact path="/howItWorks_employer" component={HowItWorks_employer} />
                        <Route exact path="/pricing_employer" component={Pricing_employer} />


                        <Route exact path="/contact" component={Contact} />
                        <Route exact path="/about" component={About} />
                        <Route exact path="/team" component={Team} />

                        <Route exact path="/signUpFormEmployer" component={SignUpFormEmployer} /> 
                        <Route exact path="/signUpFormRecruiter" component={SignUpFormRecruiter} /> 
                    </React.Fragment>
                </BrowserRouter> 
                
            </MuiThemeProvider>
        );
    }
}

export default App;
