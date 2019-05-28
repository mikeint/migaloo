import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';

const styles = theme => ({
    root: {
      width: 400,
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
            numberOfInterviews: (props.required || false)?0:-1,
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
        if(nextProps.value != null && this.state.numberOfInterviews !== nextProps.value){
            this.setState({ numberOfInterviews: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }

    handleChange = (event, value) => {
        if(this.state.onChange){
            this.state.onChange({ numberOfInterviews: value })
        }
        this.setState({ numberOfInterviews: value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.label}:  {this.state.numberOfInterviews===-1?'Unspecified':`${this.state.numberOfInterviews}${maxValue===this.state.numberOfInterviews?'+':''}`}
                <Slider
                    classes={{ container: classes.slider }}
                    value={this.state.numberOfInterviews}
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
