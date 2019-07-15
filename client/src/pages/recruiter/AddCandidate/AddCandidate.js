import React from 'react';
import {get, cancel, post} from '../../../ApiCalls';  
import SkillSearch from '../../../components/Inputs/SkillSearch/SkillSearch'; 
import ExperienceSelector from '../../../components/Inputs/ExperienceSelector/ExperienceSelector';
import JobTypeSelector from '../../../components/Inputs/JobTypeSelector/JobTypeSelector';
import AddressInput from '../../../components/Inputs/AddressInput/AddressInput';
import SalarySelector from '../../../components/Inputs/SalarySelector/SalarySelector';  
import CommuteSelector from '../../../components/Inputs/CommuteSelector/CommuteSelector'; 
import ResponsibilitiesSelector from '../../../components/Inputs/ResponsibilitiesSelector/ResponsibilitiesSelector';  
import HighlightsSelector from '../../../components/Inputs/HighlightsSelector/HighlightsSelector';  

import { Close } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormControlLabel, Checkbox, IconButton, Button, Stepper, Step, StepLabel, } from '@material-ui/core';
import FormValidation from '../../../FormValidation';
import BenefitsPage from '../../../components/BenefitsPage/BenefitsPage';
import UploadResume from '../../../components/UploadResume/UploadResume';


const styles = theme => ({
    alertClose: {
        marginLeft: 'auto', 
        marginRight: "10px",
    }, 
    submitCandidateBtn:{
        width: "100%"
    },
    SkillSearch:{
        marginTop: "10px"
    },
    input2: {
        display: "flex",
        flexWrap: "wrap"
    },
    textField: {
        flex: "1 0",
        marginRight: 20
    },
    selectFormControl:{
        flex: "1 1",
        margin: "10px"
    },
    buttonContainer:{
        display: "flex",
        marginBottom: "10px"
    },
    button:{
        flex: "1 1",
        margin: "20px 10px 0 10px",
    },
    relocateCheckbox:{
        marginLeft: "10px"
    },
    textAreaMaxHeight:{
        width: "100%",
        margin: "10px"
    },
 
    formSection: {
        margin: "auto auto 25px auto",
        width: "100%",
        maxWidth: "1000px"
    },
})
const errorTextPage1 = [
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
        stateName: "phoneNumber",
        errorText: "Please enter their phone number"
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
        errorText: "Please select an address for the candidate"
    },
    { 
        stateName: "jobTypeId", 
        errorText: "Please select a job type",
        type: "number",
        gt: -1
    },
    {
        stateName: "tagIds",
        errorText: "Please select some tags related to the candidate"
    }
]
const errorTextPage2 = [
    {
        stateName: "highlights",
        errorText: "Please enter some of this candidate's highlights"
    },
    {
        stateName: "jobTitle",
        errorText: "Please enter their prefered job title"
    },
    {
        stateName: "responsibilities",
        errorText: "Please enter some of their expected responsibilities"
    }
]
  
const steps = ['Job Information', 'Expectations', 'Benefits', 'Resume']
class AddCandidate extends React.Component{
    constructor(props) {
        super(props);
        this.state = {   
            firstName:null,
            lastName:null,
            email:null,
            phoneNumber:null,
            url:null,
            jobTitle: null,
            responsibilities: null,
            highlights: null,
            salary:0,
            jobTypeId:null,
            resumeId: null,
            experience:0,
            commute:1,
            address:null,
            tagIds:null,
            relocatable: false,
            benefitIds: null,
            redirect: false,
            onClose: props.onClose,
            candidateId: props.candidateId,
            errors:{},
            activeStep: 0
        }
        this.formValidationPage1 = new FormValidation(this, errorTextPage1);
        this.formValidationPage2 = new FormValidation(this, errorTextPage2);
    }
    getCandidate = () => {
        if(this.state.candidateId != null){
            get('/api/candidate/get/'+this.state.candidateId)
            .then((res)=>{
                if(res == null || !res.data.success || res.data.candidateList.length === 0) return
                this.setState({ ...res.data.candidateList[0], salary: res.data.candidateList[0].salary/1000 })
            }).catch(errors => 
                console.log(errors)
            )
        }
    }
    componentDidMount() {
        this.getCandidate();
    }
    componentWillUnmount() {
        cancel();
    }


    getPageValidation = () => {
        switch (this.state.activeStep) {
            case 0: // Job Page
                return this.formValidationPage1;
            case 1: // Expectations Page
                return this.formValidationPage2;
            default:
                return this.formValidationPage1;
        }

    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.getPageValidation().shouldRevalidate)
    }
    handleChangeKV = (map) => {
        this.setState(map, this.getPageValidation().shouldRevalidate)
    }

    handleAddressChange = (address) => {
        this.setState({address:address}, this.getPageValidation().shouldRevalidate)
    }
    handleResumeChange = (e) => {
        console.log(e, { resumeId: e.resumeId })
        this.setState({ resumeId: e.resumeId }, this.getPageValidation().shouldRevalidate)
    }
    handleSubmit = () => {
        if(this.getPageValidation().isValid()){
            post(this.state.candidateId == null?'/api/candidate/create':'/api/candidate/edit', this.state)
            .then((res) => {
                if(res && res.data.success) {
                    this.props.onClose();
                }
            })
            .catch(error => {
                console.log(error);
            });
        }
    }

    next = () => {
        if(this.getPageValidation().isValid()){
            this.setState({activeStep:this.state.activeStep+1})
        }
    }
    back = () => {
        if(this.state.activeStep > 0)
            this.setState({activeStep:this.state.activeStep-1})
    }
    
    getPageContents = (classes) => {
        const formValidation = this.getPageValidation()
        switch (this.state.activeStep) {
            case 0: // Job Page
                return <div className={classes.formSection}>
                <div className={classes.input2}>
                    <TextField
                        name="firstName"
                        label="First Name"
                        className={classes.textField}
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                        value={this.state.firstName||''}
                        {...this.getPageValidation().hasError("firstName")}
                    />
                    <TextField
                        name="lastName"
                        label="Last Name"
                        className={classes.textField}
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                        value={this.state.lastName||''}
                        {...this.getPageValidation().hasError("lastName")}
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
                        value={this.state.email||''}
                        {...formValidation.hasError("email")}
                    />
                    <TextField
                        name="phoneNumber"
                        label="Phone"
                        className={classes.textField}
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                        value={this.state.phoneNumber||''}
                        {...formValidation.hasError("phoneNumber")}
                    /> 
                </div>
                <div className={classes.input2}>
                    <TextField
                        name="url"
                        label="Linkdin/Profile Url"
                        className={classes.textField}
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                        value={this.state.url||''}
                        {...formValidation.hasError("url")}
                    /> 
                </div>
                <div className={classes.input2}>
                    <SalarySelector 
                        required
                        onChange={this.handleChangeKV}
                        value={this.state.salary}
                        {...formValidation.hasError("salary")}/>
                        &nbsp;&nbsp;&nbsp;
                    <ExperienceSelector 
                        required
                        onChange={this.handleChangeKV}
                        value={this.state.experience}
                        {...formValidation.hasError("experience")}/>
                </div>
                <div className={classes.input2}>
                    <CommuteSelector 
                        required
                        onChange={this.handleChangeKV}
                        value={this.state.commute}
                        {...formValidation.hasError("commute")}/>
                    <FormControlLabel className={classes.relocateCheckbox}
                        control={
                            <Checkbox
                                defaultChecked={false}
                                onChange={(e)=>this.setState({relocatable: e.target.checked})}
                                color="primary"
                            />
                        }
                        label="Willing to Relocate"
                    />
                </div>
                <div className={classes.input2}>
                    <JobTypeSelector
                        required
                        onChange={this.handleChangeKV}
                        value={this.state.jobTypeId}
                        {...formValidation.hasError("jobTypeId")}/>
                </div>
                {this.state.jobTypeId !== -1 && this.state.jobTypeId != null &&
                    <div className={classes.SkillSearch}>
                        <SkillSearch
                            onChange={this.handleChangeKV}
                            jobTypeId={this.state.jobTypeId}
                            value={this.state.tagIds}
                            {...formValidation.hasError("tagIds")}/>
                    </div>
                }
                <div className={classes.input2}>
                    <AddressInput
                        onChange={this.handleAddressChange.bind(this)}
                        value={this.state.address}
                        {...(formValidation.hasError("address.placeId").error?{error:true}:{})}
                    />
                </div> 


            </div> 
            case 1: // Expectation Page
                return <div className={classes.formSection}>
                <div>
                    <TextField
                        name="jobTitle"
                        label="Job Title"
                        className={classes.textField}
                        onChange={this.handleChange}
                        value={this.state.jobTitle||''}
                        margin="normal"
                        variant="outlined"
                        {...formValidation.hasError("jobTitle")}
                    />  
                </div> 
                <div>
                    <ResponsibilitiesSelector
                        required
                        onChange={this.handleChangeKV}
                        value={this.state.responsibilities}
                        {...formValidation.hasError("responsibilities")}/>
                </div>
                <div>
                    <HighlightsSelector
                        required
                        onChange={this.handleChangeKV}
                        value={this.state.highlights}
                        {...formValidation.hasError("highlights")}/>
                </div>
            </div>
            case 2: // Review Page
                return <BenefitsPage
                value={this.state.benefitIds}
                onChange={this.handleChangeKV}/>
            case 3: // Resume Page
                return <div className={classes.formSection}>
                    {this.state.resumeId != null && 
                        <div>Currently a resume is loaded, uploading another will overwrite the previous version</div>}
                    <div>Upload a Resume for the candidate:</div>
                    <UploadResume
                        onClose={this.handleResumeChange}/>
                </div>
            default:
                return <div>Page does not exist</div>
        }
    }
    render(){
        const { classes } = this.props;
        return (
            <React.Fragment> 
                {/* this.state.redirect ? <Redirect to='/recruiter/candidateList' /> : '' */}
                <div className="pageHeading">
                    Add a Candidate
                    <IconButton color="inherit" className={classes.alertClose} onClick={this.state.onClose}>
                        <Close color="primary" />
                    </IconButton>
                </div>


                <div className={classes.root}>
                    <Stepper nonLinear activeStep={this.state.activeStep}>
                        {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel completed={index<this.state.activeStep}>
                            {label}
                            </StepLabel>
                        </Step>
                        ))}
                    </Stepper>
                        {
                            this.getPageContents(classes)
                        }
                        {
                            <div className={classes.buttonContainer}>
                                <Button 
                                color="primary"
                                variant="contained"
                                className={classes.button}
                                disabled={this.state.activeStep === 0}
                                onClick={this.back}>Back</Button>
                                {
                                    this.state.activeStep === steps.length-1?
                                    <Button 
                                    color="primary"
                                    variant="contained"
                                    className={classes.button}
                                    onClick={this.handleSubmit}>
                                        {this.state.candidateId == null?'Add Candidate':'Edit Candidate'}
                                    </Button>
                                    :
                                    <Button 
                                    color="primary"
                                    variant="contained"
                                    className={classes.button}
                                    onClick={this.next}>Next</Button>
                                }
                            </div>
                        }
                </div>

                    
                
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(AddCandidate);  