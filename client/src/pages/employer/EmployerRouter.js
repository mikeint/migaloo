import React from "react";
import { Switch } from "react-router-dom";
// import PostAJob from './PostAJob/PostAJob';

function EmployerRouter({ match }) {

    return ( 
        <div className="rootContainer">
            <div className="mainContainer">
                <Switch>
                    {/* <Route strict path="/employer/postAJob" component={PostAJob} /> */}
                </Switch>
            </div>
        </div>
    );
}

export default EmployerRouter;