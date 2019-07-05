import React from 'react';
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
import {IconButton, Tab, Tabs}
    from '@material-ui/core';
import Profile from './Tabs/Profile';
import AccountManagers from './Tabs/AccountManagers';
import EmployerContacts from './Tabs/EmployerContacts';

const styles = theme => ({
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
});
class ContactList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            company: props.company,
            onClose: props.onClose,
            tabIndex: 0
        };
    }
    closeSelf(){
        this.state.onClose(this.state.didSave);
    }
    tabChange = (e, i) => {
        this.setState({tabIndex: i});
    }
    render(){
        const { classes } = this.props; 
        return ( 
            <div> 
                <div className={classes.alertTitle} color="primary">
                    <span>{this.state.company.companyName}</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={this.closeSelf.bind(this)}>
                        <Close />
                    </IconButton>
                </div>
                <Tabs variant="fullWidth" value={this.state.tabIndex} onChange={this.tabChange}>
                    <Tab label="Profile" />
                    <Tab label="Employer Contacts" />
                    <Tab label="Account Managers" />
                </Tabs>
                {this.state.tabIndex===0 && <Profile company={this.state.company}/>}
                {this.state.tabIndex===1 && <AccountManagers company={this.state.company}/>}
                {this.state.tabIndex===2 && <EmployerContacts company={this.state.company}/>}
            </div> 
        )
    }
}
 

export default withStyles(styles)(ContactList);