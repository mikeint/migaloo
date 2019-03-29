import React from "react";
import { Switch, Route } from "react-router-dom";
import ActiveJobs from '../../pages/employer/ActiveJobs/ActiveJobs';
import PostAJob from '../../pages/employer/PostAJob/PostAJob';
import EmployerProfile from '../../pages/employer/Profile/Profile';
import NavBar from '../../components/NavBar/NavBar';
import Chat from '../../components/Chat/Chat';

function EmployerRouter({ match }) {

    return ( 
        <React.Fragment>
            <NavBar />
            <div className="mainContainer">
                <Switch>
                    <Route strict path="/employer/postAJob" component={PostAJob} />
                    <Route strict path="/employer/profile" component={EmployerProfile} />  
                    <Route strict path="/employer/activeJobs" component={ActiveJobs} />
                    <Route strict path="/employer/chat/:postId/:candidateId" component={Chat} />
                    <Route strict path="/employer/chat" component={Chat} />
                </Switch>
            </div>
        </React.Fragment>
    );
}

module.exports = EmployerRouter;