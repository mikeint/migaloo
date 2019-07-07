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
const maxValue = 20;
class NumberOpeningsSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Number of Openings',
            onChange: props.onChange,
            openPositions: props.value || ((props.required || false)?1:0),
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
        if(nextProps.value != null && this.state.openPositions !== nextProps.value){
            this.setState({ openPositions: nextProps.value });
        }
        return change;
    }

    handleChange = (event, value) => {
        if(this.state.onChange){
            this.state.onChange({ openPositions: value })
        }
        this.setState({ openPositions: value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                {this.state.label}:  {this.state.openPositions===-1?'Unspecified':`${this.state.openPositions}${maxValue===this.state.openPositions?'+':''}`}
                <Slider
                    classes={{ container: classes.slider }}
                    value={this.state.openPositions}
                    min={this.state.required?1:0}
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
