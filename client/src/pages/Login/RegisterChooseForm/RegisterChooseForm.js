import React, { Component } from 'react';   
import RegisterEmployerForm from '../RegisterEmployerForm/RegisterEmployerForm';
import RegisterRecruiterForm from '../RegisterRecruiterForm/RegisterRecruiterForm';

import './RegisterChooseForm.css';
 

class RegisterChooseForm extends Component {
	constructor() {
		super();
		this.state = {  
            tabState: 0, 
		}; 
	}    

	changeTab = (tab) => {
        this.setState({ tabState: tab });
	}

	render() {
			 return ( 
                <div className="registerContent">
                    { this.state.tabState !== 0 ? <div className='back-button-home' onClick={() => this.changeTab(0)}></div>:''}
                    { this.state.tabState === 1 ?
                            <div><RegisterEmployerForm /></div>
                        :
                        <div><RegisterRecruiterForm /></div>
                    }
                </div>
			)
	}
}

export default RegisterChooseForm;
