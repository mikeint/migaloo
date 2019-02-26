import React, { Component } from "react"; 
import "./Chat.css"; 
import AuthFunctions from '../../AuthFunctions'; 
import axios from 'axios';

class Chat extends Component {

    constructor(props) {
        super(props);
		this.state = {
            messageList: []
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
        axios.get('/api/message/list/', this.axiosConfig)
        .then((res)=>{
            this.setState({ messageList: res.data, pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 }) 
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
                        this.state.messageList.map((d, i)=>{
                            return <div className="chatRow" key={i} onClick={this.showAllChat.bind(i)}>
                                <div className="flexColumn">
                                    <div><span className="heading">Subject: </span>{d.subject}</div>
                                    <div><span className="heading">Total Messages: </span>{d.message_count}</div>
                                </div>
                                <div className="flexColumn">
                                    <div><span className="heading">Last Message: </span>{d.message}</div>
                                    <div>{d.created}</div> 
                                </div>
                            </div>
                        })
                    }
                </div>
            </React.Fragment>
        );
    }
}
 
export default Chat;