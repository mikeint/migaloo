import React from 'react';
import ApiCalls from '../../../../ApiCalls';  
import './AddEmployer.css';  
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    button:{ 
        width: "80%",
    },
    textField: {
        width: "50%",
        margin: "10px"
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
            company_name: ''
        };
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }
    addEmployer = () => {
        const data = {
            company_name:this.state.company_name
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
    render(){
        const { classes } = this.props; 
        return ( 
            <div> 
                <div className={classes.alertTitle} color="primary">
                    <span>Add New Employer</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={()=>this.state.onClose()}>
                        <Close />
                    </IconButton>
                </div>
                <br/>
                <TextField
                    name="company_name"
                    label="Company Name"
                    className={classes.textField}
                    required
                    onChange={this.handleChange}
                    margin="normal"
                    variant="outlined"
                />

                <div className={classes.center}>
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={this.addEmployer}>Add Employer</Button>
                </div>
                <br/>
            </div> 
        )
    }
}
 

export default withStyles(styles)(AddEmployer);