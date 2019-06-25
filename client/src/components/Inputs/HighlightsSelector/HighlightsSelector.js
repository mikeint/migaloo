import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    textArea: {
        width: "100%"
    }
})
class HighlightsSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Highlights',
            onChange: props.onChange,
            highlights: '',
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        const change = this.state.error !== nextProps.error ||
                this.state.helperText !== nextProps.helperText;
        if(change){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
        }
        if(nextProps.value != null && this.state.highlights !== nextProps.value){
            this.setState({ highlights: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }

    handleChange = (e) => {
        const highlights = e.target.value;
        if(this.state.onChange){
            this.state.onChange({ highlights: highlights });
        }
        this.setState({ highlights: highlights });
    }
    render(){   
        const { classes } = this.props;
        return (
            <TextField
                name="highlights"
                label={this.state.label}
                multiline={true}
                className={classes.textArea}
                placeholder="Highlights that make the candidate special"
                value={this.state.highlights}
                rowsMax={10}
                rows={6}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                error={this.state.error}
                helperText={this.state.helperText}
            />
        );
    }
};

export default withStyles(styles)(HighlightsSelector);  
