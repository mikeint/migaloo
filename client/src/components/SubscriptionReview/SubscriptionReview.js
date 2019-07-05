import React from 'react';
import {get} from '../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';  
import { LinearProgress } from '@material-ui/core';

const styles = theme => ({
    center:{
        textAlign:"center"
    },
    label:{
        fontWeight: "bold"
    }
});
class SubscriptionReview extends React.Component{
    constructor(props) {
        super(props);
        if(props.numberOfOpenings == null)
            throw new Error("Missing Field numberOfOpenings");
        if(props.salary == null)
            throw new Error("Missing Field salary");
        // Initial state
        this.state = { 
            salary: props.salary,
            numberOfOpenings: props.numberOfOpenings,
            planInfo: {}
        };
    }
    componentDidMount = () => {
        get('/api/employer/getPlanInformation')
        .then((res)=>{
            if(res && res.data.success){
                this.setState({planInfo: res.data.plan})
            }
        }).catch((e)=>{})
    }
    render(){
        const { classes } = this.props;
        return (
            <React.Fragment>
                {
                    this.state.planInfo.planTypeId==null?
                    <LinearProgress/>
                    :
                    <React.Fragment>
                    <div><span className={classes.label}>Plan: </span>{this.state.planInfo.planTypeName}</div>
                    <div><span className={classes.label}>Number of Openings: </span>{this.state.numberOfOpenings}</div>
                    <div><span className={classes.label}>Salary: </span>{this.state.salary}k</div>
                    {
                        (this.state.planInfo.planTypeId===1? // On Demand
                        <React.Fragment>
                            <div><span className={classes.label}>Subscription Percentage: </span>{Math.round(this.state.planInfo.subscriptionPercentage*10000)/100}%</div>
                            {/* <div>{this.state.numberOfOpenings} &times; {this.state.salary}k &times; {this.state.planInfo.subscriptionPercentage}% = {this.state.numberOfOpenings * this.state.salary * this.state.planInfo.subscriptionPercentage}k</div> */}
                            <div><span className={classes.label}>You will owe: </span>{this.state.numberOfOpenings * this.state.salary * this.state.planInfo.subscriptionPercentage}k</div>
                        </React.Fragment>
                        : // Salary based plan
                        (this.state.planInfo.planTypeId===2?
                        <React.Fragment>
                            <div><span className={classes.label}>Remaining Salary Pool: </span>{this.state.numberOfOpenings * this.state.salary * this.state.planInfo.subscriptionPercentage}k</div>
                        </React.Fragment>
                        : // Position based plan
                        <React.Fragment>
                            <div><span className={classes.label}>Remaining Positions in subscription: </span>{this.state.numberOfOpenings * this.state.salary * this.state.planInfo.subscriptionPercentage}k</div>
                        </React.Fragment>
                        )
                        )
                    }
                    <div><span className={classes.label}>Note: </span>The salary and number of positions will be adjusted based on the actual amount of candidates placed and the agreed upon salary.</div>
                    </React.Fragment>
                }
            </React.Fragment>
        )
    }
};
export default withStyles(styles)(SubscriptionReview);