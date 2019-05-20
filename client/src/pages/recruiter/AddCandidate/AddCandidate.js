import React from 'react';
import './AddCandidate.css';  
import AuthFunctions from '../../../AuthFunctions'; 
import {get, post} from '../../../ApiCalls';  
import TagSearch from '../../../components/Inputs/TagSearch/TagSearch';  

import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

const styles = theme => ({
    alertClose: {
        position: "absolute",
        right: "10px",
        height: "60px",
    }, 
    textField: {
        width: 400,
    },
    submitCandidateBtn:{
        width: "100%"
    },
    selectFormControl:{
        marginTop: "10px"
    },
    tagSearch:{
        marginTop: "10px"
    }
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
            onClose: props.onClose,
            salaryList: [],
            experienceList: []
        }
        this.Auth = new AuthFunctions();
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
 
    componentDidMount() {
        this.loadData();
    } 

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
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



    render(){
        const { classes } = this.props;
        return (
            <React.Fragment> 
                {/* this.state.redirect ? <Redirect to='/recruiter/candidateList' /> : '' */}
                <div className="pageHeading">Add a Candidate</div>
                <IconButton color="inherit" className={classes.alertClose} onClick={this.state.onClose}>
                    <Close color="primary" />
                </IconButton>
                <div className="addCandidateContainer">
                    <div className="formSection">  
                        <div className="input-2">
                            <div className="i-2 il">
                                <TextField
                                    name="firstName"
                                    label="First Name"
                                    className={classes.textField}
                                    required
                                    onChange={this.handleChange}
                                    margin="normal"
                                    variant="outlined"
                                />
                            </div>
                            <div className="i-2 il">
                                <TextField
                                    name="lastName"
                                    label="Last Name"
                                    className={classes.textField}
                                    required
                                    onChange={this.handleChange}
                                    margin="normal"
                                    variant="outlined"
                                />
                            </div>
                            <div className="i-2 il">
                                <TextField
                                    name="email"
                                    label="Email"
                                    className={classes.textField}
                                    required
                                    onChange={this.handleChange}
                                    margin="normal"
                                    variant="outlined"
                                />
                            </div>
                            <div className="i-2 il">
                            
                                <FormControl className={classes.selectFormControl}>
                                    <InputLabel htmlFor="salary-helper">Salary</InputLabel>
                                    <Select
                                        value={this.state.salary}
                                        className={classes.textField}
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
                                </FormControl>
                            </div>
                            <div className="i-2 il">
                                <FormControl className={classes.selectFormControl}>
                                    <InputLabel htmlFor="experience-helper">Experience</InputLabel>
                                    <Select
                                        value={this.state.experience}
                                        className={classes.textField}
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
                                </FormControl>
                                <TagSearch
                                    className={classes.tagSearch}
                                    onChange={(tags)=>this.setState({tagIds:tags})}/>
                            </div>
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