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
    textAreaMaxHeight:{
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
        stateName: "caption",
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
            caption:'',
            salary:-1,
            jobType:-1,
            experience:-1,
            address:{},
            companies: [],
            errors: {}
        }
        setAuthToken(token)
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
                                name="caption"
                                label="Requirements"
                                multiline={true}
                                className={classes.textAreaMaxHeight}
                                placeholder="A list of requirements"
                                rowsMax={7}
                                rows={2}
                                required
                                onChange={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("caption")}
                            />
                        </div>  
                        <div  className={classes.tagSearch}>
                            <TagSearch
                                onChange={(tags)=>this.setState({tagIds:tags}, this.formValidation.shouldRevalidate)}
                                {...this.formValidation.hasError("tagIds")}/>
                        </div>
                        <div className={classes.input2}>
                            <JobTypeSelector
                                required
                                onChange={(jobType)=>this.setState({jobType:jobType}, this.formValidation.shouldRevalidate)}
                                {...this.formValidation.hasError("jobType")}/>
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
