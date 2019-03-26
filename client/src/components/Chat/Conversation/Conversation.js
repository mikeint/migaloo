import React, { Component } from "react"; 
import "./Conversation.css"; 
import Loader from '../../Loader/Loader'; 
import ApiCalls from '../../../ApiCalls';  
import CalendarToday from '@material-ui/icons/CalendarToday';
import Close from '@material-ui/icons/Close';
import MeetingPicker from "../../MeetingPicker/MeetingPicker";
import IconButton from '@material-ui/core/IconButton';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    rightBtn:{
        float: "right",
    }
})
class Conversation extends Component {

    constructor(props) {
        super(props);
        var toId = !props.conversation.toMe?props.conversation.to_id:(props.conversation.to_id===props.conversation.user_id_1?props.conversation.user_id_2:props.conversation.user_id_1);
		this.state = {
            conversation: props.conversation,
            messageList: [],
            contactName: props.conversation.contactName,
            pageCount: -1,
            pageNumber: 1,
            toId: toId,
            showLoader: true,
            meetingDialogOpen: false
        };
    }
    componentDidMount = () => {
        this.getMessageList();
    }
    getMessageList = () => {
        if(this.state.pageNumber <= this.state.pageCount || this.state.pageCount === -1){
            ApiCalls.get(`/api/message/listConversationMessages/${this.state.conversation.message_subject_id}/${this.state.pageNumber}`)
            .then((res)=>{
                if(res == null) return
                this.setState({showLoader:false})
                if(res.data && res.data.length > 0){
                    var oldMessageList = this.state.messageList; // Get the previous page
                    var messageList = [];
                    var pageCount = (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1
                    oldMessageList.pop() // Remove the load div from the previous page
                    res.data.reverse().forEach((d, i)=>{
                        if(i === 0){ // Get contact name
                            if(this.state.pageNumber < pageCount)
                                messageList.unshift({type:'load'})
                            else
                                messageList.unshift({type:'loadnomore'})
                        }
                        if(d.message_type_id === 1){ // Is a chat message
                            // Write the message text
                            messageList.unshift({type:'message', mine:!d.toMe, text:d.message, date:d.created})
                        }else if(d.message_type_id === 2){ // Is a meeting request
                            messageList.unshift({type:'calendar', mine:!d.toMe, dateOffer:d.date_offer_str,
                                length:d.minute_length >= 60?((d.minute_length/60).toString()+" hour"+(d.minute_length === 60?'':'s')):(d.minute_length+" minutes"),
                                responded: d.responded,
                                response:d.response,
                                messageId: d.message_id,
                                date:d.created, locationType: d.location_type_name})
                            if(d.response !== 0){
                                messageList.unshift({type:'calendar_response', mine:d.toMe, dateOffer:d.date_offer_str,
                                    length:d.minute_length >= 60?((d.minute_length/60).toString()+" hour"+(d.minute_length === 60?'':'s')):(d.minute_length+" minutes"),
                                    response:d.response,
                                    date:d.created, locationType: d.location_type_name})
                            }
                        }
                    })
                    this.setState({ 
                        messageList: oldMessageList.concat(messageList),
                        pageNumber: this.state.pageNumber + 1,
                        pageCount: pageCount
                    }) 
                }else
                    this.setState({ 
                        messageList: [{type:'loadnomore'}]
                    })
            }).catch(errors => {
                this.setState({showLoader:false})
                console.log(errors.response.data)
            })
        }
    }
    sendMessage = () => {
        var message = this.message.value;
        var dateOffer = null;//this.dateOffer.value;
        var minuteLength = null;//this.dateOffer.value;
        if((message && message !== "") || dateOffer){
            var data = {
                messageSubjectId: this.state.conversation.message_subject_id,
                toId: this.state.toId,
                messageType: this.state.conversation.message_type_id,
                message:message,
                dateOffer:dateOffer,
                minuteLength: minuteLength
            }
            ApiCalls.post(`/api/message/create`, data)
            .then((res)=>{
                if(res == null) return
                // Reset messages and repull
                this.message.value = ""
                this.setState({
                    pageNumber: 1,
                    pageCount: -1,
                    messageList: []
                }, this.getMessageList)
            }).catch(errors => {
                console.log(errors.response.data)
            })
        }
    }
    setCalendarResponse = (row, response) => {
        var data = {
            messageSubjectId: this.state.conversation.message_subject_id,
            response: response,
            messageId: row.messageId
        }
        ApiCalls.post(`/api/message/setResponse`, data)
        .then((res)=>{
            if(res == null) return
            // Reset messages and repull
            this.setState({
                pageNumber: 1,
                pageCount: -1,
                messageList: []
            }, this.getMessageList)
        }).catch(errors => {
            console.log(errors.response.data)
        })
    }
    handleMeetingDialogOpen = () => {
        this.setState({
          meetingDialogOpen: true,
        });
    };

    handleMeetingDialogClose = (event) => {
        if(event.response === 1)
            this.setState({ meetingTime: event.value, meetingDialogOpen: false });
        else
            this.setState({ meetingDialogOpen: false });
    };
    handleChatDialogClose = () => {
        this.props.onClose();
    };

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <Dialog
                        maxWidth="xl"
                        fullWidth={true}
                        onClose={this.handleChatDialogClose}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">
                        <span>Conversation - {this.state.contactName + " - " + this.state.conversation.subject_first_name+" "+this.state.conversation.subject_last_name}</span>
                        <IconButton color="inherit" onClick={this.handleChatDialogClose} className={classes.rightBtn}>
                            <Close color="primary"/>
                        </IconButton>
                        <IconButton color="inherit" onClick={this.handleMeetingDialogOpen} className={classes.rightBtn}>
                            <CalendarToday color="primary"/>
                        </IconButton>
                    </DialogTitle>
                    <div className='conversationModal'>
                        {/* <div className='contactHeader2'>{this.state.conversation.subject}</div> */}
                        <MeetingPicker
                            open={this.state.meetingDialogOpen}
                            onClose={this.handleMeetingDialogClose} />
                        <div className='chatWindow'>
                            {this.state.showLoader?<Loader/>:''}
                            {
                                this.state.messageList.map((d, i)=>{
                                    return <div className={d.mine?"messageRow mine":"messageRow theirs"} key={i}>
                                        {d.type === 'load'?<div className="loadMore more" onClick={this.getMessageList.bind(this)}>
                                            Load More
                                        </div>:''}
                                        {d.type === 'loadnomore'?<div className="loadMore">
                                            No More Messages
                                        </div>:''}
                                        {d.type === 'calendar' &&
                                        <div className={d.mine?"messageContainer mine":"messageContainer theirs"}>
                                            <div>{d.locationType}</div>
                                            <div>{d.dateOffer}</div>
                                            <div>{d.length}</div>
                                            {d.response === 0 && <div className="responseContainer">
                                                <div className="responseButton" onClick={()=>this.setCalendarResponse(d, 1)}>Accept</div>
                                                <div className="responseButton" onClick={()=>this.setCalendarResponse(d, 2)}>Reject</div>
                                            </div>}
                                            <div className="date">{d.date}</div>
                                        </div>}
                                        {d.type === 'calendar_response' &&
                                        <div className={d.mine?"messageContainer mine":"messageContainer theirs"}>
                                            <div>
                                                {d.locationType} Meeting has been {d.response === 1?"Accepted":"Rejected"}
                                            </div>
                                            {d.response === 1 && <div>
                                                At {d.dateOffer} for {d.length}
                                            </div>}
                                        </div>}
                                        {d.type === 'message' &&
                                        <div className={d.mine?"messageContainer mine":"messageContainer theirs"}>
                                            <div className="message">{d.text}</div>
                                            <div className="date">{d.date}</div>
                                        </div>}
                                    </div>
                                })
                            }
                        </div>
                        <textarea className="chatInput" placeholder="Message" name='message' type='text' ref={(c) => this.message = c} onChange={this.handleChange} />
                        <div className="sendButton" onClick={this.sendMessage.bind(this)}>Send</div> 
                    </div>
                </Dialog>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Conversation);