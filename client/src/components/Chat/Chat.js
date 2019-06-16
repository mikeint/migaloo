import React, { Component } from "react"; 
import "./Chat.scss"; 
import { withRouter } from 'react-router-dom';  
import AuthFunctions from '../../AuthFunctions'; 
import {get,cancel} from '../../ApiCalls';  
import ConversationRow from "./ConversationRow/ConversationRow"; 
import Pagination from "react-js-pagination"; 
import LinearProgress from '@material-ui/core/LinearProgress';
import Conversation from '../Conversation/Conversation'; 
import {ListItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
    root: {
        height:'100px', 
        backgroundColor: '#f6f7f8',
        marginBottom:'5px',
        padding:'0px'
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
            conversation: '',
            selectedIndex:0
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
    
    shouldComponentUpdate(nextProps, nextState) {
        const change = this.state.conversation !== nextProps.conversation;
        if(change){
            this.setState({ conversation: nextProps.conversation });
        }
        if(this.state !== nextState)
           return true
        return change;
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

    handleListItemClick = (event, index) => { 
        this.setState({selectedIndex:index})  
    }

    render() {
        const { classes } = this.props;

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
                                                            })})} 
                                                        />
                                                </ListItem>
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
                        <Conversation conversation={this.state.conversation}/>
                    </div>

                </div>
            </React.Fragment>
        );
    }
}
 
export default withRouter(withStyles(styles)(Chat));