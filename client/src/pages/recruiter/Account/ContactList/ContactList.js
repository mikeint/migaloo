import React from 'react';
import ApiCalls from '../../../../ApiCalls';  
import Pagination from "react-js-pagination";
import Loader from '../../../../components/Loader/Loader';
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import GetAccountManager from '../../../../components/GetAccountManager/GetAccountManager';
import ModifiableProfileImage from '../../../../components/ModifiableProfileImage/ModifiableProfileImage';
import AddressInput from '../../../../components/AddressInput/AddressInput';
import FormValidation from '../../../../FormValidation';

const styles = theme => ({
    button:{ 
        width: "80%",
    },
    textField: {
        width: "50%",
        margin: "10px"
    },
    tableBody:{
        display: "table",
        marginTop: "15px",
        width: "80%",
        margin: "40px auto 20px auto"
    },
    tableRow:{
        display: "table-row"
    },
    tableHeading:{
        backgroundColor: "rgb(197, 197, 197)",
        textAlign: "center",
        display: "table-header-group",
        fontWeight: "bold"
    },
    tableCell:{
        border: "1px solid #999999",
        display: "table-cell",
        padding: "3px 10px"
    },
    center:{
        textAlign:"center"
    },
    alertClose: {
        position: "absolute",
        right: "10px"
    },
    alertTitle: {
        width: "100%",
        height: "50px",
        backgroundColor: "#263c54",
        textAlign: "center",
        color: "#fff",
        lineHeight: "50px",
        fontSize: "24px",
        fontWeight: "bold", 
        position: "relative"
    }
});
const errorText = [
    {
        stateName: "company_name",
        errorText: "Please enter a name for the recruiter"
    },
    {
        stateName: "department",
        errorText: "Please enter a departement for the recruiter"
    },
    {
        stateName: "addressChange.placeId",
        errorText: "Please select an address for the recruiter"
    }
]
class ContactList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            contactList: [],
            company: props.company,
            company_name: props.company.company_name,
            page: 1,
            pageCount: 1,
            loading: true,
            showGetAccountManager: false,
            onClose: props.onClose,
            isModified: false,
            didSave: false,
            errors:{}
        };
        this.formValidation = new FormValidation(this, errorText);
    }
    componentWillUnmount = () => {
        ApiCalls.cancel();
    }
    componentDidMount = () => {
        this.getContactList();
    }
    getContactList = () => {
        ApiCalls.get(`/api/recruiter/getRecruiterContactList/${this.state.employer.company_id}/${this.state.page}`)
        .then((res)=>{
            this.setState({loading: false});
            if(res && res.data.success){
                const contactList = res.data.contactList
                this.setState({
                    iAmAdmin: contactList.find(d=>d.isMe).is_primary, 
                    contactList: contactList,
                    pageCount: contactList.length>0?parseInt(contactList[0].page_count, 10):1 });
            }
        }).catch(errors => {
            this.setState({loading: false});
            console.log(errors.response.data)
        })
    }
    setAdmin = (e, recruiterContact) => {
        ApiCalls.post(`/api/recruiter/setContactAdmin`,
            {recruiterContactId:recruiterContact.company_contact_id, employerId:this.state.company.company_id, isPrimary:e.target.checked})
        .then((res)=>{
            if(res && res.data.success){
                this.setState({ contactList: this.state.contactList.map(d=>{
                    if(recruiterContact.company_contact_id === d.company_contact_id)
                        d.is_primary = !d.is_primary
                    return d;
                }) })
            }
        })
        .catch(errors => 
            console.log(errors.response.data)
        )
    }
    addContact = (users) => {
        const userIds = users.map(d=>d.id)
        if(userIds.length > 0){
            ApiCalls.post(`/api/recruiter/addContactToRecruiter`,
                {userIds:userIds, recruiterId:this.state.employer.company_id})
            .then((res)=>{
                if(res && res.data.success){
                    this.getContactList();
                }
            })
            .catch(errors => 
                console.log(errors.response.data)
            )
        }
    }
    removeContact = (user) => {
        ApiCalls.post(`/api/recruiter/removeContactFromRecruiter`,
            {userId:user.company_contact_id, recruiterId:this.state.employer.company_id})
        .then((res)=>{
            if(res && res.data.success){
                this.getContactList();
            }
        })
        .catch(errors => 
            console.log(errors.response.data)
        )
    }
    saveRecruiter = (user) => {
        if(this.formValidation.isValid()){
            ApiCalls.post(`/api/recruiter/setRecruiterProfile`,
                {recruiterId:this.state.employer.company_id, company_name:this.state.company_name, department:this.state.department})
            .then((res)=>{
                if(res && res.data.success){
                    this.setState({didSave: true, isModified:false})
                    this.getContactList();
                }
            })
            .catch(errors => 
                console.log(errors.response.data)
            )
        }
    }
    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getContactList();
        });
    };
    handleCloseGetAccountManager = (ret) => {
        this.setState({showGetAccountManager:false})
        if(ret){
            this.addContact(ret.filter(d=>!this.state.contactList.some(c=>d.id === c.company_contact_id)))
        }
    };
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, isModified:this.state.isModified||this.state[e.target.name]!==e.target.value })
    }
    closeSelf(){
        this.state.onClose(this.state.didSave)
    }
    handleAddressChange(address){
        this.setState({addressChange:address})
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <div> 
                <div className={classes.alertTitle} color="primary">
                    <span>{this.state.company.company_name + ' - Contact List'}</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={this.closeSelf.bind(this)}>
                        <Close />
                    </IconButton>
                </div>
                <div className={classes.center}>
                    <br/>
                    <div>
                        <ModifiableProfileImage user={this.state.company} type={'company'}/>
                    </div>
                    
                    <div>
                    <TextField
                        name="company_name"
                        label="Company Name"
                        className={classes.textField}
                        defaultValue={this.state.company_name}
                        required
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                        {...this.formValidation.hasError("company_name")}
                    />
                    </div>
                    <div>
                    <TextField
                        name="department"
                        label="Department"
                        className={classes.textField}
                        defaultValue={this.state.department}
                        required
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                        {...this.formValidation.hasError("department")}
                    />
                    </div>
                    <div>
                        <AddressInput
                        {...this.state.company}
                        onChange={this.handleAddressChange.bind(this)}
                        {...(this.formValidation.hasError("addressChange.placeId").error?{error:true}:{})}/>
                    </div>
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        disabled={!this.state.isModified}
                        onClick={this.saveRecruiter}>Save Changes</Button>
                </div>
                <div className={classes.tableBody}>
                    <div className={classes.tableHeading}>
                        <div className={classes.tableCell}>Email</div>
                        <div className={classes.tableCell}>First Name</div>
                        <div className={classes.tableCell}>Last Name</div>
                        <div className={classes.tableCell}>Phone Number</div>
                        <div className={classes.tableCell}>Account Active</div>
                        <div className={classes.tableCell}>Is Primary</div>
                        {this.state.iAmAdmin && <div className={classes.tableCell}>Remove</div>}
                    </div>
                    {
                        this.state.loading ? <Loader/> :
                        this.state.contactList.map((d, i)=>{
                            return <div key={i} className={classes.tableRow}>
                                <div className={classes.tableCell}>{d.email}</div>
                                <div className={classes.tableCell}>{d.first_name}</div>
                                <div className={classes.tableCell}>{d.last_name}</div>
                                <div className={classes.tableCell}>{d.phone_number}</div>
                                <div className={classes.tableCell+" "+classes.center}>{d.account_active?"Yes":"Pending"}</div>
                                <div className={classes.tableCell+" "+classes.center}><input type="checkbox" disabled={d.isMe} checked={d.is_primary} onChange={(e)=>this.setAdmin(e, d)} /></div>
                                {
                                    this.state.iAmAdmin && <div className={classes.tableCell+" "+classes.center}>
                                        <Button
                                            className={classes.button}
                                            color="primary"
                                            variant="contained"
                                            disabled={d.isMe}
                                            onClick={()=>this.removeContact(d)}>Remove</Button>
                                    </div>
                                }
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
                <div className={classes.center}>
                    <Button
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={()=>this.setState({showGetAccountManager:true})}>Add Contact</Button>
                </div>
                <GetAccountManager
                    subject={this.state.company.company_name}
                    open={this.state.showGetAccountManager}
                    onClose={this.handleCloseGetAccountManager}/>
                <br/>
            </div> 
        )
    }
}
 

export default withStyles(styles)(ContactList);