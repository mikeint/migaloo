import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    textArea: {
        width: "100%"
    }
})
class RequirementsSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            label: props.label || 'Requirements',
            onChange: props.onChange,
            requirements: props.value || '',
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if(this.state !== nextState)
            return true;
        const change = this.state.error !== nextProps.error ||
                this.state.helperText !== nextProps.helperText;
        if(change){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
        }
        if(nextProps.value != null && this.state.requirements !== nextProps.value){
            this.setState({ requirements: nextProps.value });
        }
        return change;
    }

    handleChange = (e) => {
        const requirements = e.target.value;
        if(this.state.onChange){
            this.state.onChange({ requirements: requirements });
        }
        this.setState({ requirements: requirements });
    }
    render(){   
        const { classes } = this.props;
        return (
            <TextField
                name="requirements"
                label={this.state.label}
                multiline={true}
                className={classes.textArea}
                placeholder="A list of requirements"
                value={this.state.requirements}
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

export default withStyles(styles)(RequirementsSelector);  
