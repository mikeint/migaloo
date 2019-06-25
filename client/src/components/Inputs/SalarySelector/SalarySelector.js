import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';

const styles = theme => ({
    root: {
      width: 200,
    },
    slider: {
      padding: '22px 0px',
    },
})
class SalarySelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Salary',
            onChange: props.onChange,
            salary: (props.required || false)?0:-1,
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        const change = this.state.error !== nextProps.error || this.state.helperText !== nextProps.helperText;
        if(change){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
        }
        if(nextProps.value != null && this.state.salary !== nextProps.value){
            this.setState({ salary: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }

    handleChange = (event, value) => {
        if(this.state.onChange){
            this.state.onChange({ salary: value })
        }
        this.setState({ salary: value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.label}: {`${this.state.salary}k+`}
                <Slider
                    classes={{ container: classes.slider }}
                    value={this.state.salary}
                    min={this.state.required?1:0}
                    max={350}
                    step={5}
                    onChange={this.handleChange}
                    // {...(this.state.error?{error:true, helperText:this.state.helperText}:{})}
                />
            </div>
        );
    }
};

export default withStyles(styles)(SalarySelector);  
