import React from 'react';
import {get, post, cancel} from '../../../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import {Button, TextField}
    from '@material-ui/core';
import PlanSelector from '../../../../../components/Inputs/PlanSelector/PlanSelector';

const styles = theme => ({
    button:{ 
        width: "80%",
        display: "inline-block",
        margin: 5
    },
    textField: {
        width: "50%",
        margin: "10px"
    },
    label:{
        fontWeight: "bold"
    },
    center:{
        textAlign:"center"
    },
    planContainer:{
        display: "flex",
        flexWrap: "wrap"
    },
    plan:{
        flex: "1 1",
        margin: 10,
        minWidth: "250px"
    }
});
class Plan extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            company: props.company,
            isModified: false,
            didSave: false,
            plans: [],
            errors:{}
        };
        console.log(this.state.company)
    }
    componentWillUnmount = () => {
    }
    saveCompany = (user) => {
        if(this.formValidation.isValid()){
            post(`/api/company/setCompanyProfile`, this.state)
            .then((res)=>{
                if(res && res.data.success){
                    this.setState({didSave: true, isModified:false})
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
    handleAddressChange(address){
        this.setState({address:address}, this.formValidation.shouldRevalidate)
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <div className={classes.planContainer}>
                <div className={classes.plan}>
                    <h2>Current Plan</h2>
                    <div><span className={classes.label}>Subscription Type: </span>{this.state.company.planTypeName}</div>
                    <div><span className={classes.label}>Subscription Percentage: </span>{this.state.company.subscriptionPercentage*100}%</div>
                    <div><span className={classes.label}>Positions Filled: </span>{this.state.company.positionsFilled}</div>
                    <div><span className={classes.label}>Salary Filled: </span>{this.state.company.salaryFilled.toLocaleString()}</div>
                    {this.state.company.planTypeId !== 1 && 
                        <React.Fragment>
                            <div><span className={classes.label}>Subscription Remaining: </span>{this.state.company.subscriptionRemaining.toLocaleString()}</div>
                            <div><span className={classes.label}>Subscription Expiry: </span>{this.state.company.subscriptionExpiry}</div>
                        </React.Fragment>
                    }
                    {this.state.company.subscriptionNote && <div><span className={classes.label}>Subscription Note: </span>{this.state.company.subscriptionNote}</div>}
                </div>
                <div className={classes.plan}>
                    <h2>New Plan</h2>
                    <PlanSelector plan={this.state.company}/>
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        disabled={!this.state.isModified}
                        onClick={this.saveCompany}>Save Changes</Button>
                </div>
            </div>
        )
    }
}
 

export default withStyles(styles)(Plan);