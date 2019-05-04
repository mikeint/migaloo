import React from "react";
import { Switch, Route } from "react-router-dom"
import NavBar from './components/NavBar/NavBar'

import RecruiterPage from './Recruiter/Recruiter';
import HowItWorks_recruiter from './Recruiter/HowItWorks/HowItWorks';
import Pricing_recruiter from './Recruiter/Pricing/Pricing';
import EmployerPage from './Employer/Employer';
import HowItWorks_employer from './Employer/HowItWorks/HowItWorks';
import Pricing_employer from './Employer/Pricing/Pricing';

import Contact from './Contact/Contact';
import About from './About/About';
import Team from './Team/Team';


function LandingRouter({ match }) {
    return ( 
        <React.Fragment>
            <div className="lp2_container">
                <div className="lp2_menu"><NavBar /></div>
                <div className="lp2_body">
                    <Switch>
                        <Route exact path="/recruiterPage" component={RecruiterPage} />
                        <Route exact path="/recruiterPage/howItWorks_recruiter" component={HowItWorks_recruiter} />
                        <Route exact path="/recruiterPage/pricing_recruiter" component={Pricing_recruiter} />

                        <Route exact path="/employerPage" component={EmployerPage} /> 
                        <Route exact path="/employerPage/howItWorks_employer" component={HowItWorks_employer} />
                        <Route exact path="/employerPage/pricing_employer" component={Pricing_employer} />

                        <Route exact path="/landing/contact" component={Contact} />
                        <Route exact path="/landing/about" component={About} />
                        <Route exact path="/landing/team" component={Team} />
                    </Switch>
                </div> 
            </div>
        </React.Fragment>
    );
}

module.exports = LandingRouter;

