import React from 'react';
import {get, post, cancel} from '../../../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import {Button}
    from '@material-ui/core';
import PlanSelector from '../../../../../components/Inputs/PlanSelector/PlanSelector';
import moment from 'moment';

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
            companyId: props.company.companyId,
            planId: props.company.planId,
            company: {},
            planTypeId: null,
            subscriptionValue: null,
            plans: [],
            errors:{}
        };
    }
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount = () => {
        this.getPlanData();
    }
    
    getPlanData = () => {
        get(`/api/company/get/${this.state.companyId}`)
        .then((res)=>{    
            if(res == null) return
            const company = res.data.companies[0];
            this.setState({ company: company, planTypeId: company.planTypeId, subscriptionValue: company.subscriptionValue})
        }).catch(errors => 
            console.log(errors)
        )
    }
    setPlan = () => {
        post(`/api/plan/setPlan`, this.state)
        .then((res)=>{
            if(res && res.data.success){
                this.getPlanData();
            }
        })
        .catch(errors => 
            console.log(errors)
        )
    }
    addToPlan = () => {
        post(`/api/plan/addToPlan`, this.state)
        .then((res)=>{
            if(res && res.data.success){
                this.getPlanData();
            }
        })
        .catch(errors => 
            console.log(errors)
        )
    }
    handleChange = (e) => {
        this.setState(e)
    }
    render(){
        const { classes } = this.props;
        return ( 
            <div className={classes.planContainer}>
                <div className={classes.plan}>
                    <h2>Current Plan</h2>
                    <div><span className={classes.label}>Subscription Type: </span>{this.state.company.planTypeName == null ? 'None' : this.state.company.planTypeName}</div>
                    {this.state.company.planTypeName != null &&
                        <React.Fragment>
                            <div><span className={classes.label}>Positions Filled: </span>{this.state.company.positionsFilled}</div>
                            <div><span className={classes.label}>Salary Filled: </span>{this.state.company.salaryFilled.toLocaleString()}</div>
                            {this.state.company.planTypeId === 1 ? // On demand
                                <div><span className={classes.label}>Subscription Percentage: </span>{this.state.company.subscriptionValue}%</div>
                                : // Other then on demand
                                <React.Fragment>
                                    <div><span className={classes.label}>Subscription Value: </span>{this.state.company.subscriptionValue}</div>
                                    <div><span className={classes.label}>Subscription Remaining: </span>{this.state.company.subscriptionRemaining.toLocaleString()}</div>
                                    <div><span className={classes.label}>Subscription Expiry: </span>{this.state.company.subscriptionExpiry}</div>
                                </React.Fragment>
                            }
                            {this.state.company.subscriptionNote && <div><span className={classes.label}>Subscription Note: </span>{this.state.company.subscriptionNote}</div>}
                        </React.Fragment>
                    }
                </div>
                <div className={classes.plan}>
                    <h2>New Plan</h2>
                    <PlanSelector plan={this.state.company} onChange={this.handleChange}/>
                    {this.state.company.planTypeId===this.state.planTypeId && this.state.planTypeId !== 1 && <div><span className={classes.label}>New Expiry Date: </span>{moment().add(1,'year').format("YYYY-MM-DD")}</div>}
                    {this.state.company.planTypeId===this.state.planTypeId && this.state.planTypeId !== 1 && <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={this.addToPlan}>{"Add to Subscription"}</Button>}
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        onClick={this.setPlan}>{"Change Plan"}</Button>
                </div>
            </div>
        )
    }
}
 

export default withStyles(styles)(Plan);