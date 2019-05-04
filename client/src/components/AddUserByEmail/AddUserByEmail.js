import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import React, { Component } from "react";
import { TextField } from '@material-ui/core';

const styles = theme => ({
    rightBtn:{
        float: "right",
    },
    button: {
        margin: "auto",
        width: "150px"
    },
    buttonContainer:{
        display: "flex"
    },
    input:{
        width:400
    }
})
class GetAccountManager extends Component {

    constructor(props) {
        super(props);
		this.state = {
            search:[]
        };
    }
    componentDidMount = () => {

    }
    handleDialogCancel = () => {
        this.props.onClose();
    };
    handleDialogSelect = () => {
        this.props.onClose(this.state.search);
    };
    inputChange = (e) => {
        const search = e.target.value;
        this.setState({search: search.split(" ").map(d=>d.trim())});
    };

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <Dialog
                        fullWidth={false}
                        width="l"
                        disableBackdropClick={true}
                        onClose={this.handleDialogCancel}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">
                        <span>Add Users(s)</span>
                        <IconButton color="inherit" onClick={this.handleDialogCancel} className={classes.rightBtn}>
                            <Close color="primary"/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            placeholder="Emails (Comma Seperated)"
                            className={classes.input}
                            defaultValue={""}
                            multiline
                            rowsMax={7}
                            rows={2}
                            label="Emails"
                            margin="normal"
                            variant="outlined"
                            inputProps={{
                                'aria-label': 'Emails',
                            }}
                            onChange={this.inputChange.bind(this)}
                        />
                        <div 
                            className={classes.buttonContainer}>
                            <Button 
                                color="primary"
                                variant="contained"
                                className={classes.button}
                                onClick={this.handleDialogCancel.bind(this)}>Cancel</Button> 
                            <Button 
                                color="primary"
                                variant="contained"
                                className={classes.button}
                                onClick={this.handleDialogSelect.bind(this)}>Add Users</Button> 
                        </div>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(GetAccountManager);