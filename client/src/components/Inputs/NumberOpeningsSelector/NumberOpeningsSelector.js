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
const maxValue = 20;
class NumberOpeningsSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            onChange: props.onChange,
            numberOpenings: (props.required || false)?0:-1,
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
        if(this.state !== nextState)
            return true
        return change;
    }

    handleChange = (event, value) => {
        if(this.state.onChange){
            this.state.onChange({ numberOpenings: value })
        }
        this.setState({ numberOpenings: value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                Number of Openings:  {this.state.numberOpenings===-1?'Unspecified':`${this.state.numberOpenings}${maxValue===this.state.numberOpenings?'+':''}`}
                <Slider
                    classes={{ container: classes.slider }}
                    value={this.state.numberOpenings}
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

export default withStyles(styles)(NumberOpeningsSelector);  
