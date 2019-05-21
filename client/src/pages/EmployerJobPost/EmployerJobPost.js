import React from 'react';
import AuthFunctions from '../../AuthFunctions'; 
import {post, setAuthToken} from '../../ApiCalls';  
import TagSearch from '../../components/Inputs/TagSearch/TagSearch';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormValidation from '../../FormValidation';
import AddressInput from '../../components/Inputs/AddressInput/AddressInput';
import SalarySelector from '../../components/Inputs/SalarySelector/SalarySelector';
import ExperienceSelector from '../../components/Inputs/ExperienceSelector/ExperienceSelector';
import JobTypeSelector from '../../components/Inputs/JobTypeSelector/JobTypeSelector';
import InterviewCountSelector from '../../components/Inputs/InterviewCountSelector/InterviewCountSelector';
import NumberOpeningsSelector from '../../components/Inputs/NumberOpeningsSelector/NumberOpeningsSelector';
import OpenReasonSelector from '../../components/Inputs/OpenReasonSelector/OpenReasonSelector';

const styles = theme => ({
    textField: {
        width: "50%",
    },
    selectFormControl:{
        flex: "1 1",
    },
    tagSearch:{
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
        stateName: "interviewCount", 
        errorText: "Please select the number of candidates to interview",
        type: "number",
        gt: -1
    },
    { 
        stateName: "numOpenings", 
        errorText: "Please select the number of openings",
        type: "number",
        gt: -1
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
            numOpenings: 0,
            openReason: -1,
            address:{},
            companies: [],
            tagIds: [],
            errors: {}
        }
        setAuthToken(token)
        this.Auth = new AuthFunctions();
        this.handleChangeKV = this.handleChangeKV.bind(this)
        this.formValidation = new FormValidation(this, errorText);
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }
    handleChangeKV = (map) => {
        console.log(map)
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
                document.getElementById("registration_popup").style.display = "block"
            });
        }
    }
    render(){   
        const { classes } = this.props;
        return (
            <React.Fragment>
                <div className="pageHeading">Post a job</div> 
                <div className={classes.postAJobContainer}>
                    <div className={classes.formSection}>
                        <div className={classes.input2}>  
                            <TextField
                                name="title"
                                label="Title"
                                className={classes.textField}
                                required
                                onChange={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("title")}
                            />
                        </div>  
                        <div className={classes.input2}>  
                            <TextField
                                name="requirements"
                                label="Requirements"
                                multiline={true}
                                className={classes.textArea}
                                placeholder="A list of requirements"
                                rowsMax={10}
                                rows={4}
                                required
                                onChange={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("requirements")}
                            />
                        </div>  
                        <div className={classes.input2}>
                            <JobTypeSelector
                                required
                                onChange={this.handleChangeKV}
                                {...this.formValidation.hasError("jobType")}/>
                        </div>
                        {this.state.jobType !== -1 &&
                            <div className={classes.tagSearch}>
                                <TagSearch
                                    onChange={this.handleChangeKV}
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
