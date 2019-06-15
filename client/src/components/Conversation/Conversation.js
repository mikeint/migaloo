import React, { Component } from "react"; 
import "./Conversation.css";  
import {get, post} from '../../ApiCalls';  
import CalendarToday from '@material-ui/icons/CalendarToday';
import Close from '@material-ui/icons/Close';
import MeetingPicker from "../MeetingPicker/MeetingPicker";
import IconButton from '@material-ui/core/IconButton';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme => ({
    rightBtn:{
        float: "right",
    }
})
class Conversation extends Component {

    constructor(props) {
        super(props);
        var extraState;
        if(props.loadByMessageSubjectId){
            extraState = {
                messageSubjectId: props.messageSubjectId,
                conversation: [],
                toId: null,
            }
        }else{
            const toId = (props.conversation.myId===props.conversation.userId1?props.conversation.userId2:props.conversation.userId1);
            extraState = {
                conversation: props.conversation,
                toId: toId
            }
        }
		this.state = {
            loadByMessageSubjectId: props.loadByMessageSubjectId,
            messageList: [],
            pageCount: -1,
            pageNumber: 1,
            showLoader: true,
            meetingDialogOpen: false,
            meetingCreate: {},
            ...extraState
        };
        this.message = React.createRef();
    }
    getConversationList = () => {
        return new Promise((resolve, reject)=>{
            get(`/api/message/get/${this.state.messageSubjectId}`)
            .then((res)=>{
                if(res && res.success){
                    const conversation = res.data.conversations[0]
                    const toId = (conversation.myId===conversation.userId1?conversation.userId2:conversation.userId1);
                    this.setState({ 
                        conversation: conversation,
                        toId:toId,
                        contactName: conversation.contactName }, resolve) 
                }
                else resolve()
            }).catch(errors => {
                console.log(errors)
                resolve()
            })
        })
    }
    componentDidMount = () => {
        if(this.state.loadByMessageSubjectId){
            this.getConversationList().then(()=>{
                this.getMessageList();
            });
        }else
            this.getMessageList();
    }
    getMessageList = () => {
        if(this.state.pageNumber <= this.state.pageCount || this.state.pageCount === -1){
            get(`/api/message/listConversationMessages/${this.state.conversation.messageSubjectId}/${this.state.pageNumber}`)
            .then((res)=>{
                if(res == null) return
                this.setState({showLoader:false})
                if(res.data && res.data.success){
                    const messages = res.data.messages;
                    var oldMessageList = this.state.messageList; // Get the previous page
                    var messageList = [];
                    var pageCount = (messages&&messages.length>0)?parseInt(messages[0].pageCount, 10):1
                    oldMessageList.pop() // Remove the load div from the previous page
                    messages.reverse().forEach((d, i)=>{
                        if(i === 0){ // Get contact name
                            if(this.state.pageNumber < pageCount)
                                messageList.unshift({type:'load'})
                            else
                                messageList.unshift({type:'loadnomore'})
                        }
                        if(d.messageTypeId === 1){ // Is a chat message
                            // Write the message text
                            messageList.unshift({type:'message', 
                            mine:!d.toMe,  // From me
                            text:d.message, 
                            date:d.created})
                        }else if(d.messageTypeId === 2){ // Is a meeting request
                            messageList.unshift({type:'calendar',
                                mine:!d.toMe, // From me
                                dateOffer:d.dateOfferStr,
                                length:d.minute_length >= 60?((d.minute_length/60).toString()+" hour"+(d.minute_length === 60?'':'s')):(d.minute_length+" minutes"),
                                responded: d.responded,
                                response:d.response,
                                messageId: d.messageId,
                                subject: d.meetingSubject,
                                date:d.created, locationType: d.locationTypeName})
                            if(d.response !== 0){
                                messageList.unshift({type:'calendar_response',
                                    mine:d.toMe, // Reponses are duplicates of the invite
                                    dateOffer:d.dateOfferStr,
                                    length:d.minute_length >= 60?((d.minute_length/60).toString()+" hour"+(d.minute_length === 60?'':'s')):(d.minute_length+" minutes"),
                                    response:d.response,
                                    subject: d.meetingSubject,
                                    date:d.created, locationType: d.locationTypeName})
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
                console.log(errors)
            })
        }
    }
    sendMessage = (meeting) => {
        var data = null
        var message = this.message.current.value;
        if(meeting === true){
            var startDateTime = this.state.meetingCreate.startDateTime;//this.state.meetingCreate.value;
            var minuteLength = this.state.meetingCreate.length;//this.state.meetingCreate.value;
            var location = this.state.meetingCreate.location;//this.state.meetingCreate.value;
            var subject = this.state.meetingCreate.subject;//this.state.meetingCreate.value;
            data = {
                messageSubjectId: this.state.conversation.messageSubjectId,
                toId: this.state.toId,
                messageType: 2,
                dateOffer: startDateTime,
                minuteLength: minuteLength,
                locationType: location,
                subject: subject
            }
        }else if(message && message !== ""){
            data = {
                messageSubjectId: this.state.conversation.messageSubjectId,
                toId: this.state.toId,
                messageType: 1,
                message:message
            }
        }
        if(data != null){
            post(`/api/message/create`, data)
            .then((res)=>{
                if(res == null) return
                // Reset messages and repull
                this.message.current.value = ""
                this.setState({
                    pageNumber: 1,
                    pageCount: -1,
                    messageList: []
                }, this.getMessageList)
            }).catch(errors => {
                console.log(errors)
            })
        }

    }
    setCalendarResponse = (row, response) => {
        var data = {
            messageSubjectId: this.state.conversation.messageSubjectId,
            response: response,
            messageId: row.messageId
        }
        post(`/api/message/setResponse`, data)
        .then((res)=>{
            if(res == null) return
            // Reset messages and repull
            this.setState({
                pageNumber: 1,
                pageCount: -1,
                messageList: []
            }, this.getMessageList)
        }).catch(errors => {
            console.log(errors)
        })
    }
    handleMeetingDialogOpen = () => {
        this.setState({
          meetingDialogOpen: true,
        });
    };

    handleMeetingDialogClose = (event) => {
        if(event.response === 1){
            this.setState({ meetingCreate: event.value, meetingDialogOpen: false }, ()=>this.sendMessage(true));
        }else
            this.setState({ meetingDialogOpen: false });
    };
    handleChatDialogClose = () => {
        this.props.onClose();
    };

    render(){  
        const { classes, onClose, ...other } = this.props;
        return (
            <React.Fragment>
                <div
                        maxWidth="xl"
                        fullWidth={true}
                        onClose={this.handleChatDialogClose}
                        aria-labelledby="dialog-title"
                        open={other.open}> 
                    <DialogTitle id="dialog-title">
                        <span>Conversation {this.state.conversation.contactName ? ` - ${this.state.conversation.contactName}, for ${this.state.conversation.subjectFirstName} ${this.state.conversation.subjectLastName}` : ''}</span>
                        <IconButton color="inherit" onClick={this.handleChatDialogClose} className={classes.rightBtn}>
                            <Close color="primary"/>
                        </IconButton>
                        <IconButton color="inherit" onClick={this.handleMeetingDialogOpen} className={classes.rightBtn}>
                            <CalendarToday color="primary"/>
                        </IconButton>
                    </DialogTitle>
                    <div className='conversationModal'>
                        <MeetingPicker
                            open={this.state.meetingDialogOpen}
                            onClose={this.handleMeetingDialogClose} />
                        <div className='chatWindow'>
                            {this.state.showLoader?<LinearProgress/>:''}
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
                                            <div>{d.subject}</div>
                                            <div>{d.locationType}</div>
                                            <div>{d.dateOffer}</div>
                                            <div>{d.length}</div>
                                            {d.response === 0 && !d.mine && <div className="responseContainer">
                                                <div className="responseButton" onClick={()=>this.setCalendarResponse(d, 1)}>Accept</div>
                                                <div className="responseButton" onClick={()=>this.setCalendarResponse(d, 2)}>Reject</div>
                                            </div>}
                                            <div className="date">{d.date}</div>
                                        </div>}
                                        {d.type === 'calendar_response' &&
                                        <div className={d.mine?"messageContainer mine":"messageContainer theirs"}>
                                            <div>{d.subject}</div>
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
                        <textarea className="chatInput" placeholder="Message" name='message' type='text' ref={this.message} />
                        <div className="sendButton" onClick={this.sendMessage.bind(this)}>Send</div> 
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(Conversation);