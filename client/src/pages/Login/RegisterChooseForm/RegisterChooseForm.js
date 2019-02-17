import React, { Component } from 'react';   
import RegisterEmployerForm from '../RegisterEmployerForm/RegisterEmployerForm';
import RegisterRecruiterForm from '../RegisterRecruiterForm/RegisterRecruiterForm';

import './RegisterChooseForm.css';

import employer_pick from '../../../files/images/employer_pick.svg';
import recruiter_icon from '../../../files/images/recruiter_pick.svg';

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
                    { this.state.tabState !== 0 ? <div className='back-button'  onClick={() => this.changeTab(0)}>Back</div>:''}
                    { this.state.tabState === 1 ?
                            <div><RegisterEmployerForm /></div>
                        :
                        (this.state.tabState === 2 ?
                            <div><RegisterRecruiterForm /></div>
                            :
                            <React.Fragment>
                                <div className='tab-button tab-button-top' onClick={() => this.changeTab(1)}>
                                    <div className="centerChooseHome">
                                        <div className="">Employer</div>
                                        <div className="chooseIcon"><img src={employer_pick} alt="" /></div>
                                    </div>
                                </div>
                                <div className='tab-button' onClick={() => this.changeTab(2)}>
                                    <div className="centerChooseHome">
                                        <div className="">Recruiter</div> 
                                        <div className="chooseIcon"><img src={recruiter_icon} alt="" /></div>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    }
                </div>
			)
	}
}

export default RegisterChooseForm;
