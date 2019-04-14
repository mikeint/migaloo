import React from 'react';
import ApiCalls from '../../../../ApiCalls';  
import './AddEmployer.css';  
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddressInput from '../../../../components/AddressInput/AddressInput';

const styles = theme => ({
    button:{ 
        width: "80%",
    },
    contents:{
        margin: "10px"
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
class AddEmployer extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            onClose: props.onClose,
            company_name: '',
            address:{}
        };
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }
    addEmployer = () => {
        const data = {
            company_name:this.state.company_name,
            ...this.state.address
        }
        ApiCalls.post(`/api/employer/addEmployer`, data)
        .then((res)=>{
            if(res && res.data.success){
                this.state.onClose(true)
            }
        }).catch(errors => {
            console.log(errors.response.data)
        })
    }
    handleAddressChange(address){
        this.setState({address:address})
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <React.Fragment> 
                <div className={classes.alertTitle} color="primary">
                    <span>Add New Employer</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={()=>this.state.onClose()}>
                        <Close />
                    </IconButton>
                </div>
                <div className={classes.contents}>
                    <TextField
                        name="company_name"
                        label="Company Name"
                        className={classes.textField}
                        required
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                    />
                    <div>
                        <AddressInput onChange={this.handleAddressChange.bind(this)}/>
                    </div>
                </div>
                <div className={classes.center}>
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={this.addEmployer}>Add Employer</Button>
                </div>
                <br/>
            </React.Fragment> 
        )
    }
}
 

export default withStyles(styles)(AddEmployer);