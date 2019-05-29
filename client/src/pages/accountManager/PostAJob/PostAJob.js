import React from 'react';
import { Redirect } from 'react-router-dom';

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
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormValidation from '../../../FormValidation';
import { Checkbox, FormControlLabel } from '@material-ui/core';

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
    postButton:{
        width:"100%",
        marginTop: "20px"
    },
    textAreaMaxHeight:{
        width: "100%",
        margin: "10px"
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
        stateName: "openReason", 
        errorText: "Please select the reason for the job opening",
        type: "number",
        gt: -1
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
            numOpenings: 1,
            openReason: -1,
            address:{},
            redirect: false,
            tagIds: [],
            errors: {},
            postId: props.match.params.postId,
            oldPost:{}
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
                this.setState({ oldPost: res.data.jobPosts[0] })
            }).catch(errors => 
                console.log(errors)
            )
        }
    }
    componentDidMount() {
        this.getJob()
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
                {this.state.redirect ? <Redirect to='/accountManager/activeJobs' /> : ''}
                <div className="pageHeading">Post a job</div> 
                <div className={classes.postAJobContainer}>
                    <div className={classes.formSection}>
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
                                value={this.state.oldPost.jobTypeId}
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
                                {...this.formValidation.hasError("numOpenings")}/>
                        </div>
                        <div className={classes.input2}>
                            <OpenReasonSelector 
                                required
                                onChange={this.handleChangeKV}
                                value={this.state.oldPost.openingReasonId || this.state.oldPost.openingReasonComment}
                                {...this.formValidation.hasError("openReason")}/>
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
                        <Button 
                            color="primary"
                            variant="contained"
                            className={classes.postButton}
                            onClick={this.handleSubmit}>
                            {this.state.oldPost.postId == null ? 'Post' :
                                (this.state.oldPost.preliminary ? 'Save & Post' : 'Save')}
                        </Button>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(PostAJob);  
