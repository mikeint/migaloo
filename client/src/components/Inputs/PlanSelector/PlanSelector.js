import React from 'react';
import {get, cancel} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { FormControlLabel, RadioGroup, Radio, TextField } from '@material-ui/core';

const styles = theme => ({
    root: {
      
    },
    helperText:{
        margin: "8px 12px 0"
    },
    error: {
        color: "red"
    },
    radioButton:{
        padding: "0 24px 0 24px"
    }
})
class PlanSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Plan Type',
            plans: null,
            onChange: props.onChange,
            planTypeId: props.plan.planTypeId == null ? 1 : props.plan.planTypeId,
            subscriptionValue: props.plan.subscriptionValue || 0
        }
    }
    loadData(){
        get(`/api/autocomplete/plans`)
        .then((res)=>{
            if(res && res.data.success){
                this.setState({plans:res.data.plans})
            }
        })
        .catch(errors => 
            console.log(errors)
        )
    }
    shouldComponentUpdate(nextProps, nextState) {
        if(this.state !== nextState)
            return true
        const change = (this.state.planTypeId !== nextProps.plan.planTypeId && nextProps.plan.planTypeId != null) ||
            (this.state.subscriptionValue !== nextProps.plan.subscriptionValue && nextProps.plan.subscriptionValue != null);
        if(change){
            this.setState({ planTypeId: nextProps.plan.planTypeId, subscriptionValue: nextProps.plan.subscriptionValue });
        }
        return change;
    }
 
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount() {
        this.loadData()
    }

    handlePlanChange = (e) => {
        const planTypeId = parseInt(e.target.value, 10);
        const subscriptionValue = this.state.plans[planTypeId-1].valueDefault;
        if(this.state.onChange){
            this.state.onChange({ planTypeId: planTypeId, subscriptionValue: subscriptionValue });
        }
        this.setState({ planTypeId: planTypeId, subscriptionValue: subscriptionValue });
    }
    handleValueChange = (e) => {
        if(this.state.onChange){
            this.state.onChange({ planTypeId: this.state.planTypeId, subscriptionValue: e.target.value });
        }
        this.setState({ subscriptionValue: e.target.value });
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.plans && <React.Fragment>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <RadioGroup
                            aria-label="Plan Type"
                            name="plantype"
                            className={classes.group}
                            value={this.state.planTypeId.toString()}
                            onChange={this.handlePlanChange}
                        >
                            {
                                this.state.plans.map((d, i)=>
                                    <FormControlLabel
                                        key={i}
                                        value={d.planTypeId.toString()}
                                        control={<Radio classes={{root:classes.radioButton}}/>}
                                        label={d.planTypeName} />
                                )
                            }
                        </RadioGroup>
                    </FormControl>
                    <TextField
                        type="number"
                        label={this.state.plans[this.state.planTypeId-1].valueName}
                        value={this.state.subscriptionValue}
                        inputProps={{ min:"0", step:"any" }}
                        onChange={this.handleValueChange}/>
                </React.Fragment>}
            </div>
        );
    }
};

export default withStyles(styles)(PlanSelector);  
