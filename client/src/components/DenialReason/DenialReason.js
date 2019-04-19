import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import ApiCalls from '../../ApiCalls';  
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormValidation from '../../FormValidation';

const styles = theme => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit,
      width: 400,
    },
    button:{
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    modal: {
        zIndex: 9999,
        position: "fixed",
        top: 0,
        left: 0,
        width:"100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)"
    },
    modalMain: {
        width: "95%",
        maxWidth: "1000px",
        position: "fixed",
        background: "white",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        padding: "5px",
        boxShadow: "0px 0px 1px 1px #263c54"
    }
});
const errorText = [
    {
        stateName: "denialReasonId",
        errorText: "Please enter a description for the job posting"
    }
]
class DenialReason extends React.Component{ 
    constructor(props) {
        super(props);
		this.state = {
            error: null,
            denialReasonList: [],
            denialReasonId: null
        };
        this.formValidation = new FormValidation(this, )
    }
    componentDidMount = () => {
        ApiCalls.get("/api/autocomple/denialReason")
        .then((res)=>{
            if(res == null) return
            this.setState({denialReasonList: res.data.denialReasonList})
        }).catch(errors => {
            console.log(errors.response.data)
        })
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleClose = (event, value) => {
        this.props.onClose({response: event, value: value});
    };

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <Dialog 
                        fullWidth={false}
                        disableBackdropClick={true}
                        onClose={this.handleClose}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">Please Specify the reason for Denial</DialogTitle>
                    <DialogContent>
                        <FormControl className={classes.selectFormControl}>
                            <InputLabel htmlFor="denial-reason-helper">Denial Reason</InputLabel>
                            <Select
                                className={classes.textField}
                                onChange={this.handleChange}
                                required
                                input={<Input name="denialReason" id="denial-reason-helper" />}
                                value={this.state.denialReason}
                                inputProps={{
                                    id: 'denialReason',
                                }}
                            >
                                {this.state.reasonList.map((d, i)=>
                                    <MenuItem key={i} value={d.denial_reason_id}>{d.denial_reason_name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <Button
                            className={classes.button}
                            variant="contained"
                            onClick={()=>this.handleClose(0, null)}>Cancel</Button>
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="secondary"
                            onClick={()=>this.handleClose(1, this.state)}>Confirm</Button>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(DenialReason);
