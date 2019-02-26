import React, { Component } from "react"; 
import "./Chat.css"; 
import AuthFunctions from '../../AuthFunctions'; 
import axios from 'axios';
import ConversationRow from "./ConversationRow/ConversationRow"; 

class Chat extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversationList: [],
            pageCount: 0
        };
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
    }
    componentWillMount = () => {
        this.getConversationList();
    }
    getConversationList = () => {
        axios.get('/api/message/list/', this.axiosConfig)
        .then((res)=>{
            this.setState({ conversationList: res.data, pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    showAllChat = (d) => {
        // TODO: On click grap the chain_id and call GET api/message/listChain/:chainId
        // Should dispaly a chat log with ability to contact POST api/message/create
        console.log(d)
    }
    render() {
  
        return (
            <React.Fragment>
                <div className="chatContainer">
                    <div className="pageHeading">Conversations</div>
                    {
                        this.state.conversationList.map((conv, i)=>{
                            return <ConversationRow key={i} conversation={conv}/>
                        })
                    }
                </div>
            </React.Fragment>
        );
    }
}
 
export default Chat;