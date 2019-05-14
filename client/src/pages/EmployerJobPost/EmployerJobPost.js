import React from 'react';
import AuthFunctions from '../../AuthFunctions'; 
import {get, post, cancel, setAuthToken} from '../../ApiCalls';  
import TagSearch from '../../components/TagSearch/TagSearch';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormValidation from '../../FormValidation';
import AddressInput from '../../components/AddressInput/AddressInput';

const styles = theme => ({
    textField: {
        width: "50%",
        margin: "10px"
    },
    selectFormControl:{
        flex: "1 1",
        margin: "10px"
    },
    tagSearch:{
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
        stateName: "employer",
        errorText: "Please select an employer for the job posting"
    },
    {
        stateName: "experience",
        errorText: "Please select the experience required"
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
        const token = props.match.params.token
        this.state = {
            token: token,
            title:'',
            caption:'',
            salary:'',
            experience:'',
            employer:'',
            salaryList: [],
            experienceList: [],
            companies: [],
            errors: {}
        }
        setAuthToken(token)
        this.Auth = new AuthFunctions();
        this.formValidation = new FormValidation(this, errorText);
    }
    loadData(){
        get('/api/autocomplete/salary')
        .then((res) => {
            if(res && res.data.success) {
                this.setState({salaryList:res.data.salaryList});
            }
        })
        .catch(error => {
            console.log(error);
        });
        get('/api/autocomplete/experience')
        .then((res) => {
            if(res && res.data.success) {
                this.setState({experienceList:res.data.experienceList});
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
 
    componentWillUnmount = () => {
        cancel();
    }
    componentWillMount() {
        this.loadData()
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }
    handleAddressChange(address){
        this.setState({addressChange:address})
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
                            <FormControl
                                    className={classes.selectFormControl}
                                    {...(this.formValidation.hasError("employer").error?{error:true}:{})}>
                                <InputLabel htmlFor="employer-helper">Employer</InputLabel>
                                <Select
                                    value={this.state.employer}
                                    onChange={this.handleChange}
                                    input={<Input name="employer" id="employer-helper" />}
                                    inputProps={{
                                        id: 'employer',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Unspecified</em>
                                    </MenuItem>
                                    {this.state.companies.map((d, i)=>
                                        <MenuItem key={i} value={d.id}>{d.name}</MenuItem>
                                    )}
                                </Select>
                                <FormHelperText>{this.formValidation.hasError("employer").helperText}</FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.input2}>  
                            <TextField
                                name="title"
                                label="Title"
                                className={classes.textField}
                                required
                                onBlur={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("title")}
                            />
                        </div>  
                        <div className={classes.input2}>  
                            <TextField
                                name="caption"
                                label="Description"
                                multiline={true}
                                className={classes.textAreaMaxHeight}
                                placeholder="A basic Job Description"
                                rowsMax={7}
                                rows={2}
                                required
                                onBlur={this.handleChange}
                                margin="normal"
                                variant="outlined"
                                {...this.formValidation.hasError("caption")}
                            />
                        </div>  
                        <div  className={classes.tagSearch}>
                            <TagSearch onChange={(tags)=>this.setState({tagIds:tags}, this.formValidation.shouldRevalidate)}
                                    {...this.formValidation.hasError("tagIds")}/>
                        </div>
                        <div className={classes.input2}>  
                            <FormControl
                                    className={classes.selectFormControl}
                                    {...(this.formValidation.hasError("salary").error?{error:true}:{})} >
                                <InputLabel htmlFor="salary-helper">Salary</InputLabel>
                                <Select
                                    value={this.state.salary}
                                    onChange={this.handleChange}
                                    input={<Input name="salary" id="salary-helper" />}
                                    inputProps={{
                                        id: 'salary',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Unspecified</em>
                                    </MenuItem>
                                    {this.state.salaryList.map((d, i)=>
                                        <MenuItem key={i} value={d.salary_type_id}>{d.salary_type_name}</MenuItem>
                                    )}
                                </Select>
                                <FormHelperText>{this.formValidation.hasError("salary").helperText}</FormHelperText>
                            </FormControl>
                            <FormControl
                                    className={classes.selectFormControl}
                                    {...(this.formValidation.hasError("experience").error?{error:true}:{})} >
                                <InputLabel htmlFor="experience-helper">Experience</InputLabel>
                                <Select
                                    value={this.state.experience}
                                    onChange={this.handleChange}
                                    input={<Input name="experience" id="experience-helper" />}
                                    inputProps={{
                                        id: 'experience',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Unspecified</em>
                                    </MenuItem>
                                    {this.state.experienceList.map((d, i)=>
                                        <MenuItem key={i} value={d.experience_type_id}>{d.experience_type_name}</MenuItem>
                                    )}
                                </Select>
                                <FormHelperText>{this.formValidation.hasError("experience").helperText}</FormHelperText>
                            </FormControl>
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

export default withStyles(styles)(PostAJob);  
