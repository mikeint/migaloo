import React from 'react';
import {get, post, cancel} from '../../../../ApiCalls';  
import Pagination from "react-js-pagination";
import LoaderSquare from '../../../../components/LoaderSquare/LoaderSquare';
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import GetAccountManager from '../../../../components/GetAccountManager/GetAccountManager';
import ModifiableProfileImage from '../../../../components/ModifiableProfileImage/ModifiableProfileImage';
import AddressInput from '../../../../components/Inputs/AddressInput/AddressInput';
import FormValidation from '../../../../FormValidation';
import {IconButton, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, LinearProgress}
    from '@material-ui/core';
import AddUserByEmail from '../../../../components/AddUserByEmail/AddUserByEmail';

const styles = theme => ({
    button:{ 
        width: "80%",
        display: "inline-block"
    },
    textField: {
        width: "50%",
        margin: "10px"
    },
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
    center:{
        textAlign:"center"
    },
    addressField:{
        width: "80%",
        display: "inline-block"
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
    },
    pagination:{
        width: '80%',
        margin: '20px auto 20px auto'
    },
});
const errorText = [
    {
        stateName: "companyName",
        errorText: "Please enter a name for the company"
    },
    {
        stateName: "department",
        errorText: "Please enter a departement for the company"
    },
    {
        stateName: "addressChange.placeId",
        errorText: "Please select an address for the company"
    }
]
class ContactList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            contactList: [],
            companyContactList: [],
            company: props.company,
            companyName: props.company.companyName,
            department: props.company.department,
            address: props.company.address,
            page: 1,
            pageCount: 1,
            companyPage: 1,
            companyPageCount: 1,
            ccLoading: true,
            acLoading: true,
            showAddUser: false,
            showGetAccountManager: false,
            onClose: props.onClose,
            isModified: false,
            didSave: false,
            errors:{}
        };
        this.formValidation = new FormValidation(this, errorText);
    }
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount = () => {
        this.getContactList();
        this.getAccountManagerContactList();
    }
    getContactList = () => {
        get(`/api/company/getCompanyContactList/${this.state.company.companyId}/${this.state.companyPage}`)
        .then((res)=>{
            this.setState({ccLoading: false});
            if(res && res.data.success){
                const companyContactList = res.data.contactList
                this.setState({
                    companyContactList: companyContactList,
                    companyPageCount: companyContactList.length>0?parseInt(companyContactList[0].pageCount, 10):1 });
            }
        }).catch(errors => {
            this.setState({ccLoading: false});
            console.log(errors)
        })
    }
    getAccountManagerContactList = () => {
        get(`/api/company/getCompanyAccountManagerList/${this.state.company.companyId}/${this.state.page}`)
        .then((res)=>{
            this.setState({acLoading: false});
            if(res && res.data.success){
                const contactList = res.data.contactList
                this.setState({
                    iAmAdmin: contactList.find(d=>d.isMe).isPrimary, 
                    contactList: contactList,
                    pageCount: contactList.length>0?parseInt(contactList[0].pageCount, 10):1 });
            }
        }).catch(errors => {
            this.setState({acLoading: false});
            console.log(errors)
        })
    }
    setAdmin = (e, companyContact) => {
        post(`/api/company/setContactAdmin`,
            {
                companyContactId:companyContact.companyContactId,
                companyId:this.state.company.companyId,
                isPrimary:e.target.checked
            })
        .then((res)=>{
            if(res && res.data.success){
                this.setState({ contactList: this.state.contactList.map(d=>{
                    if(companyContact.companyContactId === d.companyContactId)
                        d.isPrimary = !d.isPrimary
                    return d;
                }) })
            }
        })
        .catch(errors => 
            console.log(errors)
        )
    }
    addContact = (users) => {
        const userIds = users.map(d=>d.id)
        if(userIds.length > 0){
            post(`/api/company/addContactToCompany`,
                {userIds:userIds, companyId:this.state.company.companyId})
            .then((res)=>{
                if(res && res.data.success){
                    this.getContactList();
                }
            })
            .catch(errors => 
                console.log(errors)
            )
        }
    }
    removeContact = (user) => {
        post(`/api/company/removeContactFromCompany`,
            {userId:user.companyContactId, companyId:this.state.company.companyId})
        .then((res)=>{
            if(res && res.data.success){
                this.getContactList();
            }
        })
        .catch(errors => 
            console.log(errors)
        )
    }
    saveCompany = (user) => {
        if(this.formValidation.isValid()){
            post(`/api/company/setCompanyProfile`, this.state)
            .then((res)=>{
                if(res && res.data.success){
                    this.setState({didSave: true, isModified:false})
                    this.getContactList();
                }
            })
            .catch(errors => 
                console.log(errors)
            )
        }
    }
    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getContactList();
        });
    };
    handleACPageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getAccountManagerContactList();
        });
    };
    handleCloseGetAccountManager = (ret) => {
        this.setState({showGetAccountManager:false})
        if(ret){
            this.addContact(ret.filter(d=>!this.state.contactList.some(c=>d.id === c.companyContactId)))
        }
    };
    handleCloseGetAddUser = (ret) => {
        this.setState({showAddUser:false})
        if(ret){
            this.addContact(ret.filter(d=>!this.state.companyContactList.some(c=>d.id === c.companyContactId)))
        }
    };
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value, isModified:this.state.isModified||this.state[e.target.name]!==e.target.value }, this.formValidation.shouldRevalidate)
    }
    closeSelf(){
        this.state.onClose(this.state.didSave)
    }
    handleAddressChange(address){
        this.setState({address:address}, this.formValidation.shouldRevalidate)
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <div> 
                <div className={classes.alertTitle} color="primary">
                    <span>{this.state.company.companyName + ' - Contact List'}</span>
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
                        name="companyName"
                        label="Company Name"
                        className={classes.textField}
                        defaultValue={this.state.companyName}
                        required
                        onChange={this.handleChange}
                        margin="normal"
                        variant="outlined"
                        {...this.formValidation.hasError("companyName")}
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
                    <div className={classes.addressField}>
                        <AddressInput
                        value={this.state.address}
                        onChange={this.handleAddressChange.bind(this)}
                        {...(this.formValidation.hasError("addressChange.placeId").error?{error:true}:{})}/>
                    </div>
                    <Button
                        className={classes.button}
                        color="primary"
                        variant="contained"
                        disabled={!this.state.isModified}
                        onClick={this.saveCompany}>Save Changes</Button>
                </div>
                <Table className={classes.tableBody}>
                    <TableHead className={classes.tableHeading}>
                        <TableRow>
                            <TableCell align="center" className={classes.tableCellHeader}>Email</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>First Name</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Last Name</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Phone Number</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Account Active</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Is Primary</TableCell>
                            {this.state.iAmAdmin && <TableCell align="center" className={classes.tableCellHeader}>Remove</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        this.state.acLoading ?
                        <LinearProgress /> :
                        this.state.contactList.map((d, i)=>{
                            return <TableRow key={i} className={classes.tableRow}>
                                <TableCell className={classes.tableCell}>{d.email}</TableCell>
                                <TableCell className={classes.tableCell}>{d.firstName}</TableCell>
                                <TableCell className={classes.tableCell}>{d.lastName}</TableCell>
                                <TableCell className={classes.tableCell}>{d.phoneNumber}</TableCell>
                                <TableCell align="center" className={classes.tableCell}>{d.accountActive?"Yes":"Pending"}</TableCell>
                                <TableCell align="center" className={classes.tableCell}>
                                    <Checkbox
                                        checked={d.isPrimary}
                                        disabled={d.isMe} 
                                        onChange={e=>this.setAdmin(e, d)}
                                        value="checked"
                                        color="primary"
                                    />
                                </TableCell>
                                {
                                    this.state.iAmAdmin && <TableCell align="center" className={classes.tableCell}>
                                        <Button
                                            className={classes.button}
                                            color="primary"
                                            variant="contained"
                                            disabled={d.isMe}
                                            onClick={()=>this.removeContact(d)}>Remove</Button>
                                    </TableCell>
                                }
                            </TableRow>
                        })
                    }
                    </TableBody>
                </Table>
                <div className={"paginationContainer "+classes.pagination}>
                    <Pagination
                        prevPageText={'Back'}
                        nextPageText={'Next'}
                        firstPageText={'First'}
                        lastPageText={'Last'}
                        activePage={this.state.page}
                        totalItemsCount={this.state.pageCount*10}
                        marginPagesDisplayed={0}
                        pageRangeDisplayed={10}
                        onChange={this.handleACPageClick}
                        innerClass={'pagination'}
                        activeClass={'active'}
                        />
                </div>
                <div className={classes.center}>
                    <Button
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={()=>this.setState({showGetAccountManager:true})}>Add Account Manager</Button>
                </div>
                <GetAccountManager
                    subject={this.state.company.companyName}
                    open={this.state.showGetAccountManager}
                    onClose={this.handleCloseGetAccountManager}/>



                <Table className={classes.tableBody}>
                    <TableHead className={classes.tableHeading}>
                        <TableRow>
                            <TableCell align="center" className={classes.tableCellHeader}>Email</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>First Name</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Last Name</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Phone Number</TableCell>
                            {this.state.iAmAdmin && <TableCell align="center" className={classes.tableCellHeader}>Remove</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        this.state.ccLoading ? 
                        <LinearProgress /> :
                        this.state.companyContactList.map((d, i)=>{
                            return <TableRow key={i} className={classes.tableRow}>
                                <TableCell className={classes.tableCell}>{d.email}</TableCell>
                                <TableCell className={classes.tableCell}>{d.firstName}</TableCell>
                                <TableCell className={classes.tableCell}>{d.lastName}</TableCell>
                                <TableCell className={classes.tableCell}>{d.phoneNumber}</TableCell>
                                {
                                    this.state.iAmAdmin && <TableCell align="center" className={classes.tableCell}>
                                        <Button
                                            className={classes.button}
                                            color="primary"
                                            variant="contained"
                                            disabled={d.isMe}
                                            onClick={()=>this.removeContact(d)}>Remove</Button>
                                    </TableCell>
                                }
                            </TableRow>
                        })
                    }
                    </TableBody>
                </Table>
                <div className={"paginationContainer "+classes.pagination}>
                    <Pagination
                        prevPageText={'Back'}
                        nextPageText={'Next'}
                        firstPageText={'First'}
                        lastPageText={'Last'}
                        activePage={this.state.companyPage}
                        totalItemsCount={this.state.companyPageCount*10}
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
                    onClick={()=>this.setState({showAddUser:true})}>Add Company Contact</Button>
                </div>
                <AddUserByEmail
                    open={this.state.showAddUser}
                    onClose={this.handleCloseGetAddUser}/>
                <br/>
            </div> 
        )
    }
}
 

export default withStyles(styles)(ContactList);