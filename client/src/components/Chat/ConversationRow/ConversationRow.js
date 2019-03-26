import React, { Component } from "react"; 
import "./ConversationRow.css"; 
import Conversation from '../Conversation/Conversation'; 

class ConversationRow extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversation: props.conversation,
            showChat:props.defaultOpenState?props.defaultOpenState:false
        };
    }
    openChat = (d) => {
        this.setState({showChat:true})
        // document.getElementById("root").classList.add("fixedRoot");
    }
    closeChat = (d) => {
        this.setState({showChat:false})
        // document.getElementById("root").classList.remove("fixedRoot");
    }
    render() {
  
        return (
            <React.Fragment>
                <div className="chatRow" onClick={this.openChat.bind(this)}>
                    <div className="flexColumn">
                        <div><span className="heading">Contact: </span>{this.state.conversation.contactName}</div>
                        <div><span className="heading">Subject: </span>{this.state.conversation.subject_first_name+" "+this.state.conversation.subject_last_name}</div>
                        <div><span className="heading">Job Posting: </span>{this.state.conversation.job_post_title}</div>
                    </div>
                    <div className="flexColumn">
                        <div><span className="heading">Last Message: </span>{
                            this.state.conversation.message_id==null?'Nothing Yet':
                            (this.state.conversation.message!=null?this.state.conversation.message:
                            (this.state.conversation.response!==0?('Meeting has been '+(this.state.conversation.response === 1?"Accepted":"Rejected")):
                            ('Meeting has been requested for '+this.state.conversation.date_offer_str) ) )}</div>
                        <div>{this.state.conversation.created}</div> 
                    </div>
                </div>
                <Conversation conversation={this.state.conversation} open={this.state.showChat} onClose={this.closeChat}/>
            </React.Fragment>
        );
    }
}
 
export default ConversationRow;