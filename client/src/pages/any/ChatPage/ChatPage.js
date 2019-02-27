import React, { Component } from "react"; 
import "./ChatPage.css"; 
import Notifications from '../../../components/Notifications/Notifications';
import Chat from '../../../components/Chat/Chat';

class ChatPage extends Component {
    render() {
  
        return (
            <React.Fragment>
                <Notifications />
                <div className="mainContainer">
                    <Chat/>
                </div>
            </React.Fragment>
        );
    }
}
 
export default ChatPage;