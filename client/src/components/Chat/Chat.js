import React, { Component } from "react"; 
import "./Chat.scss"; 
import AuthFunctions from '../../AuthFunctions'; 
import {get,cancel} from '../../ApiCalls';  
import ConversationRow from "./ConversationRow/ConversationRow"; 
import Pagination from "react-js-pagination"; 
import LinearProgress from '@material-ui/core/LinearProgress';
import Conversation from '../Conversation/Conversation'; 

class Chat extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversationList: null,
            page: 1,
            pageCount: 1,
            enterSlide: "page-enter",
            conversation: '',
            showChat: false
        };
        this.Auth = new AuthFunctions();
    }
    componentDidMount = () => {
        this.getConversationList();
    }
    componentWillUnmount = () => {
        cancel()
        this.setState({enterSlide:"page-exit"})
    }
    getConversationList = () => {
        get('/api/message/list/'+this.state.page)
        .then((res)=>{
            if(res && res.data.success)
                this.setState({ conversationList: res.data.conversations,
                    pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].pageCount, 10):1 }) 
        }).catch(errors => 
            console.log(errors)
        )
    }
    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getConversationList();
        });
    };

    openChat = (d) => {
        this.setState({showChat:!this.state.showChat})
        // document.getElementById("root").classList.add("fixedRoot"); 
    }
    closeChat = (d) => {
        this.setState({showChat:!this.state.showChat})
        // document.getElementById("root").classList.remove("fixedRoot");
    }

    render() {
  
        return (
            <React.Fragment>
                <div className="pageHeading">Conversations</div>
                <div className={"chatContainer "+this.state.enterSlide}>
                     
                    <div className="conversationLeft">  
                        {
                            this.state.conversationList != null ?
                                this.state.conversationList.map((conv, i)=>{
                                    const initialOpen = conv.subjectUserId === this.props.match.params.candidateId &&
                                        conv.postId === this.props.match.params.postId
                                    return <ConversationRow key={i} conversation={conv} defaultOpenState={initialOpen} openChat={this.openChat.bind(this)}/>
                                })
                            : <LinearProgress/>
                        } 
                        <div className="paginationContainer">
                            <Pagination
                                prevPageText={'Back'}
                                nextPageText={'Next'}
                                firstPageText={'First'}
                                lastPageText={'Last'}
                                activePage={this.state.page}
                                totalItemsCount={this.state.pageCount*10}
                                marginPagesDisplayed={0}
                                pageRangeDisplayed={10}
                                onChange={this.handlePageClick}
                                innerClass={'pagination'}
                                activeClass={'active'}
                                />
                        </div>  
                    </div>

                    <div className="conversationRight">
                        {this.state.showChat && 
                            <Conversation conversation={this.state.conversation} open={this.state.showChat} onClose={this.closeChat}/>
                        }
                    </div> 
                    
                </div>
            </React.Fragment>
        );
    }
}
 
export default Chat;