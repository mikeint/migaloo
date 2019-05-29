import React from "react";
import { Switch, Route } from "react-router-dom";
import ActiveJobs from './ActiveJobs/ActiveJobs';
import PostAJob from './PostAJob/PostAJob';
import EmployerProfile from './Profile/Profile';
import NavBar from '../../components/NavBar/NavBar';
import Chat from '../../components/Chat/Chat';
import Accounts from "./Accounts/Accounts";

function AccountManagerRouter({ match }) {

    return ( 
        <div className="rootContainer">
            <div className="navContainer">
                <NavBar/>
            </div>
            <div className="mainContainer">
                <Switch>
                    <Route strict path="/accountManager/postAJob/:postId" component={PostAJob} />
                    <Route strict path="/accountManager/postAJob" component={PostAJob} />
                    <Route strict path="/accountManager/profile" component={EmployerProfile} />  
                    <Route strict path="/accountManager/accounts" component={Accounts} />  
                    <Route strict path="/accountManager/activeJobs" component={ActiveJobs} />
                    <Route strict path="/accountManager/chat/:postId/:candidateId" component={Chat} />
                    <Route strict path="/accountManager/chat" component={Chat} />
                </Switch>
            </div>
        </div>
    );
}

export default AccountManagerRouter ;