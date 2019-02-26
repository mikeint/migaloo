import React, { Component } from "react"; 
import "./ConversationRow.css"; 
import Conversation from '../Conversation/Conversation'; 

class ConversationRow extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversation: props.conversation,
            showChat:false
        };
    }
    openChat = (d) => {
        this.setState({showChat:true})
    }
    closeChat = (d) => {
        this.setState({showChat:false})
    }
    render() {
  
        return (
            <React.Fragment>
                <div className="chatRow" onClick={this.openChat.bind(this)}>
                    <div className="flexColumn">
                        <div><span className="heading">Subject: </span>{this.state.conversation.subject}</div>
                        <div><span className="heading">Total Messages: </span>{this.state.conversation.message_count}</div>
                    </div>
                    <div className="flexColumn">
                        <div><span className="heading">Last Message: </span>{this.state.conversation.message}</div>
                        <div>{this.state.conversation.created}</div> 
                    </div>
                </div>
                {this.state.showChat?<Conversation conversation={this.state.conversation} handleClose={this.closeChat}/>:''}
            </React.Fragment>
        );
    }
}
 
export default ConversationRow;