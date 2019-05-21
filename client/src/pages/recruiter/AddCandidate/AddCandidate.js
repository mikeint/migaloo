import React from 'react';
import AuthFunctions from '../../../AuthFunctions'; 
import {post} from '../../../ApiCalls';  
import TagSearch from '../../../components/Inputs/TagSearch/TagSearch'; 
import ExperienceSelector from '../../../components/Inputs/ExperienceSelector/ExperienceSelector';
import AddressInput from '../../../components/Inputs/AddressInput/AddressInput';
import SalarySelector from '../../../components/Inputs/SalarySelector/SalarySelector'; 

import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormValidation from '../../../FormValidation';

const styles = theme => ({
    alertClose: {
        position: "absolute",
        right: "10px",
        height: "60px",
    }, 
    submitCandidateBtn:{
        width: "100%"
    },
    tagSearch:{
        marginTop: "10px"
    },
    input2: {
        display: "flex",
        flexWrap: "wrap"
    },
    textField: {
        width: "50%",
        margin: "10px"
    },
    selectFormControl:{
        flex: "1 1",
        margin: "10px"
    },
    postButton:{
        width:"100%",
        marginTop: "20px"
    },
    textAreaMaxHeight:{
        width: "100%",
        margin: "10px"
    },
    addCandidateContainer: {
        padding: "20px",
        color: theme.palette.primary.main,
        display: "flex"
    },
    formSection: {
        margin: "auto auto 25px auto",
        width: "100%",
        maxWidth: "1000px"
    },
})
const errorText = [
    {
        stateName: "firstName",
        errorText: "Please enter their first name"
    },
    {
        stateName: "lastName",
        errorText: "Please enter their last name"
    },
    {
        stateName: "email",
        errorText: "Please enter their email"
    },
    {
        stateName: "salary",
        errorText: "Please select the salary range"
    },
    {
        stateName: "experience",
        errorText: "Please select their experience"
    },
    {
        stateName: "tagIds",
        errorText: "Please select some tags related to their skills"
    },
    {
        stateName: "address.placeId",
        errorText: "Please select an address for the company"
    }
]
  

class AddCandidate extends React.Component{
    constructor(props) {
        super(props);
        this.state = {   
            firstName:'',
            lastName:'',
            email:'',
            salary:-1,
            jobType:-1,
            experience:-1,
            address:{},
            tagIds:[],
            redirect: false,
            onClose: props.onClose,
            salaryList: [],
            experienceList: [],
            errors:{}
        }
        this.Auth = new AuthFunctions();
        this.formValidation = new FormValidation(this, errorText);
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }

    handleAddressChange(address){
        this.setState({address:address}, this.formValidation.shouldRevalidate)
    }
    handleSubmit = () => {
        if(this.formValidation.isValid()){
            post('/api/candidate/create', this.state)
            .then((res) => {

                // THIS IS getting messy, its to shut the overlay after submitting a new candidate.
                // TO-DO (not here) show the added candidate behind overlay
                if(res && res.data.success) {
                    this.props.onClose();
                }
            })
            .catch(error => {
                console.log(error);
            });
        }
    }

    render(){
        const { classes } = this.props;
        return (
            <React.Fragment> 
                {/* this.state.redirect ? <Redirect to='/recruiter/candidateList' /> : '' */}
                <div className="pageHeading">Add a Candidate</div>
                <IconButton color="inherit" className={classes.alertClose} onClick={this.state.onClose}>
                    <Close color="primary" />
                </IconButton>
                <div className={classes.addCandidateContainer}>
                    <div className={classes.formSection}>
                        <div className={classes.input2}>
                            <TextField
                                name="firstName"
                                label="First Name"
                                className={classes.textField}
                                onChange={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("firstName")}
                            />
                        </div>
                        <div className={classes.input2}>
                            <TextField
                                name="lastName"
                                label="Last Name"
                                className={classes.textField}
                                onChange={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("lastName")}
                            />
                        </div>
                        <div className={classes.input2}>
                            <TextField
                                name="email"
                                label="Email"
                                className={classes.textField}
                                onChange={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("email")}
                            />
                        </div>
                        <div className={classes.input2}>
                            <SalarySelector 
                                required
                                onChange={(salary)=>this.setState({salary:salary}, this.formValidation.shouldRevalidate)}
                                {...this.formValidation.hasError("salary")}/>
                                &nbsp;&nbsp;&nbsp;
                            <ExperienceSelector 
                                required
                                onChange={(experience)=>this.setState({experience:experience}, this.formValidation.shouldRevalidate)}
                                {...this.formValidation.hasError("experience")}/>
                        </div>
                        <div className={classes.input2}>
                            <TagSearch
                                className={classes.tagSearch}
                                onChange={(tags)=>this.setState({tagIds:tags}, this.formValidation.shouldRevalidate)}
                                {...this.formValidation.hasError("tagIds")}/>
                        </div>
                        <div className={classes.input2}>
                            <AddressInput
                                onChange={this.handleAddressChange.bind(this)}
                                {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                            />
                        </div>
                        <Button
                            color="primary"
                            variant="contained"
                            className={classes.submitCandidateBtn}
                            onClick={this.handleSubmit}>Add Candidate</Button>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(AddCandidate);  