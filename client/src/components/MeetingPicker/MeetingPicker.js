import React from 'react';
import './MeetingPicker.css';
import moment from 'moment'
import Calendar from 'react-calendar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import {get} from '../../ApiCalls';  
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

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
            error: null,
            locationList: [],
            subject: '',
            location: -1
        };
        this.onStartTimeChange = this.onStartTimeChange.bind(this);
        this.onEndTimeChange = this.onEndTimeChange.bind(this);
    }
    componentDidMount = () => {
        get("/api/message/locations")
        .then((res)=>{
            if(res == null) return
            this.setState({locationList: res.data.locationList})
        }).catch(errors => {
            console.log(errors)
        })
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
        this.setState({
            startTime:time.target.value,
            endTime:endTime
        }, this.validateTime);
    }
    onEndTimeChange(time) {
        const dur = moment.duration(moment(time.target.value, "HH:mm").diff(moment(this.state.startTime, "HH:mm")))
        this.setState({endTime:time.target.value, length: dur}, this.validateTime);
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
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
        if(value != null){
            value = {...value,
                length: value.length.hours()*60+value.length.minutes(),
                startDateTime:moment(moment(this.state.day).format("YYYY-MM-DD")+" "+this.state.startTime, "YYYY-MM-DD HH:mm")}
        }
        this.props.onClose({response: event, value: value});
    };

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <Dialog 
                        maxWidth="lg"
                        fullWidth={true}
                        disableBackdropClick={true}
                        onClose={this.handleClose}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">Create a Meeting</DialogTitle>
                    <DialogContent>
                        <form className="calendarContainer">
                            <TextField
                                name="subject"
                                label="Subject"
                                className={classes.textField}
                                required
                                onBlur={this.handleChange}
                                inputProps={{ maxLength: 500 }} 
                                margin="normal"
                            /><br/>
                            <FormControl className={classes.selectFormControl}>
                                <InputLabel htmlFor="location-helper">Location</InputLabel>
                                <Select
                                    className={classes.textField}
                                    onChange={this.handleChange}
                                    required
                                    input={<Input name="location" id="location-helper" />}
                                    value={this.state.location}
                                    inputProps={{
                                        id: 'location',
                                    }}
                                >
                                    {this.state.locationList.map((d, i)=>
                                        <MenuItem key={i} value={d.locationTypeId}>{d.locationTypeName}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
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
                                    value={this.state.startTime}
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
                                        onChange={this.onEndTimeChange}
                                        value={this.state.endTime}
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
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(MeetingPicker);
