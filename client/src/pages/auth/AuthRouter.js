import React from "react";
import { Switch, Route } from "react-router-dom";
import ResetPassword from "./ResetPassword/ResetPassword";
import ResetPasswordRequest from "./ResetPasswordRequest/ResetPasswordRequest";
import PendingVerification from "./PendingVerification/PendingVerification";
import VerifyEmail from "./VerifyEmail/VerifyEmail";

function AuthRouter({ match }) {
    return ( 
        <React.Fragment>
            <div className="mainContainer">
                <Switch>
                    <Route strict path='/auth/pendingVerification' component={PendingVerification} />
                    <Route strict path='/auth/verifyEmail/:token' component={VerifyEmail} />
                    <Route strict path='/auth/resetPasswordRequest' component={ResetPasswordRequest} />
                    <Route strict path="/auth/resetPassword/:token/:name" component={ResetPassword} />  
                </Switch>
            </div>
        </React.Fragment>
    );
}

export default AuthRouter ;