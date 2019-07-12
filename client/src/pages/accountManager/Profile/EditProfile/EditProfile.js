import React from 'react';
import {post, cancel} from '../../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ModifiableProfileImage from '../../../../components/ModifiableProfileImage/ModifiableProfileImage';
import FormValidation from '../../../../FormValidation';

const styles = theme => ({
    button:{ 
        width: "80%",
        display: "inline-block"
    },
    textField: {
        width: "50%",
        margin: "10px"
    },
    center:{
        textAlign:"center",
        marginBottom: "20px"
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
            post(`/api/accountManager/setProfile`,
                {companyId:this.state.companyId, companyName:this.state.companyName, department:this.state.department})
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
        this.setState({ [e.target.name]: e.target.value, isModified:this.state.isModified||this.state[e.target.name]!==e.target.value })
    }
    closeSelf(){
        this.state.onClose(this.state.didSave)
    }
    handleAddressChange(address){
        this.setState({addressChange:address})
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
                <div className={classes.center}>
                    <br/>
                    <div>
                        <ModifiableProfileImage user={this.state.company} type={'accountManager'}/>
                    </div>
                    
                    <div>
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
                    <div>
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
                    <div>
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
                    <Button
                        className={classes.button}
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