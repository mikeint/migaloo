import React from "react";
import { Switch, Route } from "react-router-dom";
import RecruiterProfile from './Profile/Profile';  
import JobList from './JobList/JobList';
import CandidateList from './CandidateList/CandidateList';
import AddCandidate from './AddCandidate/AddCandidate';
import Account from './Account/Account';
import NavBar from '../../components/NavBar/NavBar';
import Chat from '../../components/Chat/Chat';
import JobDescription from './JobList/JobDescription/JobDescription';

function RecruiterRouter({ match }) {
    return ( 
        <React.Fragment>
            <NavBar/>  
            <div className="mainContainer">
                <Switch>
                    <Route strict path="/recruiter/profile" component={RecruiterProfile} />
                    <Route strict path="/recruiter/account" component={Account} />
                    <Route strict path="/recruiter/candidateList/:postId" component={CandidateList} />
                    <Route strict path="/recruiter/candidate/:candidateId" component={CandidateList} />
                    <Route strict path="/recruiter/candidateList" component={CandidateList} />
                    <Route strict path="/recruiter/addCandidate" component={AddCandidate} />
                    <Route strict path="/recruiter/jobList/job/:jobId/:candidateId" component={JobDescription} />
                    <Route strict path="/recruiter/jobList/job/:jobId" component={JobDescription} />
                    <Route strict path="/recruiter/jobList/:candidateId" component={JobList} />
                    <Route strict path="/recruiter/jobList" component={JobList} />
                    <Route strict path="/recruiter/chat/:postId/:candidateId" component={Chat} />
                    <Route strict path="/recruiter/chat" component={Chat} />
                </Switch>
            </div>
        </React.Fragment>
    );
}

export default RecruiterRouter;

