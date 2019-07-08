import React from 'react';
import { Redirect, Prompt } from 'react-router-dom';

import AuthFunctions from '../../../AuthFunctions'; 

import {get, post} from '../../../ApiCalls';  
import SkillSearch from '../../../components/Inputs/SkillSearch/SkillSearch';
import CompanySelector from '../../../components/Inputs/CompanySelector/CompanySelector';
import AddressInput from '../../../components/Inputs/AddressInput/AddressInput';
 
import SalarySelector from '../../../components/Inputs/SalarySelector/SalarySelector';
import ExperienceSelector from '../../../components/Inputs/ExperienceSelector/ExperienceSelector'; 
import JobTypeSelector from '../../../components/Inputs/JobTypeSelector/JobTypeSelector';
import InterviewCountSelector from '../../../components/Inputs/InterviewCountSelector/InterviewCountSelector';
import NumberOpeningsSelector from '../../../components/Inputs/NumberOpeningsSelector/NumberOpeningsSelector';
import OpenReasonSelector from '../../../components/Inputs/OpenReasonSelector/OpenReasonSelector';
import TitleSelector from '../../../components/Inputs/TitleSelector/TitleSelector';
import RequirementsSelector from '../../../components/Inputs/RequirementsSelector/RequirementsSelector';
import BenefitsPage from '../../../components/BenefitsPage/BenefitsPage';
import { withStyles } from '@material-ui/core/styles';
import FormValidation from '../../../FormValidation';
import { Checkbox, FormControlLabel, Stepper, Step, StepLabel, Button } from '@material-ui/core'; 
import SubscriptionReview from '../../../components/SubscriptionReview/SubscriptionReview';

const styles = theme => ({
    textField: {
        width: "50%",
        margin: "10px"
    },
    selectFormControl:{
        flex: "1 1",
        margin: "10px"
    },
    SkillSearch:{
        margin: "10px"
    },
    buttonContainer:{
        display: "flex"
    },
    button:{
        flex: "1 1",
        margin: "20px 10px 0 10px",
    },
    textAreaMaxHeight:{
        width: "100%",
        margin: "10px"
    },
    postAJobContainer: {
        padding: "20px",
        color: theme.palette.primary.main
    },
    formSection: {
        margin: "auto auto 25px auto",
        width: "100%",
        maxWidth: "1000px"
    },
    input2: {
        display: "flex",
        flexWrap: "wrap"
    }
})
const errorText = [
    {
        stateName: "company",
        errorText: "Please select a company for the job posting",
        type: "number",
        gt: -1
    },
    {
        stateName: "requirements",
        errorText: "Please enter a description for the job posting"
    },
    {
        stateName: "title",
        errorText: "Please enter a title for the job posting"
    },
    {
        stateName: "salary",
        errorText: "Please select the salary range"
    },
    {
        stateName: "experience",
        errorText: "Please select the experience required"
    },
    { 
        stateName: "jobType", 
        errorText: "Please select the job type",
        type: "number",
        gt: -1
    },
    { 
        stateName: "openingReasonId", 
        errorText: "Please select the reason for the job opening",
        type: "number",
        gt: -1,
        xor: "openingReasonComment"
    },
    { 
        stateName: "openingReasonComment", 
        errorText: "Please select the reason for the job opening",
        xor: "openingReasonId"
    },
    { 
        stateName: "interviewCount", 
        errorText: "Please select the number of candidates to interview",
        type: "number",
        gt: -1
    },
    { 
        stateName: "openPositions", 
        errorText: "Please select the number of openings",
        type: "number",
        gt: 0
    },
    {
        stateName: "tagIds",
        errorText: "Please select some tags related to the job"
    },
    {
        stateName: "address.placeId",
        errorText: "Please select an address for the company"
    }
]
const steps = ['Job Information', 'Benefits', 'Review']
class PostAJob extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            title:'',
            requirements:'',
            company:-1,
            salary:0,
            jobType:-1,
            experience:0,
            interviewCount:0,
            openPositions: 1,
            openingReasonId: -1,
            address:{},
            redirect: false,
            tagIds: [],
            errors: {},
            postId: props.match.params.postId,
            oldPost:{},
            formIsFilledOut: false,
            benefitIds: [],
            activeStep: 0
        }
        this.Auth = new AuthFunctions();
        this.handleChangeKV = this.handleChangeKV.bind(this)
        this.formValidation = new FormValidation(this, errorText);
    }
 
    getJob = () => {
        if(this.state.postId != null){
            get('/api/employerPostings/get/'+this.state.postId)
            .then((res)=>{
                if(res == null || !res.data.success || res.data.jobPosts.length === 0) return
                this.setState({ oldPost: res.data.jobPosts[0], jobType: this.state.oldPost.jobType })
            }).catch(errors => 
                console.log(errors)
            )
        }
    }
    componentDidMount() {
        this.getJob()
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, formIsFilledOut: true }, this.formValidation.shouldRevalidate)
    }
    handleChangeKV = (map) => {
        this.setState({...map, formIsFilledOut: true}, this.formValidation.shouldRevalidate)
    }
    handleAddressChange(address){
        this.setState({address:address, formIsFilledOut: true}, this.formValidation.shouldRevalidate)
    }

    handleSubmit = () => {
        if(this.formValidation.isValid()){
            post('/api/employerPostings/create', this.state)
            .then((res) => { 
                if(res && res.data.success) {
                    this.setState({ formIsFilledOut: false, redirect: true })
                }
            })
            .catch(error => {
                console.log(error);
            });
        }
    }
    next = () => {
        if(this.formValidation.isValid()){
            this.setState({activeStep:this.state.activeStep+1})
        }
    }
    back = () => {
        if(this.state.activeStep > 0)
            this.setState({activeStep:this.state.activeStep-1})
    }
    getPageContents = (classes) => {
        switch (this.state.activeStep) {
            case 0: // Job Page
              return <div className={classes.formSection}>
                        <div className={classes.input2}>
                            <CompanySelector
                                required
                                onChange={(company)=>this.setState(company, this.formValidation.shouldRevalidate)}
                                value={this.state.oldPost.companyId}
                                {...this.formValidation.hasError("company")}/>
                        </div>
                        <div className={classes.input2}>  
                            <TitleSelector
                                required
                                onChange={this.handleChangeKV}
                                value={this.state.oldPost.title}
                                {...this.formValidation.hasError("title")}/>
                    </div>  
                    <div className={classes.input2}>
                        <RequirementsSelector
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.oldPost.requirements}
                            {...this.formValidation.hasError("requirements")}/>
                    </div>  
                    <div className={classes.input2}>
                        <JobTypeSelector
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.oldPost.jobType}
                            {...this.formValidation.hasError("jobType")}/>
                    </div>
                    {this.state.jobType !== -1 &&
                        <div className={classes.SkillSearch}>
                            <SkillSearch
                                onChange={this.handleChangeKV}
                                jobType={this.state.jobType}
                                value={this.state.oldPost.tagIds}
                                {...this.formValidation.hasError("tagIds")}/>
                        </div>
                    }
                    <div className={classes.input2}>
                        <SalarySelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.oldPost.salary}
                            {...this.formValidation.hasError("salary")}/>
                            &nbsp;&nbsp;&nbsp;
                        <ExperienceSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.oldPost.experience}
                            {...this.formValidation.hasError("experience")}/>
                    </div>
                    <div className={classes.input2}>
                        <InterviewCountSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.oldPost.interviewCount}
                            {...this.formValidation.hasError("interviewCount")}/>
                            &nbsp;&nbsp;&nbsp;
                        <NumberOpeningsSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.oldPost.openPositions}
                            {...this.formValidation.hasError("openPositions")}/>
                    </div>
                    <div className={classes.input2}>
                        <OpenReasonSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.oldPost.openingReasonId || this.state.oldPost.openingReasonComment}
                            {...this.formValidation.hasError("openingReasonId")}/>
                    </div>
                    <div className={classes.input2}>
                        <AddressInput
                            onChange={this.handleAddressChange.bind(this)}
                            value={this.state.oldPost.address}
                            {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                        />
                    </div>
                    {(this.state.oldPost.postId == null || this.state.oldPost.preliminary) &&  
                            <FormControlLabel 
                                control={ 
                                    <Checkbox 
                                        defaultChecked={true} 
                                        onChange={(e)=>this.setState({autoAddRecruiters: e.target.checked})} 
                                        color="primary" 
                                    /> 
                                } 
                                label="Auto Add Recruiters" 
                            /> 
                    }
                </div>
            case 1: // Benefits Page
                return <BenefitsPage
                    value={this.state.benefitIds}
                    onChange={this.handleChangeKV}/>
            case 2: // Review Page
                return <SubscriptionReview numberOfOpenings={this.state.openPositions} salary={this.state.salary}/>
            default:
                return <div>Page does not exist</div>
        }
    }
    render(){   
        const { classes } = this.props;
        return (
            <React.Fragment>
                {this.state.redirect ? <Redirect to='/accountManager/activeJobs' /> : ''}
                <Prompt
                    when={this.state.formIsFilledOut}
                    message="Are you sure you want to leave? Any unsaved changes will be lost."
                    />
                <div className="pageHeading">Post a job</div> 
                <Stepper nonLinear activeStep={this.state.activeStep}>
                    {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel completed={index<this.state.activeStep}>
                        {label}
                        </StepLabel>
                    </Step>
                    ))}
                </Stepper>
                <div className={classes.postAJobContainer}>
                    {
                        this.getPageContents(classes)
                    }
                    <div className={classes.buttonContainer}>
                        <Button 
                        color="primary"
                        variant="contained"
                        className={classes.button}
                        disabled={this.state.activeStep === 0}
                        onClick={this.back}>Back</Button>
                        {
                            this.state.activeStep===2?
                            <Button 
                            color="primary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.handleSubmit}>Post</Button>
                            :
                            <Button 
                            color="primary"
                            variant="contained"
                            className={classes.button}
                            onClick={this.next}>Next</Button>
                        }
                    </div>
                </div>  

            </React.Fragment>
        );
    }
};

export default withStyles(styles)(PostAJob);  
