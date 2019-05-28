import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    textField: {
        width: "100%"
    }
})
class TitleSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Title',
            onChange: props.onChange,
            title: '',
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
        if(nextProps.value != null && this.state.title !== nextProps.value){
            this.setState({ title: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }

    handleChange = (e) => {
        const title = e.target.value.substring(0, 256);
        if(this.state.onChange){
            this.state.onChange({ title: title });
        }
        this.setState({ title: title });
    }
    render(){   
        const { classes } = this.props;
        return (
            <TextField
                name="title"
                label={`${this.state.label} (${256-this.state.title.length} Left)`}
                className={classes.textField}
                value={this.state.title}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                error={this.state.error}
                helperText={this.state.helperText}
            />
        );
    }
};

export default withStyles(styles)(TitleSelector);  
