import React, { Component } from "react"; 
import "./Chat.css"; 
import TopBar from '../../../components/TopBar/TopBar';
import NavBar from '../NavBar/NavBar';

class Chat extends Component {
  
    render() {
  
        return (
            <React.Fragment>
                <NavBar />
                <TopBar />
            
                <div className="mainContainer">
                    <h2>Conversations, say what up</h2>
                </div>
            </React.Fragment>
        );
    }
}
 
export default Chat;