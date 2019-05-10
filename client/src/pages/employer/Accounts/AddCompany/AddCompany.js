import React from 'react';
import {get, getWithParams, post, cancel, getNewAuthToken} from '../../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddressInput from '../../../../components/AddressInput/AddressInput';
import FormValidation from '../../../../FormValidation';

const styles = theme => ({
    button:{ 
        width: "80%",
    },
    contents:{
        margin: "10px",
        textAlign: "center"
    },
    textField: {
        width: "50%",
        marginTop: "10px"
    },
    center:{
        textAlign:"center"
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
        stateName: "company_name",
        errorText: "Please enter a name for the company"
    },
    {
        stateName: "department",
        errorText: "Please enter a departement for the company"
    },
    {
        stateName: "address.placeId",
        errorText: "Please select an address for the company"
    }
]
class AddCompany extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            onClose: props.onClose,
            company_name: '',
            department: '',
            address:{},
            errors: {}
        };
        this.formValidation = new FormValidation(this, errorText);
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }
    addCompany = () => {
        if(this.formValidation.isValid()){
            const data = {
                company_name:this.state.company_name,
                ...this.state.address
            }
            post(`/api/company/addCompany`, data)
            .then((res)=>{
                if(res && res.data.success){
                    this.state.onClose(true)
                }
            }).catch(errors => {
                console.log(errors.response.data)
            })
        }
    }
    handleAddressChange(address){
        this.setState({address:address}, this.formValidation.shouldRevalidate)
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <React.Fragment> 
                <div className={classes.alertTitle} color="primary">
                    <span>Add New Company</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={()=>this.state.onClose()}>
                        <Close />
                    </IconButton>
                </div>
                <div className={classes.contents}>
                    <div>
                        <TextField
                            name="company_name"
                            label="Company Name"
                            className={classes.textField}
                            required
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("company_name")}
                        />
                    </div>
                    <div>
                        <TextField
                            name="department"
                            label="Department"
                            className={classes.textField}
                            required
                            onChange={this.handleChange}
                            margin="normal"
                            variant="outlined"
                            {...this.formValidation.hasError("department")}
                        />
                    </div>
                    <AddressInput
                        onChange={this.handleAddressChange.bind(this)}
                        {...(this.formValidation.hasError("address.placeId").error?{error:true}:{})}
                        />
                </div>
                <div className={classes.center}>
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={this.addCompany}>Add Company</Button>
                </div>
                <br/>
            </React.Fragment> 
        )
    }
}
 

export default withStyles(styles)(AddCompany);