import React from 'react';
import {get, post, cancel} from '../../../../../ApiCalls';  
import Pagination from "../../../../../components/Pagination/Pagination"; 
import { withStyles } from '@material-ui/core/styles';  
import {Button, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress}
    from '@material-ui/core';
import AddUserByEmail from '../../../../../components/AddUserByEmail/AddUserByEmail';
import classNames from 'classnames';

const styles = theme => ({
    button:{ 
        width: "80%",
        display: "inline-block",
        marginBottom: 5,
        marginTop: 5
    },
    tableButton:{ 
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
class EmployerContacts extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            company: props.company,
            companyContactList: [],
            page: 1,
            pageCount: 1,
            loading: true,
            showAddUser: false,
            onChange: props.onChange
        };
    }
    componentWillUnmount = () => {
        cancel();
    }
    componentDidMount = () => {
        this.getContactList();
    }
    getContactList = () => {
        get(`/api/company/getCompanyContactList/${this.state.company.companyId}/${this.state.page}`)
        .then((res)=>{
            this.setState({loading: false});
            if(res && res.data.success){
                const companyContactList = res.data.contactList
                this.setState({
                    companyContactList: companyContactList,
                    pageCount: companyContactList.length>0?parseInt(companyContactList[0].pageCount, 10):1 });
            }
        }).catch(errors => {
            this.setState({loading: false});
            console.log(errors)
        })
    }
    addContact = (users) => {
        const userIds = users.map(d=>d.id)
        if(userIds.length > 0){
            post(`/api/company/addContactToCompany`,
                {userIds:userIds, companyId:this.state.company.companyId})
            .then((res)=>{
                if(res && res.data.success){
                    this.getContactList();
                    if(this.state.onChange)
                        this.state.onChange()
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
                if(this.state.onChange)
                    this.state.onChange()
            }
        })
        .catch(errors => {
            window.alert("You do not have permissions to remove this contact. Ask the an account manager for this company to perform this action.");
            console.log(errors);
        })
    }
    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getContactList();
        });
    };
    handleCloseGetAddUser = (ret) => {
        this.setState({showAddUser:false})
        if(ret){
            this.addContact(ret.filter(d=>!this.state.companyContactList.some(c=>d.id === c.companyContactId)))
        }
    };
    generateEmployerLink = () => {
        post(`/api/company/generateLink`, {companyId:this.state.company.companyId})
        .then((res)=>{
            if(res && res.data.success){
                this.getContactList();
            }
        })
        .catch(errors => 
            console.log(errors)
        )
    }
    regenerateEmployerLink = () => {
        if(window.confirm("This will invalidate any existing link for the employer.\n\nDo you want to coninue?")){
            this.generateEmployerLink();
        }
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <div>
                {this.state.loading && <LinearProgress />}
                <Table className={classNames(classes.tableBody, classes.tableBodyMargins)}>
                    <TableHead className={classes.tableHeading}>
                        <TableRow>
                            <TableCell className={classes.tableCellHeader}>Email</TableCell>
                            <TableCell className={classes.tableCellHeader}>First Name</TableCell>
                            <TableCell className={classes.tableCellHeader}>Last Name</TableCell>
                            <TableCell className={classes.tableCellHeader}>Phone Number</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Remove</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Send Link</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        this.state.companyContactList.map((d, i)=>{
                            return <TableRow key={i} className={classes.tableRow}>
                                <TableCell className={classes.tableCell}><a href={`mailto:${d.email}`}>{d.email}</a></TableCell>
                                <TableCell className={classes.tableCell}>{d.firstName}</TableCell>
                                <TableCell className={classes.tableCell}>{d.lastName}</TableCell>
                                <TableCell className={classes.tableCell}><a href={`tel:${d.phoneNumber}`}>{d.phoneNumber}</a></TableCell>
                                <TableCell align="center" className={classes.tableCell}>
                                    <Button
                                        className={classes.tableButton}
                                        color="primary"
                                        variant="contained"
                                        onClick={()=>this.removeContact(d)}>Remove</Button>
                                </TableCell>
                                {
                                    <TableCell align="center" className={classes.tableCell}>
                                        <Button
                                        className={classes.tableButton}
                                        color="primary"
                                        variant="contained"
                                        onClick={d.has_access_token ? this.regenerateEmployerLink : this.generateEmployerLink}>{d.has_access_token ? 'Regenerate Link' : 'Generate Link'}</Button>
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
                        onChange={this.handlePageClick}
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
 

export default withStyles(styles)(EmployerContacts);