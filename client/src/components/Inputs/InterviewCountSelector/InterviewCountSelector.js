import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';

const styles = theme => ({
    root: {
      width: 250,
    },
    slider: {
      padding: '22px 0px',
    },
})
const maxValue = 50;
class InterviewCountSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Number of Candidates to Interview',
            onChange: props.onChange,
            interviewCount: props.value || ((props.required || false)?0:-1),
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if(this.state !== nextState)
            return true
        const change = this.state.error !== nextProps.error || this.state.helperText !== nextProps.helperText;
        if(change){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
        }
        if(nextProps.value != null && this.state.interviewCount !== nextProps.value){
            this.setState({ interviewCount: nextProps.value });
        }
        return change;
    }

    handleChange = (event, value) => {
        if(this.state.onChange){
            this.state.onChange({ interviewCount: value })
        }
        this.setState({ interviewCount: value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.label}:  {this.state.interviewCount===-1?'Unspecified':`${this.state.interviewCount}${maxValue===this.state.interviewCount?'+':''}`}
                <Slider
                    classes={{ container: classes.slider }}
                    value={this.state.interviewCount}
                    min={this.state.required?0:-1}
                    max={maxValue}
                    step={1}
                    onChange={this.handleChange}
                    // {...(this.state.error?{error:true, helperText:this.state.helperText}:{})}
                />
            </div>
        );
    }
};

export default withStyles(styles)(InterviewCountSelector);  
