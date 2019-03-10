import React from "react";
import { Switch, Route } from "react-router-dom";
import RecruiterProfile from '../../pages/recruiter/Profile/Profile'; 
import JobList from '../../pages/recruiter/JobList/JobList';
import CandidateList from '../../pages/recruiter/CandidateList/CandidateList';
import AddCandidate from '../../pages/recruiter/AddCandidate/AddCandidate';
import NavBar from '../../components/NavBar/NavBar';
import Notifications from '../../components/Notifications/Notifications';
import Chat from '../../components/Chat/Chat';

function RecruiterRouter({ match }) {
    return ( 
        <React.Fragment>
            <NavBar/>  
            {window.location.pathname !== "/recruiter/profile" ? <Notifications/> : ""}
            <div className="mainContainer">
                <Switch>
                    <Route strict path="/recruiter/profile" component={RecruiterProfile} />
                    <Route strict path="/recruiter/candidateList/:postId" component={CandidateList} />
                    <Route strict path="/recruiter/candidate/:candidateId" component={CandidateList} />
                    <Route strict path="/recruiter/candidateList" component={CandidateList} />
                    <Route strict path="/recruiter/addCandidate" component={AddCandidate} />
                    <Route strict path="/recruiter/jobList/:candidateId" component={JobList} />
                    <Route strict path="/recruiter/jobList" component={JobList} />
                    <Route strict path="/recruiter/chat" component={Chat} />
                    
                </Switch>
            </div>
        </React.Fragment>
    );
}

module.exports = RecruiterRouter;

