import React from 'react';
import {get, cancel} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { FormHelperText } from '@material-ui/core';

const styles = theme => ({
    root: {
      width: "100%",
    },
    textField: {
        width: 400
    },
    textArea:{
        width: "100%",
    },
    selectFormControl:{
        marginBottom: 0
    },
    helperText:{
        margin: "8px 12px 0"
    },
    error:{
        color: "red"
    }
})
const otherNumber = 99999;
class OpenReasonSelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            openReasonList: [{}],
            onChange: props.onChange,
            openReason: -1,
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    loadData(){
        get('/api/autocomplete/openReason')
        .then((res) => {
            if(res && res.data.success) {
                this.setState({openReasonList:res.data.openReasonList});
            }
        })
        .catch(error => {
            console.log(error);
        });
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
 
    componentWillUnmount = () => {
        cancel();
    }
    componentWillMount() {
        this.loadData()
    }

    handleChange = (e) => {
        if(this.state.onChange){
            this.state.onChange({ openReason: e.target.value })
        }
        this.setState({ openReason: e.target.value })
    }
    handleChangeExplain = (e) => {
        if(this.state.onChange){
            this.state.onChange({ openReasonExplain: e.target.value })
        }
        this.setState({ openReasonExplain: otherNumber })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <FormControl 
                        className={classes.selectFormControl}
                        {...(this.state.error?{error:true}:{})}>
                    <InputLabel htmlFor="open-reason-helper">Reason for the Opening(s)</InputLabel>
                    <Select
                        value={this.state.openReason}
                        className={classes.textField}
                        onChange={this.handleChange}
                        input={<Input name="openReason" id="open-reason-helper" />}
                        inputProps={{
                            id: 'openReason',
                            ...(this.state.error?{className:classes.error}:{})
                        }}
                    >
                        <MenuItem value={-1}>
                            Unspecified
                        </MenuItem>
                        {this.state.openReasonList.map((d, i)=>
                            <MenuItem key={i} value={d.opening_reason_id}>{d.opening_reason_name}</MenuItem>
                        )}
                        <MenuItem value={otherNumber}>
                            Other (Please Explain)
                        </MenuItem>
                    </Select>
                    <FormHelperText className={classes.helperText}>{this.state.helperText}</FormHelperText>
                </FormControl>
                {this.state.openReason === otherNumber &&
                    <TextField
                        name="textReason"
                        label="Reason Explanation"
                        className={classes.textArea}
                        multiline={true}
                        placeholder="A reason for the opening"
                        rowsMax={10}
                        rows={4}
                        required
                        onChange={this.handleChangeExplain}
                        margin="normal"
                        variant="outlined"
                        error={this.state.error}
                        helperText={this.state.helperText}
                    />
                }
            </div>
        );
    }
};

export default withStyles(styles)(OpenReasonSelector);  
