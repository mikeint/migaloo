import React, { Component } from "react"; 
import "./Chat.scss"; 
import { withRouter } from 'react-router-dom';  
import AuthFunctions from '../../AuthFunctions'; 
import {get,cancel} from '../../ApiCalls';  
import debounce from 'lodash/debounce'; 
import ConversationRow from "./ConversationRow/ConversationRow"; 
import Pagination from "../Pagination/Pagination"; 
import LinearProgress from '@material-ui/core/LinearProgress';
import Conversation from '../Conversation/Conversation'; 
import {ListItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
    root: {
        height:'100px', 
        backgroundColor: '#fff',
        marginBottom:'5px',
        padding:'0px',
        "&:nth-child(even)": {
            background: "#f2f3f5",
        },   
    },
})

class Chat extends Component {

    constructor(props) {
        super(props);
		this.state = { 
            conversationList: null,
            page: 1,
            pageCount: 1,
            enterSlide: "page-enter",
            conversation: null,
            selectedIndex:0,
            isChatClosed: true,
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

    onSearchChange = (event) => { 
        this.queryForNames(event.target.value);
    }
    queryForNames = debounce((searchString) => {
        searchString = searchString.trim()
        if(searchString.length > 1){
            this.getConversationList(searchString)
        }else{
            this.getConversationList()
        }
    }, 250)

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

    handleListItemClick = (event, index) => { 
        this.setState({selectedIndex:index})  
    }

    onClose = () => {
        this.setState({conversation:null,isChatClosed:!this.state.isChatClosed})
    }

    render() {
        const { classes } = this.props; 

        return (
            <React.Fragment>
                <div className="pageHeading">Conversations</div>
                <div className={"chatContainer "+this.state.enterSlide}> 

                    {this.state.isChatClosed ?
                        <div className="conversationLeft">
                            <input
                                        className="searchChatList"
                                        name="searchTerm"
                                        type="text"
                                        placeholder="Search"
                                        onChange={this.onSearchChange}/>
                            {
                                this.state.conversationList != null ?
                                    this.state.conversationList.map((conv, i)=>{
                                        const initialOpen = conv.subjectUserId === this.props.match.params.candidateId &&
                                            conv.postId === this.props.match.params.postId
                                            return <ListItem 
                                                        key={i} 
                                                        className={classes.root} 
                                                        button selected={this.state.selectedIndex === i} 
                                                        onClick={event => this.handleListItemClick(event, i)}
                                                    >
                                                        <ConversationRow 
                                                            conversation={conv}
                                                            defaultOpenState={initialOpen} 
                                                            openChat={(() => {
                                                                this.setState({
                                                                    conversation: conv,
                                                                    isChatClosed:false
                                                                })})} 
                                                            />
                                                    </ListItem>
                                    })
                                : <LinearProgress/>
                            }
                            <Pagination
                                activePage={this.state.page}
                                totalItemsCount={this.state.pageCount*10}
                                pageRangeDisplayed={1}
                                onChange={this.handlePageClick}
                                />
                        </div>
                        :
                        ""
                    }


                    <div className="conversationRight">
                        {this.state.conversation != null && 
                        <Conversation conversation={this.state.conversation} onClose={this.onClose} />}
                    </div>

                </div>
            </React.Fragment>
        );
    }
}
 
export default withRouter(withStyles(styles)(Chat));