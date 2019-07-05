import React from 'react';
import {get, cancel} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { FormLabel, FormControlLabel, RadioGroup, Radio, TextField } from '@material-ui/core';

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
            plans: [],
            onChange: props.onChange,
            planTypeId: props.plan.planTypeId == null ? 0 : props.plan.planTypeId - 1,
            subscriptionPercentage: props.plan.subscriptionPercentage,
            required: props.required || false,
            error: false,
            helperText: ''
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
        const change = this.state.error !== nextProps.error || this.state.helperText !== nextProps.helperText;
        if(change){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
        }
        if(nextProps.value != null && this.state.company !== nextProps.value){
            this.setState({ company: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }
 
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount() {
        this.loadData()
    }

    handlePlanChange = (e) => {
        if(this.state.onChange){
            this.state.onChange({ planTypeId: e.target.value, subscriptionPercentage: this.state.subscriptionPercentage })
        }
        this.setState({ planTypeId: e.target.value })
    }
    handlePercentageChange = (e) => {
        if(this.state.onChange){
            this.state.onChange({ planTypeId: this.state.planTypeId, subscriptionPercentage: e.target.value })
        }
        this.setState({ subscriptionPercentage: e.target.value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
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
                    label="Percentage"
                    inputProps={{ min:"0", step:"any" }}
                    onChange={this.handlePercentageChange}/>
            </div>
        );
    }
};

export default withStyles(styles)(PlanSelector);  
