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

import SignUpFormEmployer from './components/SignUpFormEmployer/SignUpFormEmployer'
import SignUpFormRecruiter from './components/SignUpFormRecruiter/SignUpFormRecruiter'


function LandingRouter({ match }) {
    return ( 
        <React.Fragment>
            <div className="lp2_container">
                <div className="lp2_menu"><NavBar /></div>
                <div className="lp2_body">
                    <Switch>
                        <Route exact path="/landing/recruiterPage" component={RecruiterPage} />
                        <Route exact path="/landing/recruiterPage/howItWorks_recruiter" component={HowItWorks_recruiter} />
                        <Route exact path="/landing/recruiterPage/pricing_recruiter" component={Pricing_recruiter} />

                        <Route exact path="/landing/employerPage" component={EmployerPage} /> 
                        <Route exact path="/landing/employerPage/howItWorks_employer" component={HowItWorks_employer} />
                        <Route exact path="/landing/employerPage/pricing_employer" component={Pricing_employer} />

                        <Route exact path="/landing/contact" component={Contact} />
                        <Route exact path="/landing/about" component={About} />
                        <Route exact path="/landing/team" component={Team} />

                        <Route exact path='/landing/signUpFormEmployer' component={SignUpFormEmployer} /> 
                        <Route exact path='/landing/signUpFormRecruiter' component={SignUpFormRecruiter} /> 
                    </Switch>
                </div> 
            </div>
        </React.Fragment>
    );
}

export default LandingRouter;

