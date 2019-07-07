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
const maxValue = 65;
class ExperienceSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Experience',
            onChange: props.onChange,
            experience: (props.required || false)?0:-1,
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
        if(nextProps.value != null && this.state.experience !== nextProps.value){
            this.setState({ experience: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }

    handleChange = (event, value) => {
        if(this.state.onChange){
            this.state.onChange({ experience: value })
        }
        this.setState({ experience: value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.label}:  {this.state.experience===-1?'Unspecified':`${this.state.experience}${maxValue===this.state.experience?'+':''} years experience`}
                <Slider
                    classes={{ container: classes.slider }}
                    value={this.state.experience}
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

export default withStyles(styles)(ExperienceSelector);  
