import React from "react";
import { Switch, Route } from "react-router-dom";
import ActiveJobs from './ActiveJobs/ActiveJobs';
import PostAJob from './PostAJob/PostAJob';
import EmployerProfile from './Profile/Profile';
import NavBar from '../../components/NavBar/NavBar';
import Chat from '../../components/Chat/Chat';
import Accounts from "./Accounts/Accounts";

function EmployerRouter({ match }) {

    return ( 
        <React.Fragment>
            <NavBar />
            <div className="mainContainer">
                <Switch>
                    <Route strict path="/employer/postAJob" component={PostAJob} />
                    <Route strict path="/employer/profile" component={EmployerProfile} />  
                    <Route strict path="/employer/accounts" component={Accounts} />  
                    <Route strict path="/employer/activeJobs" component={ActiveJobs} />
                    <Route strict path="/employer/chat/:postId/:candidateId" component={Chat} />
                    <Route strict path="/employer/chat" component={Chat} />
                </Switch>
            </div>
        </React.Fragment>
    );
}

module.exports = EmployerRouter;