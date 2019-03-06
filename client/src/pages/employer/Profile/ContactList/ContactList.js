import React from 'react';
import ApiCalls from '../../../../ApiCalls';  
import './ContactList.css';  
import Pagination from "react-js-pagination";
import Loader from '../../../../components/Loader/Loader';
  
class ContactList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            contactList: [],
            page: 1,
            pageCount: 1,
            loading: true
        };
        this.getContactList();
    }
    getContactList = () => {
        ApiCalls.get(`/api/employer/getEmployerContactList/${this.state.page}`)
        .then((res)=>{
            this.setState({loading: false});
            if(res.data.success){
                const contactList = res.data.contactList
                this.setState({ contactList: contactList,
                    pageCount: contactList.length>0?parseInt(contactList[0].page_count, 10):1 });
            }
        }).catch(errors => {
            this.setState({loading: false});
            console.log(errors.response.data)
        })
    }
    setAdmin = (e, employerContact) => {
        ApiCalls.post(`/api/employer/setContactAdmin`,
            {employerContactId:employerContact.employer_contact_id, isAdmin:e.target.checked})
        .then((res)=>{
            if(res.data.success){
                this.setState({ contactList: this.state.contactList.map(d=>{
                    if(employerContact.employer_contact_id === d.employer_contact_id)
                        d.isadmin = !d.isadmin
                    return d;
                }) })
            }
        })
        .catch(errors => 
            console.log(errors.response.data)
        )
    }
    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getContactList();
        });
    };
    render(){
        return ( 
            <div className="employerContactListContainer"> 
                <div className="contactTableBody">
                    <div className="contactTableHeading">
                        <div className="contactTableCell">Email</div>
                        <div className="contactTableCell">First Name</div>
                        <div className="contactTableCell">Last Name</div>
                        <div className="contactTableCell">Phone Number</div>
                        <div className="contactTableCell">Account Active</div>
                        <div className="contactTableCell">Is Administrator</div>
                        <div className="contactTableCell">Deactivate</div>
                    </div>
                    {
                        this.state.loading ? <Loader/> :
                        this.state.contactList.map((d, i)=>{
                            return <div key={i} className="contactTableRow">
                                <div className="contactTableCell">{d.email}</div>
                                <div className="contactTableCell">{d.first_name}</div>
                                <div className="contactTableCell">{d.last_name}</div>
                                <div className="contactTableCell">{d.phone_number}</div>
                                <div className="contactTableCell center">{d.account_active?"Yes":"Pending"}</div>
                                <div className="contactTableCell center"><input type="checkbox" disabled={d.isMe} checked={d.isadmin} onChange={(e)=>this.setAdmin(e, d)} /></div>
                                <div className="contactTableCell center"><div className="cellButton">Deactivate</div></div>
                            </div>
                        })
                    }
                </div>
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
                <div className="button">Add Contact</div>
            </div> 
        )
    }
}
 

export default ContactList;