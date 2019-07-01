import React, { Component } from "react"; 
import "./ConversationRow.scss"; 

class ConversationRow extends Component {

    constructor(props) {
        super(props);
        if(this.props.openChat && this.props.defaultOpenState)
            this.props.openChat();
    }
    render() { 
        
        return (  
            <React.Fragment>
                <div className='chatRow' onClick={this.props.openChat}>
                    <div className="flexColumn">
                        <div className="name">{this.props.conversation.subjectFirstName+" "+this.props.conversation.subjectLastName}</div>
                        <div>{this.props.conversation.contactName}</div>
                        {/* <div><span className="posting">Job Posting: </span>{this.props.conversation.jobPostTitle}</div> */}
                    </div>
                   {/*  <div className="flexColumn">
                        <div><span className="heading">Last Message: </span>{
                            this.props.conversation.messageId==null?'Nothing Yet':
                            (this.props.conversation.message!=null?this.props.conversation.message:
                            (this.props.conversation.response!==0?('Meeting has been '+(this.props.conversation.response === 1?"Accepted":"Rejected")):
                            ('Meeting has been requested for '+this.props.conversation.dateOfferStr) ) )}</div>
                        <div>{this.props.conversation.created}</div> 
                    </div> */}
                </div>
            </React.Fragment>
        );
    }
}
 
export default ConversationRow;