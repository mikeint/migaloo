import React from 'react';
import {get, post, setAuthToken} from '../../../ApiCalls';  
import SkillSearch from '../../../components/Inputs/SkillSearch/SkillSearch';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
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

const styles = theme => ({
    textField: {
        width: "50%",
    },
    selectFormControl:{
        flex: "1 1",
    },
    SkillSearch:{
    },
    postButton:{
        width:"100%",
        marginTop: "20px"
    },
    textArea:{
        width: "100%",
    },
    postAJobContainer: {
        padding: "20px",
        color: theme.palette.primary.main,
        display: "flex"
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
        stateName: "openReason", 
        errorText: "Please select the reason for the job opening",
        type: "number",
        gt: -1
    },
    { 
        stateName: "openReasonExplain", 
        errorText: "Please select the reason for the job opening",
        or: "openReason"
    },
    { 
        stateName: "interviewCount", 
        errorText: "Please select the number of candidates to interview",
        type: "number",
        gt: -1
    },
    { 
        stateName: "numOpenings", 
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
            numOpenings: 1,
            openReason: -1,
            openReasonExplain: '',
            address:{},
            companies: [],
            tagIds: [],
            errors: {},
            companyName: '',
            email: ''
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
    loadTokenData = () => {
        get('/api/auth/current')
        .then((res) => { 
            if(res && res.data.success) {
                this.setState(res.data.data)
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
                    this.setState({ redirect: true })
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
                <div className="pageHeading">
                    <div className={classes.headerItems}>Post a job</div>
                    <div className={classNames(classes.headerItems, classes.headerItemCenter)}>{this.state.companyName}</div>
                    <div className={classNames(classes.headerItems, classes.headerItemRight)}>{this.state.email}</div>
                </div> 
                <div className={classes.postAJobContainer}>
                    <div className={classes.formSection}>
                        <div className={classes.input2}>  
                            <TitleSelector
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("title")}/>
                        </div>  
                        <div className={classes.input2}>
                            <RequirementsSelector
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("requirements")}/>
                        </div>  
                        <div className={classes.input2}>
                            <JobTypeSelector
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("jobType")}/>
                        </div>
                        {this.state.jobType !== -1 &&
                            <div className={classes.SkillSearch}>
                                <SkillSearch
                                    onChange={this.handleChangeKV}
                                    jobType={this.state.jobType}
                                    {...this.formValidation.hasError("tagIds")}/>
                            </div>
                        }
                        <div className={classes.input2}>
                            <SalarySelector 
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("salary")}/>
                                &nbsp;&nbsp;&nbsp;
                            <ExperienceSelector 
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("experience")}/>
                        </div>
                        <div className={classes.input2}>
                            <InterviewCountSelector 
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("interviewCount")}/>
                                &nbsp;&nbsp;&nbsp;
                            <NumberOpeningsSelector 
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("numOpenings")}/>
                        </div>
                        <div className={classes.input2}>
                            <OpenReasonSelector 
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("openReason")}/>
                        </div>
                        <div className={classes.input2}>
                            <AddressInput
                                value={this.state.address}
                                onChange={this.handleAddressChange.bind(this)}
                                {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                            />
                        </div>
                        <Button 
                            color="primary"
                            variant="contained"
                            className={classes.postButton}
                            onClick={this.handleSubmit}>Post</Button>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(EmployerJobPost);  
