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
							{ this.state.tabState!==0 ? <div className='back-button'  onClick={() => this.changeTab(0)}>Back</div>:''}
							{
									this.state.tabState === 1 ?
										<div><RegisterEmployerForm /></div>
									:
									(this.state.tabState === 2 ?
										<div><RegisterRecruiterForm /></div>
										:
										<React.Fragment>
											<div className='tab-button' onClick={() => this.changeTab(1)}>Employer</div>
											<div className='tab-button' onClick={() => this.changeTab(2)}>Recruiter</div>
                                        </React.Fragment>
									)
							}
					</div>
			)
	}
}

export default RegisterChooseForm;
