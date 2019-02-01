import React from 'react';
import './Choose.css';   
import { Redirect, Link } from 'react-router-dom'; 

class Choose extends React.Component{

    constructor(){
        super();
        this.state={
            chosen: false, 
        } 
    }

 
    render(){
        //console.log("ChooseS PROPS: ", this.props)
        if(this.state.chosen){ 
            return <Redirect to='/hub'/>
        } 
 
        return (
            <React.Fragment>
                 <div className="chooseContainer noselect"> 
                    <div className="chooseTop center-right-left">  
                        <div className="innerChoose"><span>are you a: </span>Employer</div>
                    </div>  
                    <div className="chooseBottom center-right-left"> 
                        <div className="innerChoose"><span>are you a: </span>Recruiter</div>
                    </div> 
                </div>
            </React.Fragment>
        );
    }
};

export default Choose;
