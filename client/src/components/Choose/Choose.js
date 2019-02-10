import React from 'react';
import './Choose.css';   
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import AuthFunctions from '../../AuthFunctions'; 

class Choose extends React.Component{

    constructor(){
        super();
        this.state={
            chosen: false, 
        }
        this.Auth = new AuthFunctions();
    }

    saveChoose = (type) => { 
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        var data = {
            user: this.Auth.getUser(),
            type: type
        }
        axios.post('/api/profile/saveType', data, config).then((res)=>{
            console.log("returned user after choosing: ", res.data)
            this.Auth.setProfile(res.data);
            this.setState({ chosen: false });
        }); 
    }

 
    render(){
        if(this.state.chosen){ 
            return <Redirect to='/activeJobs'/>
        } 
 
        return (
            <React.Fragment>
                 <div className="chooseContainer noselect"> 
                    <div className="chooseTop center-right-left" onClick={() => this.saveChoose("employer")}>  
                        <div className="innerChoose"><span>are you a: </span>Employer</div>
                    </div>  
                    <div className="chooseBottom center-right-left" onClick={() => this.saveChoose("recruiter")}> 
                        <div className="innerChoose"><span>are you a: </span>Recruiter</div>
                    </div> 
                </div>
            </React.Fragment>
        );
    }
};

export default Choose;
