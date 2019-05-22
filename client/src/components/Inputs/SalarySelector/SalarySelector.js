import React from 'react';
import {get, cancel} from '../../../ApiCalls';  
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
class SalarySelector extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            salaryList: [],
            onChange: props.onChange,
            salary: (props.required || false)?0:-1,
            required: props.required || false,
            error: false,
            helperText: ''
        }
    }
    loadData(){
        get('/api/autocomplete/salary')
        .then((res) => {
            if(res && res.data.success) {
                this.setState({salaryList:res.data.salaryList});
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
        if(nextProps.value != null && this.state.salary !== nextProps.value){
            this.setState({ salary: nextProps.value });
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

    handleChange = (event, value) => {
        if(this.state.onChange){
            this.state.onChange({ salary: value })
        }
        this.setState({ salary: value })
    }
    render(){   
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                Salary: {this.state.salary === -1||this.state.salaryList.length === 0?'Unspecified':this.state.salaryList[this.state.salary].salary_type_name}
                <Slider
                    classes={{ container: classes.slider }}
                    value={this.state.salary}
                    min={this.state.required?0:-1}
                    max={this.state.salaryList.length-1}
                    step={1}
                    onChange={this.handleChange}
                    // {...(this.state.error?{error:true, helperText:this.state.helperText}:{})}
                />
            </div>
        );
    }
};

export default withStyles(styles)(SalarySelector);  
