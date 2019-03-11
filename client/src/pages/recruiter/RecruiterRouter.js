import React from "react";
import { Switch, Route, Link } from "react-router-dom";
import RecruiterProfile from '../../pages/recruiter/Profile/Profile'; 
import BuildActiveJobs from '../../pages/recruiter/JobList/BuildActiveJobs/BuildActiveJobs';
import JobList from '../../pages/recruiter/JobList/JobList';
import CandidateList from '../../pages/recruiter/CandidateList/CandidateList';
import AddCandidate from '../../pages/recruiter/AddCandidate/AddCandidate';
import NavBar from '../../components/NavBar/NavBar';
import Notifications from '../../components/Notifications/Notifications';
import Chat from '../../components/Chat/Chat';
import BuildActiveJobs from './JobList/BuildActiveJobs/BuildActiveJobs';

function RecruiterRouter({ match }) {
    return ( 
        <React.Fragment>
            <NavBar/>  
            {window.location.pathname !== "/recruiter/profile" ? <Notifications/> : ""}
            {window.location.pathname.indexOf("/recruiter/profile") === 0 ? <Link to="recruiter/jobList"><div className="backButton"></div></Link> : ""}
            <div className="mainContainer">
                <Switch>
                    <Route strict path="/recruiter/profile" component={RecruiterProfile} />
                    <Route strict path="/recruiter/candidateList/:postId" component={CandidateList} />
                    <Route strict path="/recruiter/candidate/:candidateId" component={CandidateList} />
                    <Route strict path="/recruiter/candidateList" component={CandidateList} />
                    <Route strict path="/recruiter/addCandidate" component={AddCandidate} />
                    <Route strict path="/recruiter/job/:jobId/:candidateId" component={BuildActiveJobs} />
                    <Route strict path="/recruiter/job/:jobId" component={BuildActiveJobs} />
                    <Route strict path="/recruiter/jobList" component={JobList} />
                    <Route strict path="/recruiter/jobList/:jobId/:candidateId" component={BuildActiveJobs} />
                    <Route strict path="/recruiter/chat" component={Chat} />
                </Switch>
            </div>
        </React.Fragment>
    );
}

module.exports = RecruiterRouter;

