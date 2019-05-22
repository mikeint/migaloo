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
      width: 300,
    },
    textField: {
        width: 400
    },
    selectFormControl:{
        marginBottom: 20
    },
    helperText:{
        margin: "8px 12px 0"
    }
})
class CompanySelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            companies: [{}],
            onChange: props.onChange,
            company: -1,
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    loadData(){
        get('/api/company/list')
        .then((res) => {
            if(res && res.data.success) {
                this.setState({companies:res.data.companies.map(d=>{return {id:d.company_id, name:d.company_name}})});
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
            this.state.onChange({ company: e.target.value })
        }
        this.setState({ company: e.target.value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <FormControl
                        className={classes.selectFormControl}
                        {...(this.state.error?{error:true}:{})}>
                    <InputLabel htmlFor="employer-helper">Employer</InputLabel>
                    <Select
                        value={this.state.company}
                        onChange={this.handleChange}
                        input={<Input name="employer" id="employer-helper" />}
                        inputProps={{
                            id: 'employer',
                        }}
                    >
                        <MenuItem value="">
                            Unspecified
                        </MenuItem>
                        {this.state.companies.map((d, i)=>
                            <MenuItem key={i} value={d.id}>{d.name}</MenuItem>
                        )}
                    </Select>
                    <FormHelperText className={classes.helperText}>{this.state.helperText}</FormHelperText>
                </FormControl>
            </div>
        );
    }
};

export default withStyles(styles)(CompanySelector);  
