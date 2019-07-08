import React from 'react';
import {get, post, setAuthToken} from '../../../ApiCalls';  
import SkillSearch from '../../../components/Inputs/SkillSearch/SkillSearch';
import { withStyles } from '@material-ui/core/styles';
import FormValidation from '../../../FormValidation';
import AddressInput from '../../../components/Inputs/AddressInput/AddressInput';
import SalarySelector from '../../../components/Inputs/SalarySelector/SalarySelector';
import ExperienceSelector from '../../../components/Inputs/ExperienceSelector/ExperienceSelector';
import JobTypeSelector from '../../../components/Inputs/JobTypeSelector/JobTypeSelector';
import InterviewCountSelector from '../../../components/Inputs/InterviewCountSelector/InterviewCountSelector';
import NumberOpeningsSelector from '../../../components/Inputs/NumberOpeningsSelector/NumberOpeningsSelector';
import OpenReasonSelector from '../../../components/Inputs/OpenReasonSelector/OpenReasonSelector';
import TitleSelector from '../../../components/Inputs/TitleSelector/TitleSelector';
import RequirementsSelector from '../../../components/Inputs/RequirementsSelector/RequirementsSelector';
import classNames from 'classnames';
import { Stepper, Step, StepLabel, Button } from '@material-ui/core';
import BenefitsPage from '../../../components/BenefitsPage/BenefitsPage';
import SubscriptionReview from '../../../components/SubscriptionReview/SubscriptionReview';

const styles = theme => ({
    textField: {
        width: "50%",
    },
    selectFormControl:{
        flex: "1 1",
    },
    SkillSearch:{
    },
    buttonContainer:{
        display: "flex"
    },
    button:{
        flex: "1 1",
        margin: "20px 10px 0 10px",
    },
    textArea:{
        width: "100%",
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
    },
    headerItems:{
        flex: "1 1",
        textOverflow: "ellipsis",
        overflow: "hidden"
    },
    headerItemCenter:{
        textAlign:"center",
        fontSize:"1.5em"
    },
    headerItemRight:{
        textAlign:"right"
    }
})
const errorText = [
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
const steps = ['Job Information', 'Benefits', 'Payment', 'Done']
class EmployerJobPost extends React.Component{
    constructor(props) {
        super(props);
        const token = props.match.params.token
        this.state = {
            token: token,
            title:'',
            requirements:'',
            salary:0,
            jobType:-1,
            experience:0,
            interviewCount:0,
            openPositions: 1,
            openingReasonId: -1,
            openingReasonComment: '',
            address:{},
            companies: [],
            tagIds: [],
            errors: {},
            companyName: '',
            accountManagers: [],
            email: '',
            benefitIds: [],
            activeStep: 0
        }
        setAuthToken(token)
        this.handleChangeKV = this.handleChangeKV.bind(this)
        this.formValidation = new FormValidation(this, errorText);
    }

    componentDidMount() {
        this.loadTokenData();
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }
    handleChangeKV = (map) => {
        this.setState(map, this.formValidation.shouldRevalidate)
    }
    handleAddressChange(address){
        this.setState({address:address}, this.formValidation.shouldRevalidate)
    }
    loadAccountManagers = () => {
        get(`/api/company/getCompanyAccountManagerList/${this.state.companyId}`)
        .then((res) => { 
            if(res && res.data.success) {
                this.setState({accountManagers: res.data.contactList})
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    loadTokenData = () => {
        get('/api/auth/current')
        .then((res) => { 
            if(res && res.data.success) {
                this.setState({...res.data.data}, this.loadAccountManagers)
            }
        })
        .catch(error => {
            console.log(error);
        });
        
    }

    handleSubmit = () => {
        if(this.formValidation.isValid()){
            post('/api/employerPostings/create', this.state)
            .then((res) => { 
                if(res && res.data.success) {
                    this.setState({ redirect: true, activeStep: this.state.activeStep+1 })
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
                        <TitleSelector
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.title}
                            {...this.formValidation.hasError("title")}/>
                    </div>  
                    <div className={classes.input2}>
                        <RequirementsSelector
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.requirements}
                            {...this.formValidation.hasError("requirements")}/>
                    </div>  
                    <div className={classes.input2}>
                        <JobTypeSelector
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.jobType}
                            {...this.formValidation.hasError("jobType")}/>
                    </div>
                    {this.state.jobType !== -1 &&
                        <div className={classes.SkillSearch}>
                            <SkillSearch
                                onChange={this.handleChangeKV}
                                jobType={this.state.jobType}
                                value={this.state.tagIds}
                                {...this.formValidation.hasError("tagIds")}/>
                        </div>
                    }
                    <div className={classes.input2}>
                        <SalarySelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.salary}
                            {...this.formValidation.hasError("salary")}/>
                            &nbsp;&nbsp;&nbsp;
                        <ExperienceSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.experience}
                            {...this.formValidation.hasError("experience")}/>
                    </div>
                    <div className={classes.input2}>
                        <InterviewCountSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.interviewCount}
                            {...this.formValidation.hasError("interviewCount")}/>
                            &nbsp;&nbsp;&nbsp;
                        <NumberOpeningsSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.openPositions}
                            {...this.formValidation.hasError("openPositions")}/>
                    </div>
                    <div className={classes.input2}>
                        <OpenReasonSelector 
                            required
                            onChange={this.handleChangeKV}
                            value={this.state.openingReasonId || this.state.openingReasonComment}
                            {...this.formValidation.hasError("openingReasonId")}/>
                    </div>
                    <div className={classes.input2}>
                        <AddressInput
                            onChange={this.handleAddressChange.bind(this)}
                            value={this.state.address}
                            {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                        />
                    </div>
                </div>
            case 1: // Benefits Page
                return <BenefitsPage
                    value={this.state.benefitIds}
                    onChange={this.handleChangeKV}/>
            case 2: // Review Page
                return <SubscriptionReview 
                    accountManagers={this.state.accountManagers}
                    numberOfOpenings={this.state.openPositions}
                    salary={this.state.salary}/>
            case 3: // Done Page
                return <div className={classes.formSection}>
                    Your post has been recieved.
                    <br/>
                    Your designated account manager will be in contact with any questions and a final list.
                    <br/>
                    <br/>
                    Your Account Manager(s):
                    {
                        this.state.accountManagers.filter(d=>d.isPrimary).map((d, i)=>{
                            return <div key={i}>
                                <div><span>{d.firstName}</span> <span>{d.lastName}</span></div>
                                <div><a href={`mailto:${d.email}`}>{d.email}</a></div>
                                <div><a href={`tel:${d.phoneNumber}`}>{d.phoneNumber}</a></div> 
                                <br/>
                            </div>
                        })
                    }
                </div>
            default:
                return <div>Page does not exist</div>
        }
    }
    render(){   
        const { classes } = this.props;
        return (
            <React.Fragment>
                <div className="pageHeading">
                    <div className={classes.headerItems}>Post a job</div>
                    <div className={classNames(classes.headerItems, classes.headerItemCenter)}>{this.state.companyName}</div>
                    <div className={classNames(classes.headerItems, classes.headerItemRight)}>{this.state.email}</div>
                </div> 
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
                    {
                        this.state.activeStep!==3 &&
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
                    }
                </div> 
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(EmployerJobPost);  
