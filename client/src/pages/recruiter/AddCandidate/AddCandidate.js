import React from 'react';
import AuthFunctions from '../../../AuthFunctions'; 
import {post} from '../../../ApiCalls';  
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
import { TextField, FormControlLabel, Checkbox, IconButton, Button } from '@material-ui/core';
import FormValidation from '../../../FormValidation';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SwipeableViews from 'react-swipeable-views';

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
    postButton:{
        width:"100%",
        marginTop: "20px"
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
  

function TabContainer({ children, dir }) {
    return (
      <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
        {children}
      </Typography>
    );
  }
   

class AddCandidate extends React.Component{
    constructor(props) {
        super(props);
        this.state = {   
            firstName:'',
            lastName:'',
            email:'',
            salary:0,
            jobTypeId:-1,
            experience:0,
            address:{},
            tagIds:[],
            relocatable: false,
            redirect: false,
            onClose: props.onClose,
            errors:{},
            tab: 0
        }
        this.Auth = new AuthFunctions();
        this.formValidation = new FormValidation(this, errorText);
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

    handleChangeIndex = (index) => { 
        this.setState({tab: index})
    }
    handleTabChange = (event, newValue) => { 
        this.setState({tab: newValue})
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
                    <AppBar position="static" color="default">
                        <Tabs
                            value={this.state.tab}
                            onChange={this.handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                        >
                            <Tab label="Information" />
                            <Tab label="Expectations" /> 
                        </Tabs>
                    </AppBar>
                    <SwipeableViews
                        axis={'x'}
                        index={this.state.tab}
                        onChangeIndex={this.handleChangeIndex}
                        disabled={true}
                    >
                        <TabContainer> 
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
                                    <TextField
                                        name="url"
                                        label="Linkdin/Profile Url"
                                        className={classes.textField}
                                        onChange={this.handleChange}
                                        margin="normal"
                                        variant="outlined"
                                        {...this.formValidation.hasError("url")}
                                    />
                                </div>
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
                                    <JobTypeSelector
                                        required
                                        onChange={this.handleChangeKV}
                                        {...this.formValidation.hasError("jobTypeId")}/>
                                </div>
                                {this.state.jobTypeId !== -1 &&
                                    <div className={classes.SkillSearch}>
                                        <SkillSearch
                                            onChange={this.handleChangeKV}
                                            jobTypeId={this.state.jobTypeId}
                                            {...this.formValidation.hasError("tagIds")}/>
                                    </div>
                                }
                                <div className={classes.input2}>
                                    <AddressInput
                                        onChange={this.handleAddressChange.bind(this)}
                                        {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                                    />
                                </div> 

                                <div>
                                    <TextField
                                        name="currentCompany"
                                        label="Current Compnay"
                                        className={classes.textField}
                                        onChange={this.handleChange}
                                        margin="normal"
                                        variant="outlined"
                                        {...this.formValidation.hasError("currentCompany")}
                                    />  
                                </div>

                                <div>
                                    <TextField
                                        name="phone"
                                        label="Phone"
                                        className={classes.textField}
                                        onChange={this.handleChange}
                                        margin="normal"
                                        variant="outlined"
                                        {...this.formValidation.hasError("phone")}
                                    />  
                                </div>
 
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            defaultChecked={false}
                                            onChange={(e)=>this.setState({relocatable: e.target.checked})}
                                            color="primary"
                                        />
                                    }
                                    label="Willing to Relocate"
                                />
                                <Button
                                    color="primary"
                                    variant="contained"
                                    className={classes.submitCandidateBtn}
                                    onClick={this.handleSubmit}>Add Candidate</Button>
                            </div> 
                        </TabContainer>
                        <TabContainer>
                            <div className={classes.formSection}>
                                <div>
                                    <TextField
                                        name="e_jobtitle"
                                        label="Job Title"
                                        className={classes.textField}
                                        onChange={this.handleChange}
                                        margin="normal"
                                        variant="outlined"
                                        {...this.formValidation.hasError("e_jobtitle")}
                                    />  
                                </div> 
                                <div>
                                    <SalarySelector 
                                        required
                                        onChange={this.handleChangeKV}
                                        {...this.formValidation.hasError("e_salary")}/>
                                </div> 
                                <div>
                                    <CommuteSelector 
                                        required
                                        onChange={this.handleChangeKV}
                                        {...this.formValidation.hasError("e_commute")}/>
                                </div>
                                <div>
                                    <ResponsibilitiesSelector
                                        required
                                        onChange={this.handleChangeKV}
                                        {...this.formValidation.hasError("e_responsibilities")}/>
                                </div>
                                <div>
                                    <HighlightsSelector
                                        required
                                        onChange={this.handleChangeKV}
                                        {...this.formValidation.hasError("e_highlights")}/>
                                </div>
                            </div>


                        </TabContainer> 
                    </SwipeableViews>
                </div>

                    
                
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(AddCandidate);  