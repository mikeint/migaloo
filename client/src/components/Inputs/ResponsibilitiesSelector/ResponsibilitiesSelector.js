import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    textArea: {
        width: "100%"
    }
})
class ResponsibilitiesSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Responsibilities',
            onChange: props.onChange,
            responsibilities: '',
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
        if(nextProps.value != null && this.state.responsibilities !== nextProps.value){
            this.setState({ responsibilities: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }

    handleChange = (e) => {
        const responsibilities = e.target.value;
        if(this.state.onChange){
            this.state.onChange({ responsibilities: responsibilities });
        }
        this.setState({ responsibilities: responsibilities });
    }
    render(){   
        const { classes } = this.props;
        return (
            <TextField
                name="responsibilities"
                label={this.state.label}
                multiline={true}
                className={classes.textArea}
                placeholder="A list of expected responsibilities"
                value={this.state.responsibilities}
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

export default withStyles(styles)(ResponsibilitiesSelector);  
