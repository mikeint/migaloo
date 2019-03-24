import React from 'react';
import './AddCandidate.css';  
import AuthFunctions from '../../../AuthFunctions'; 
import ApiCalls from '../../../ApiCalls';  
import TagSearch from '../../../components/TagSearch/TagSearch';  

import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    alertClose: {
        position: "absolute",
        right: "10px",
        height: "60px",
    }, 
})
  

class AddCandidate extends React.Component{
    constructor(props) {
        super(props);
        this.state = {   
            firstName:'',
            lastName:'',
            email:'',
            salary:'',
            experience:'',
            tagIds:[],
            redirect: false,
            close: props.close
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
        const { classes } = this.props;
        return (
            <React.Fragment> 
                {/* this.state.redirect ? <Redirect to='/recruiter/candidateList' /> : '' */}
                <div className="pageHeading">Add a Candidate</div>
                <IconButton color="primary" className={classes.alertClose} onClick={this.state.close}>
                    <Close color="primary" />
                </IconButton>
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
                                    <span className="floating-label">First Name*</span>
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
                                    <span className="floating-label">Last Name*</span>
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
                                    <span className="floating-label">Email*</span>
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
                                <TagSearch onChange={(tags)=>this.setState({tagIds:tags})}/>
                            </div>
                        </div>
                        <div className="submitCandidateBtn" onClick={this.handleSubmit}>Add Candidate</div>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(AddCandidate);  