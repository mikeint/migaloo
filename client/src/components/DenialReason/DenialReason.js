import React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import {get, getWithParams, post, cancel, getNewAuthToken} from '../../ApiCalls';  
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormValidation from '../../FormValidation';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';

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
    textArea:{
        width: "100%"
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
        errorText: "Please enter a reason for the denial"
    },
    {
        stateName: "denialComment",
        errorText: "Please enter a comment about the denial"
    }
]
class DenialReason extends React.Component{ 
    constructor(props) {
        super(props);
		this.state = {
            error: null,
            denialReasonList: [],
            denialReasonId: "",
            denialComment:"",
            errors: {}
        };
        this.formValidation = new FormValidation(this, errorText)
    }
    componentDidMount = () => {
        get("/api/autocomplete/denialReason")
        .then((res)=>{
            if(res == null) return
            this.setState({denialReasonList: res.data.denialReasonList})
        }).catch(errors => {
            console.log(errors.response.data)
        })
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value }, this.formValidation.shouldRevalidate)
    }
    inputChange = (e) => {
        const denialComment = e.target.value;
        this.setState({denialComment: denialComment}, this.formValidation.shouldRevalidate);
    };

    handleClose = (event, value) => {
        if((event === 1 && this.formValidation.isValid()) || event === 0){
            this.props.onClose({response: event, value: value});
        }
    };

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <Dialog 
                        fullWidth={false}
                        width="l"
                        disableBackdropClick={true}
                        onClose={this.handleClose}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">Please Specify the reason for Denial</DialogTitle>
                    <DialogContent>
                        <FormControl className={classes.selectFormControl}
                                    {...(this.formValidation.hasError("denialReasonId").error?{error:true}:{})}>
                            <InputLabel htmlFor="denial-reason-helper">Denial Reason</InputLabel>
                            <Select
                                className={classes.textField}
                                onChange={this.handleChange}
                                required
                                input={<Input name="denialReasonId" id="denial-reason-helper" />}
                                value={this.state.denialReasonId}
                                inputProps={{
                                    id: 'denialReasonId',
                                }}
                            >
                                {this.state.denialReasonList.map((d, i)=>
                                    <MenuItem key={i} value={d.denial_reason_id}>{d.denial_reason_text}</MenuItem>
                                )}
                            </Select>
                            <FormHelperText>{this.formValidation.hasError("denialReasonId").helperText}</FormHelperText>
                        </FormControl>
                        <br/>
                        <TextField
                            className={classes.textArea}
                            inputRef={this.searchRef}
                            defaultValue={""}
                            multiline
                            rowsMax={7}
                            rows={2}
                            label="Comment"
                            margin="normal"
                            variant="outlined"
                            inputProps={{
                                'aria-label': 'Comment',
                            }}
                            onChange={this.inputChange.bind(this)}
                            {...this.formValidation.hasError("denialComment")}
                        />
                        <br/>
                        <div>
                            <Button
                                className={classes.button}
                                variant="contained"
                                onClick={()=>this.handleClose(0, null)}>Cancel</Button>
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                onClick={()=>this.handleClose(1, this.state)}>Confirm</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(DenialReason);
