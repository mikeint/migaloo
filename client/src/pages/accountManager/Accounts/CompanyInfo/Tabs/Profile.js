import React from 'react';
import {post} from '../../../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import ModifiableProfileImage from '../../../../../components/ModifiableProfileImage/ModifiableProfileImage';
import AddressInput from '../../../../../components/Inputs/AddressInput/AddressInput';
import FormValidation from '../../../../../FormValidation';
import {Button, TextField}
    from '@material-ui/core';
import classNames from 'classnames';

const styles = theme => ({
    button:{ 
        width: "80%",
        display: "inline-block",
        marginBottom: 5,
        marginTop: 5
    },
    textField: {
        width: "50%",
        margin: "10px"
    },
    center:{
        textAlign:"center"
    },
    addressField:{
        width: "80%",
        display: "inline-block"
    },
    redButton: theme.redButton,
});
const errorText = [
    {
        stateName: "companyName",
        errorText: "Please enter a name for the company"
    },
    {
        stateName: "department",
        errorText: "Please enter a departement for the company"
    },
    {
        stateName: "addressChange.placeId",
        errorText: "Please select an address for the company"
    }
]
class Profile extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            onDelete: props.onDelete,
            onChange: props.onChange,
            company: props.company,
            companyName: props.company.companyName,
            department: props.company.department,
            address: props.company.address,
            isModified: false,
            errors:{}
        };
        this.formValidation = new FormValidation(this, errorText);
    }
    componentWillUnmount = () => {
    }
    saveCompany = (user) => {
        if(this.formValidation.isValid()){
            post(`/api/company/setCompanyProfile`, this.state)
            .then((res)=>{
                if(res && res.data.success){
                    this.setState({isModified:false})
                    if(this.state.onChange)
                        this.state.onChange()
                }
            })
            .catch(errors => 
                console.log(errors)
            )
        }
    }
    deleteCompany = (user) => {
        post(`/api/company/deleteCompany`, {companyId: this.state.company.companyId})
        .then((res)=>{
            if(res && res.data.success){
                if(this.state.onDelete)
                    this.state.onDelete()
            }
        })
        .catch(errors => 
            console.log(errors)
        )
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, isModified:this.state.isModified||this.state[e.target.name]!==e.target.value }, this.formValidation.shouldRevalidate)
    }
    handleAddressChange(address){
        this.setState({address:address}, this.formValidation.shouldRevalidate)
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <div className={classes.center}>
                <br/>
                <div>
                    <ModifiableProfileImage id={this.state.company.companyId} type={'company'}/>
                </div>
                
                <div>
                <TextField
                    name="companyName"
                    label="Company Name"
                    className={classes.textField}
                    defaultValue={this.state.companyName}
                    required
                    onChange={this.handleChange}
                    margin="normal"
                    variant="outlined"
                    {...this.formValidation.hasError("companyName")}
                />
                </div>
                <div>
                <TextField
                    name="department"
                    label="Department"
                    className={classes.textField}
                    defaultValue={this.state.department}
                    required
                    onChange={this.handleChange}
                    margin="normal"
                    variant="outlined"
                    {...this.formValidation.hasError("department")}
                />
                </div>
                <div className={classes.addressField}>
                    <AddressInput
                    value={this.state.address}
                    onChange={this.handleAddressChange.bind(this)}
                    {...(this.formValidation.hasError("addressChange.placeId").error?{error:true}:{})}/>
                </div>
                <Button
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    disabled={!this.state.isModified}
                    onClick={this.saveCompany}>Save Changes</Button>
                <Button
                    className={classNames(classes.button, classes.redButton)}
                    color="primary"
                    variant="contained"
                    onClick={this.deleteCompany}>Delete Company</Button>
            </div>
        )
    }
}
 

export default withStyles(styles)(Profile);