import React from "react";
import { Switch, Route } from "react-router-dom";
import ResetPassword from "./ResetPassword/ResetPassword";

function AuthRouter({ match }) {
    console.log("TEST")
    return ( 
        <React.Fragment>
            <div className="mainContainer">
                <Switch>
                    <Route strict path="/auth/resetPassword/:token/:name" component={ResetPassword} />  
                </Switch>
            </div>
        </React.Fragment>
    );
}

module.exports = AuthRouter;