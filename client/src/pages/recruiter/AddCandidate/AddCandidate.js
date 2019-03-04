import React from 'react';
import './AddCandidate.css';  
import AuthFunctions from '../../../AuthFunctions'; 
import ApiCalls from '../../../ApiCalls';  

class AddCandidate extends React.Component{
    constructor() {
        super();
        this.state = {   
            firstName:'',
            lastName:'',
            email:'',
            salary:'',
            experience:'',
            tags:[],
            redirect: false
        }
        this.Auth = new AuthFunctions();
    }
 
/*     componentDidMount() {
        window.scrollTo(0, 0); 
    } */

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
        ApiCalls.post('/api/candidate/create', this.state)
        .then((res) => {

            // THIS IS getting messy, its to shut the overlay after submitting a new candidate.
            // TO-DO (not here) show the added candidate behind overlay
            if(res.data.success) {
                this.props.handleClose();
            }
        })
        .catch(error => {
            console.log(error);
        });
    }



    render(){   
        return (
            <React.Fragment> 
                {/* this.state.redirect ? <Redirect to='/recruiter/candidateList' /> : '' */}
                <div className="pageHeading">Add a Candidate</div>
                <div className="addCandidateContainer">
                    <div className="formSection">  
                        <div className="input-2">
                            <div className="i-2 il">
                                <div className="user-input-wrp">
                                    <input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        required
                                        onChange={this.handleChange}
                                        value={this.state.firstName}
                                    />
                                    <span className="floating-label">First Name</span>
                                </div>
                            </div>
                            <div className="i-2 il">
                                <div className="user-input-wrp">
                                    <input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        required
                                        onChange={this.handleChange}
                                        value={this.state.lastName}
                                    />
                                    <span className="floating-label">Last Name</span>
                                </div>
                            </div>
                            <div className="i-2 il">
                                <div className="user-input-wrp">
                                    <input
                                        id="email"
                                        type="text"
                                        name="email"
                                        required
                                        onChange={this.handleChange}
                                        value={this.state.email}
                                    />
                                    <span className="floating-label">Email</span>
                                </div>
                            </div>
                            <div className="i-2 il">
                                <div className="user-input-wrp">
                                    <input
                                        id="salary"
                                        type="text"
                                        name="salary"
                                        onChange={this.handleChange}
                                        value={this.state.salary}
                                    />
                                    <span className="floating-label">Salary</span>
                                </div>
                            </div>
                            <div className="i-2 il">
                                <div className="user-input-wrp">
                                    <input
                                        id="experience"
                                        type="text"
                                        name="experience"
                                        onChange={this.handleChange}
                                        value={this.state.experience}
                                    />
                                    <span className="floating-label">Expierence</span>
                                </div>
                            </div>
                            <div className="i-2 il">
                                <div className="user-input-wrp">
                                    <input
                                        id="tags"
                                        type="text"
                                        name="tags"
                                        onChange={this.handleChange}
                                        value={this.state.tags}
                                    />
                                    <span className="floating-label">Tags</span>
                                </div>
                            </div>
                        </div>
                        <div className="submitCandidateBtn" onClick={this.handleSubmit}>Add Candidate</div>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default AddCandidate;
