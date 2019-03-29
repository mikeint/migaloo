import React, { Component } from "react"; 
import "./Chat.css"; 
import AuthFunctions from '../../AuthFunctions'; 
import ApiCalls from '../../ApiCalls';  
import ConversationRow from "./ConversationRow/ConversationRow"; 
import Pagination from "react-js-pagination";
import Loader from "../Loader/Loader"; 

class Chat extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversationList: null,
            page: 1,
            pageCount: 1,
            enterSlide:"page-enter"
        };
        this.Auth = new AuthFunctions();
    }
    componentDidMount = () => {
        this.getConversationList();
    }
    componentWillUnmount = () => {
        ApiCalls.cancel()
        this.setState({enterSlide:"page-exit"})
    }
    getConversationList = () => {
        ApiCalls.get('/api/message/list/'+this.state.page)
        .then((res)=>{
            if(res)
                this.setState({ conversationList: res.data,
                    pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getConversationList();
        });
    };
    render() {
  
        return (
            <React.Fragment>
                <div className="pageHeading">Conversations</div>
                <div className={"chatContainer "+this.state.enterSlide}>
                    {
                        this.state.conversationList != null ?
                            this.state.conversationList.map((conv, i)=>{
                                const initialOpen = conv.subject_user_id === this.props.match.params.candidateId &&
                                    conv.post_id === this.props.match.params.postId
                                return <ConversationRow key={i} conversation={conv} defaultOpenState={initialOpen} />
                            })
                        : <Loader/>
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
            </React.Fragment>
        );
    }
}
 
export default Chat;