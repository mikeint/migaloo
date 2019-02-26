import React, { Component } from "react"; 
import "./Conversation.css"; 
import AuthFunctions from '../../../AuthFunctions'; 
import axios from 'axios';

class Conversation extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversation: props.conversation,
            messageList: [],
            contactName: '',
            pageCount: 0
        };
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        console.log(this.state.conversation)
    }
    componentWillMount = () => {
        this.getMessageList();
    }
    getMessageList = () => {
        axios.get(`/api/message/listConversationMessages/${this.state.conversation.user_id_1}/${this.state.conversation.user_id_2}/${this.state.conversation.subject_user_id}`, this.axiosConfig)
        .then((res)=>{
            var subjectList = []; // Temp variable
            var messageList = [];
            var contactName = '';
            res.data.forEach((d, i)=>{
                if(i === 0){ // Get contact name
                    if(d.toMe)
                        contactName = d.user_type_name+" "+(d.user_1_company_name?d.user_1_company_name:(d.user_1_first_name+" "+d.user_1_last_name));
                    else
                        contactName = d.user_type_name+" "+(d.user_2_company_name?d.user_2_company_name:(d.user_2_first_name+" "+d.user_2_last_name));
                }
                if(!subjectList.includes(d.subject)){ // Write a subject line if its a new subject
                    subjectList.push(d.subject)
                    messageList.push({type:'subject', text:d.subject, date:d.created})
                }
                // Write the message text
                messageList.push({type:'message', mine:!d.toMe, text:d.message, date:d.created})
            })
            this.setState({ 
                contactName:contactName, 
                messageList: messageList.reverse(),
                pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    render() {
  
        return (
            <React.Fragment>
            <div className='conversationModal'>
                <div className='modal displayBlock'>
                    {
                        <section className='modalMain'>
                            <h2 className='contactHeader'>{this.state.contactName}</h2>
                            <div className='chatWindow'>
                                {
                                    this.state.messageList.map((d, i)=>{
                                        return <div className="messageRow" key={i}>
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
                            <div className="chatInput"> 
                                <input className="formControl" placeholder="Message" name='message' type='text' onChange={this.handleChange} />
                            </div>
                            <div className="rowButton" onClick={this.props.handleClose}>Cancel</div>
                        </section>
                    }
                </div>
            </div>
            </React.Fragment>
        );
    }
}
 
export default Conversation;