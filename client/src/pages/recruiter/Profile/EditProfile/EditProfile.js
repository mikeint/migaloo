import React from 'react';
import {post, cancel} from '../../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ModifiableProfileImage from '../../../../components/ModifiableProfileImage/ModifiableProfileImage';
import FormValidation from '../../../../FormValidation';
import JobTypeSelector from '../../../../components/Inputs/JobTypeSelector/JobTypeSelector';
import classNames from 'classnames';
import AddressInput from '../../../../components/Inputs/AddressInput/AddressInput';

const styles = theme => ({
    saveButton:{ 
        width: "80%",
        marginBottom: 20
    },
    textField: {
        width: 400,
        margin: "10px"
    },
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
    center:{
        marginLeft:"auto",
        marginRight:"auto",
    },
    addressField:{
        width: "80%",
        display: "inline-block"
    },
    alertClose: {
        position: "absolute",
        right: "10px"
    },
    alertTitle: {
        width: "100%",
        height: "50px",
        backgroundColor: "#263c54",
        textAlign: "center",
        color: "#fff",
        lineHeight: "50px",
        fontSize: "24px",
        fontWeight: "bold", 
        position: "relative"
    },
    flexBox:{
        display: "flex",
        flexDirection: "column"
    }
});
const errorText = [
    {
        stateName: "firstName",
        errorText: "Please enter a first name"
    },
    {
        stateName: "lastName",
        errorText: "Please enter a last name"
    },
    {
        stateName: "phoneNumber",
        errorText: "Please select a valid phone number"
    },
    { 
        stateName: "jobTypeId", 
        errorText: "Please select the job type",
        type: "number",
        gt: -1
    },
    {
        stateName: "address.placeId",
        errorText: "Please select an address for the company"
    }
]
class EditProfile extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            loading: true,
            onClose: props.onClose,
            isModified: false,
            didSave: false,
            errors:{},
            ...props.defaultData
        };
        this.formValidation = new FormValidation(this, errorText);
    }
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount = () => {
    }
    saveProfile = (user) => {
        if(this.formValidation.isValid()){
            post(`/api/recruiter/setProfile`, this.state)
            .then((res)=>{
                if(res && res.data.success){
                    this.setState({didSave: true, isModified:false})
                    this.getContactList();
                }
            })
            .catch(errors => 
                console.log(errors)
            )
        }
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, isModified:this.state.isModified||this.state[e.target.name]!==e.target.value }, this.formValidation.shouldRevalidate)
    }
    handleChangeKV = (map) => {
        this.setState(map, this.formValidation.shouldRevalidate)
    }
    closeSelf(){
        this.state.onClose(this.state.didSave)
    }
    handleAddressChange(address){
        this.setState({address:address})
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <div> 
                <div className={classes.alertTitle} color="primary">
                    <span>Edit Profile</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={this.closeSelf.bind(this)}>
                        <Close />
                    </IconButton>
                </div>
                <div className={classes.flexBox}>
                    <br/>
                    <div className={classes.center}>
                        <ModifiableProfileImage user={this.state.company} type={'accountManager'}/>
                    </div>
                    
                    <div className={classes.center}>
                        <TextField
                            name="firstName"
                            label="First Name"
                            className={classes.textField}
                            defaultValue={this.state.firstName}
                            required
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("firstName")}
                        />
                    </div>
                    <div className={classes.center}>
                        <TextField
                            name="lastName"
                            label="Last Name"
                            className={classes.textField}
                            defaultValue={this.state.lastName}
                            required
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("lastName")}
                        />
                    </div>
                    <div className={classes.center}>
                        <TextField
                            name="phoneNumber"
                            label="Phone Number"
                            className={classes.textField}
                            defaultValue={this.state.phoneNumber}
                            required
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("phoneNumber")}
                        />
                    </div>
                    <div className={classes.center}>
                        <TextField
                            name="email"
                            label="Email"
                            className={classes.textField}
                            defaultValue={this.state.email}
                            required
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("email")}
                        />
                    </div>
                    <div className={classes.center}>
                        <TextField
                            name="password"
                            label="Password"
                            className={classes.textField}
                            defaultValue={this.state.password}
                            required
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("password")}
                        />
                    </div>
                    <JobTypeSelector
                        required
                        multiple={true}
                        classes={{root:classes.center}}
                        onChange={this.handleChangeKV}
                        value={this.state.jobTypeId}
                        {...this.formValidation.hasError("jobTypeId")}/> 
                     <div className={classes.center}>
                        <TextField
                            name="linkedInUrl"
                            label="LinkedIn Url"
                            className={classes.textField}
                            defaultValue={this.state.linkedInUrl} 
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("linkedInUrl")}
                        />
                    </div>
                    <div className={classes.center}>
                        <AddressInput
                            value={this.state.address}
                            onChange={this.handleAddressChange.bind(this)}
                            {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                        />
                    </div>
                    <Button
                        className={classNames(classes.saveButton, classes.center)}
                        color="primary"
                        variant="contained"
                        disabled={!this.state.isModified}
                        onClick={this.saveProfile}>Save Changes</Button>
                </div>
            </div> 
        )
    }
}
 

export default withStyles(styles)(EditProfile);