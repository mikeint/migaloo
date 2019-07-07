import React from 'react';
import {get, cancel} from '../../../ApiCalls';  
import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { FormHelperText } from '@material-ui/core';

const styles = theme => ({
    root: {
      width: 250,
    },
    textField: {
        width: 200
    },
    selectFormControl:{
        marginBottom: 10
    },
    helperText:{
        margin: "8px 12px 0"
    },
    error: {
        color: "red"
    }
})
class JobTypeSelector extends React.Component{
    constructor(props) {
        super(props);
        const multiple = this.props.multiple || false
        this.state = {
            label: props.label || 'Job Type',
            multiple: multiple,
            jobTypeList: [],
            onChange: props.onChange,
            jobType: multiple?[]:-1,
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    loadData(){
        get('/api/autocomplete/jobType')
        .then((res) => {
            if(res && res.data.success) {
                this.setState({jobTypeList:res.data.jobTypeList});
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
        if(nextProps.value != null && JSON.stringify(this.state.jobType) !== JSON.stringify(nextProps.value)){
            if(this.state.multiple && !Array.isArray(nextProps.value))
                throw new Error('Value property must be a list if the prop multiple is specified.')
            this.setState({ jobType: nextProps.value });
        }
        if(this.state !== nextState)
            return true
        return change;
    }
 
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount() {
        this.loadData()
    }

    handleChange = (e) => {
        if(this.state.onChange){
            this.state.onChange({ jobType: e.target.value })
        }
        this.setState({ jobType: e.target.value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <FormControl 
                        className={classes.selectFormControl}
                        {...(this.state.error?{error:true}:{})}>
                    <InputLabel htmlFor="job-type-helper">{this.state.label}</InputLabel>
                    <Select
                        value={this.state.jobType}
                        className={classes.textField}
                        onChange={this.handleChange}
                        multiple={this.state.multiple}
                        input={<Input name="jobType" id="job-type-helper" />}
                        inputProps={{
                            id: 'jobType',
                            ...(this.state.error?{className:classes.error}:{})
                        }}
                    >
                        {this.state.multiple ? '' : <MenuItem value={-1}>
                            Unspecified
                        </MenuItem>}
                        {this.state.jobTypeList.map((d, i)=>
                            <MenuItem key={i} value={d.jobTypeId}>{d.jobTypeName}</MenuItem>
                        )}
                    </Select>
                    <FormHelperText className={classes.helperText}>{this.state.helperText}</FormHelperText>
                </FormControl>
            </div>
        );
    }
};

export default withStyles(styles)(JobTypeSelector);  
