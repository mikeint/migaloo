import React from 'react';
import './MeetingPicker.css';
import moment from 'moment'
import Calendar from 'react-calendar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

const styles = theme => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
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
class MeetingPicker extends React.Component{ 
    constructor(props) {
        super(props);
        const currentTime = moment();
        var minute = currentTime.minutes();
        currentTime.add(15-(minute % 15), "minutes")
		this.state = {
            day: new Date(),
            startTime: currentTime.format("HH:mm"),
            endTime: currentTime.add(30, 'minutes').format("HH:mm"),
            length: moment.duration(30, 'minutes'),
            error: null
        };
        this.onStartTimeChange = this.onStartTimeChange.bind(this);
        this.onEndTimeChange = this.onEndTimeChange.bind(this);
        this.inputStartDate = React.createRef();
        this.inputEndDate = React.createRef();
    }
    validateTime(){
        const dayStr = moment(this.state.day).format("YYYY-MM-DD")
        const inFuture = moment(dayStr+" "+this.state.startTime, "YYYY-MM-DD HH:mm").diff(moment()) >= 0;
        const endTimeAfter = moment(dayStr+" "+this.state.startTime, "YYYY-MM-DD HH:mm").diff(moment(dayStr+" "+this.state.endTime, "YYYY-MM-DD HH:mm")) < 0;
        if(!endTimeAfter){
            this.setState({"error": "End Date must be after the start date"});
        } else if(!inFuture){
            this.setState({"error": "Date must be in the future"});
        } else if(this.state.length.day > 0){
            this.setState({"error": "Length cannot be more then one day"});
        } else if(this.state.length.minutes()+this.state.length.hours() === 0){
            this.setState({"error": "Meeting length must be non-zero"});
        } else if(this.state.error != null) {
            this.setState({"error": null});
        }
    }
    onStartTimeChange(time) {
        const endTime = moment(time.target.value, "HH:mm").add(this.state.length, "minutes").format("HH:mm");
        this.inputEndDate.current.value = endTime;
        this.setState({
            startTime:time.target.value,
            endTime:endTime
        }, this.validateTime);
    }
    onEndTimeChange(time) {
        const dur = moment.duration(moment(time.target.value, "HH:mm").diff(moment(this.state.startTime, "HH:mm")))
        this.setState({endTime:time.target.value, length: dur}, this.validateTime);
    }
    fullHumanize(duration){
        const hour = duration.hours();
        const minute = duration.minutes();
        var ret = [];
        if(hour === 1)
            ret.push(hour + " hour");
        else if(hour > 1)
            ret.push(hour + " hours");
        if(minute === 1)
            ret.push(minute + " minute");
        else if(minute > 1)
            ret.push(minute + " minutes");
                    
        return ret.join(" ");
    }
    handleClose = (event, value) => {
        this.props.onClose({response: event, value: value});
    };

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <Dialog 
                        maxWidth="lg"
                        fullWidth={true}
                        onClose={this.handleClose}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">Create a Meeting</DialogTitle>
                    <div>
                        <form className="calendarContainer">
                            <TextField
                                id="subject"
                                label="Subject"
                                className={classes.textField}
                                value={this.state.subject}
                                required
                                onChange={this.handleChange}
                                margin="normal"
                            />
                            <Calendar
                                onChange={(v)=>this.setState({day:v}, this.validateTime)}
                                minDate={new Date()}
                                minDetail={"year"}
                                prev2Label={null}
                                next2Label={null}
                            />
                            <div className="timeInputsContainer">
                                <div className="timeInput"> 
                                <TextField
                                    label="Start Time"
                                    type="time"
                                    defaultValue={this.state.startTime}
                                    ref={this.inputStartDate}
                                    onChange={this.onStartTimeChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 900, // 5 min
                                    }}
                                /></div>
                                <div className="timeInput">
                                    <TextField
                                        label="End Time"
                                        type="time"
                                        defaultValue={this.state.endTime}
                                        onChange={this.onEndTimeChange}
                                        ref={this.inputEndDate}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        inputProps={{
                                            step: 900, // 5 min
                                        }}
                                    /></div>    
                            </div>
                            {this.state.error != null && <div className="error">{this.state.error}</div>}
                            {this.state.error == null && <div>Length: {this.fullHumanize(this.state.length)}</div>}
                        </form>
                        <Button
                            className={classes.button}
                            variant="contained"
                            onClick={()=>this.handleClose(0, null)}>Cancel</Button>
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="secondary"
                            onClick={()=>this.handleClose(1, this.state)}>Create</Button>
                    </div>
                </Dialog>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(MeetingPicker);
