import React, { Component } from "react"; 
import "./Chat.css"; 
import AuthFunctions from '../../AuthFunctions'; 
import axios from 'axios';
import ConversationRow from "./ConversationRow/ConversationRow"; 
import ReactPaginate from 'react-paginate';
import Loader from "../Loader/Loader";

class Chat extends Component {

    constructor(props) {
        super(props);
		this.state = {
            conversationList: null,
            page: 1,
            pageCount: 1
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
        axios.get('/api/message/list/'+this.state.page, this.axiosConfig)
        .then((res)=>{
            this.setState({ conversationList: res.data,
                pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    handlePageClick = data => {
        let selected = data.selected+1;
    
        this.setState({ page: selected }, () => {
            this.getConversationList();
        });
    };
    render() {
  
        return (
            <React.Fragment>
                <div className="chatContainer">
                    <div className="pageHeading">Conversations</div>
                    {
                        this.state.conversationList != null ?
                            this.state.conversationList.map((conv, i)=>{
                                return <ConversationRow key={i} conversation={conv}/>
                            })
                        : <Loader/>
                    }
                    <div className="paginationContainer">
                        <ReactPaginate
                            previousLabel={'Back'}
                            nextLabel={'Next'}
                            breakLabel={'...'}
                            breakClassName={'break-me'}
                            pageCount={this.state.pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={10}
                            onPageChange={this.handlePageClick}
                            containerClassName={'pagination'}
                            subContainerClassName={'pages pagination'}
                            activeClassName={'active'}
                            />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
 
export default Chat;