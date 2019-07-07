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
        width: 200
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
            label: props.label || 'Reason for the Opening(s)',
            openReasonList: [{}],
            onChange: props.onChange,
            openReason: -1,
            openReasonExplain: '',
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
        if(this.state !== nextState)
            return true;
        const change = this.state.error !== nextProps.error || this.state.helperText !== nextProps.helperText;
        if(change){
            this.setState({ error: nextProps.error, helperText: nextProps.helperText });
        }
        if(nextProps.value != null && (this.state.openReason !== nextProps.value && this.state.openReasonExplain !== nextProps.value)){
            if(isNaN(nextProps.value))
                this.setState({ openReason: otherNumber, openReasonExplain: nextProps.value });
            else
                this.setState({ openReason: nextProps.value });
        }
        return change;
    }
 
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount() {
        this.loadData();
    }

    handleChange = (e) => {
        if(this.state.onChange){
            this.state.onChange({ openReason: e.target.value===otherNumber?null:e.target.value });
        }
        this.setState({ openReason: e.target.value });
    }
    handleChangeExplain = (e) => {
        const text = e.target.value.substring(0, 512);
        if(this.state.onChange){
            this.state.onChange({ openReasonExplain: text });
        }
        this.setState({ openReasonExplain: text });
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <FormControl 
                        className={classes.selectFormControl}
                        {...(this.state.error?{error:true}:{})}>
                    <InputLabel htmlFor="open-reason-helper">{this.state.label}</InputLabel>
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
                            <MenuItem key={i} value={d.openingReasonId}>{d.openingReasonName}</MenuItem>
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
                        label={`Reason Explanation (${512-this.state.openReasonExplain.length} Left)`}
                        className={classes.textArea}
                        value={this.state.openReasonExplain}
                        multiline={true}
                        placeholder="A reason for the opening"
                        rowsMax={10}
                        rows={4}
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
