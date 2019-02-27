import React, { Component } from "react"; 
import "./Conversation.css"; 
import AuthFunctions from '../../../AuthFunctions'; 
import Loader from '../../Loader/Loader'; 
import axios from 'axios';

class Conversation extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversation: props.conversation,
            messageList: [],
            contactName: '',
            pageCount: -1,
            pageNumber: 1,
            lastMessage: null,
            toId: null,
            showLoader: true
        };
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
    }
    componentWillMount = () => {
        this.getMessageList();
    }
    getMessageList = () => {
        if(this.state.pageNumber <= this.state.pageCount || this.state.pageCount === -1){
            axios.get(`/api/message/listConversationMessages/${this.state.conversation.user_id_1}/${this.state.conversation.user_id_2}/${this.state.conversation.subject_user_id}/${this.state.pageNumber}`, this.axiosConfig)
            .then((res)=>{
                this.setState({showLoader:false})
                if(res.data && res.data.length > 0){
                    if(this.state.lastMessage == null){
                        var firstMessage = res.data[0];
                        var contactName = firstMessage.toMe?(
                                firstMessage.to_id===firstMessage.user_id_1?
                                firstMessage.user_2_type_name+" "+(firstMessage.user_2_company_name?firstMessage.user_2_company_name:(firstMessage.user_2_first_name+" "+firstMessage.user_2_last_name)):
                                firstMessage.user_1_type_name+" "+(firstMessage.user_1_company_name?firstMessage.user_1_company_name:(firstMessage.user_1_first_name+" "+firstMessage.user_1_last_name))
                            ):(
                                firstMessage.to_id!==firstMessage.user_id_1?
                                firstMessage.user_2_type_name+" "+(firstMessage.user_2_company_name?firstMessage.user_2_company_name:(firstMessage.user_2_first_name+" "+firstMessage.user_2_last_name)):
                                firstMessage.user_1_type_name+" "+(firstMessage.user_1_company_name?firstMessage.user_1_company_name:(firstMessage.user_1_first_name+" "+firstMessage.user_1_last_name))
                            );
                        this.setState({
                            lastMessage: firstMessage,
                            contactName: contactName,
                            toId: !firstMessage.toMe?firstMessage.to_id:(firstMessage.to_id===firstMessage.user_id_1?firstMessage.user_id_2:firstMessage.user_id_1),
                        })
                    }
                    var subjectList = []; // Temp variable
                    var oldMessageList = this.state.messageList; // Get the previous page
                    var messageList = [];
                    var pageCount = (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1
                    oldMessageList.pop() // Remove the load button from the previous page
                    // Check if the subject exists in the above message
                    if(oldMessageList.length > 0 && oldMessageList[oldMessageList.length - 1].text === res.data[0].subject)
                        oldMessageList.pop() // If so remove it from the previous page
                    res.data.reverse().forEach((d, i)=>{
                        if(i === 0){ // Get contact name
    
                            if(this.state.pageNumber < pageCount)
                                messageList.unshift({type:'load'})
                            else
                                messageList.unshift({type:'loadnomore'})
    
                        }
                        if(!subjectList.includes(d.subject)){ // Write a subject line if its a new subject
                            subjectList.unshift(d.subject)
                            messageList.unshift({type:'subject', text:d.subject, date:d.created})
                        }
                        // Write the message text
                        messageList.unshift({type:'message', mine:!d.toMe, text:d.message, date:d.created})
                    })
                    this.setState({ 
                        messageList: oldMessageList.concat(messageList),
                        pageNumber: this.state.pageNumber + 1,
                        pageCount: pageCount
                    }) 
                }
            }).catch(errors => {
                this.setState({showLoader:false})
                console.log(errors.response.data)
            })
        }
    }
    sendMessage = () => {
        var message = this.message.value;
        if(message && message !== ""){
            var data = {
                subject: this.state.lastMessage.subject,
                message: message,
                postId: this.state.lastMessage.post_id,
                subjectUserId: this.state.lastMessage.subject_user_id,
                toId: this.state.toId,
            }
            axios.post(`/api/message/create`, data, this.axiosConfig)
            .then((res)=>{
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
    render() {
  
        return (
            <React.Fragment>
            <div className='conversationModal'>
                <div className='modal displayBlock'>
                    {
                        <section className='modalMain'>
                            <div className='contactHeader'>{this.state.contactName}</div>
                            <div className='chatWindow'>
                                {this.state.showLoader?<Loader/>:''}
                                {
                                    this.state.messageList.map((d, i)=>{
                                        return <div className="messageRow" key={i}>
                                            {d.type === 'load'?<div className="loadMore more" onClick={this.getMessageList.bind(this)}>
                                                Load More
                                            </div>:''}
                                            {d.type === 'loadnomore'?<div className="loadMore">
                                                No More Messages
                                            </div>:''}
                                            {d.type === 'subject'?<div className="heading">
                                                {d.text}
                                                <hr/>
                                            </div>:''}
                                            {d.type === 'message'?
                                            <div className={d.mine?"messageContainer mine":"messageContainer theirs"}>
                                                <div className="message">{d.text}</div>
                                                <div className="date">{d.date}</div>
                                            </div>:''}
                                        </div>
                                    })
                                }
                            </div>
                            <textarea className="chatInput" placeholder="Message" name='message' type='text' ref={(c) => this.message = c} onChange={this.handleChange} />
                            <div className="sendButton" onClick={this.sendMessage.bind(this)}>Send</div>
                            <div className="rowButton" onClick={this.props.handleClose}>Close</div>
                        </section>
                    }
                </div>
            </div>
            </React.Fragment>
        );
    }
}
 
export default Conversation;