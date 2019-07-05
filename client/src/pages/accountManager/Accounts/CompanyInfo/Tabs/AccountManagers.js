import React from 'react';
import {get, post, cancel} from '../../../../../ApiCalls';  
import Pagination from "../../../../../components/Pagination/Pagination"; 
import { withStyles } from '@material-ui/core/styles';  
import GetAccountManager from '../../../../../components/GetAccountManager/GetAccountManager';
import {Button, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, LinearProgress}
    from '@material-ui/core';
import classNames from 'classnames';

const styles = theme => ({
    button:{ 
        width: "80%",
        display: "inline-block"
    },
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
    tableBodyMargins:{
        margin: 10
    },
    center:{
        textAlign:"center"
    },
    pagination:{
        width: '80%',
        margin: '20px auto 20px auto'
    },
});
class AccountManagers extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            company: props.company,
            contactList: [],
            page: 1,
            pageCount: 1,
            loading: true,
            showGetAccountManager: false
        };
    }
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount = () => {
        this.getAccountManagerContactList();
    }
    getAccountManagerContactList = () => {
        get(`/api/company/getCompanyAccountManagerList/${this.state.company.companyId}/${this.state.page}`)
        .then((res)=>{
            this.setState({loading: false});
            if(res && res.data.success){
                const contactList = res.data.contactList
                this.setState({
                    iAmAdmin: contactList.find(d=>d.isMe).isPrimary, 
                    contactList: contactList,
                    pageCount: contactList.length>0?parseInt(contactList[0].pageCount, 10):1 });
            }
        }).catch(errors => {
            this.setState({loading: false});
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
    render(){
        const { classes } = this.props; 
        return ( 
            <div>
                {this.state.loading && <LinearProgress />}
                <Table className={classNames(classes.tableBody, classes.tableBodyMargins)}>
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
                        this.state.contactList.map((d, i)=>{
                            return <TableRow key={i} className={classes.tableRow}>
                                <TableCell className={classes.tableCell}><a href={`mailto:${d.email}`}>{d.email}</a></TableCell>
                                <TableCell className={classes.tableCell}>{d.firstName}</TableCell>
                                <TableCell className={classes.tableCell}>{d.lastName}</TableCell>
                                <TableCell className={classes.tableCell}><a href={`tel:${d.phoneNumber}`}>{d.phoneNumber}</a></TableCell>
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
                        activePage={this.state.page}
                        totalItemsCount={this.state.pageCount*10}
                        pageRangeDisplayed={10}
                        onChange={this.handleACPageClick}
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
            </div>
        )
    }
}
 

export default withStyles(styles)(AccountManagers);