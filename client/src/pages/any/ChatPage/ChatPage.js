import React, { Component } from "react"; 
import "./ChatPage.css"; 
import TopBar from '../../../components/TopBar/TopBar';
import Chat from '../../../components/Chat/Chat';

class ChatPage extends Component {
    render() {
  
        return (
            <React.Fragment>
                <TopBar />
                <div className="mainContainer">
                    <Chat/>
                </div>
            </React.Fragment>
        );
    }
}
 
export default ChatPage;