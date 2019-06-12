import React from 'react';
import {get, post} from '../../ApiCalls';  
import {Table, Checkbox, Button, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';  
//import classNames from 'classnames';

const styles = theme => ({
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
    center:{
        textAlign:"center"
    },
    button:{
        marginLeft:"auto",
        marginRight:"auto",
        width: "80%",
        marginBottom: 20
    }
});
class NotificationSettings extends React.Component{
    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            notificationSettings: []
        };
    }
    componentDidMount = () => {
        get('/api/notifications/settings')
        .then((res)=>{
            if(res && res.data.success){
                this.setState({notificationSettings: res.data.notificationSettings})
            }
        }).catch((e)=>{})
    }
    setSettings(){
        post('/api/notifications/settings', {
            notificationSettings:this.state.notificationSettings
        })
        .then(()=>{

        }).catch((e)=>{})
    }
    handleCheckboxChange = (id, field, checked) =>{
        const notificationSettings = this.state.notificationSettings
        notificationSettings.forEach(d=>{
            if(d.topicId === id) d[field] = checked;
        })
        this.setState({notificationSettings: notificationSettings})
    }
    render(){
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Table className={classes.tableBody}>
                    <TableHead className={classes.tableHeading}>
                        <TableRow>
                            <TableCell align="center" className={classes.tableCellHeader}>Topic</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>App Notification</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Email When Offline</TableCell>
                            <TableCell align="center" className={classes.tableCellHeader}>Always Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        this.state.notificationSettings.length === 0 ? 
                        <TableRow className={classes.tableRow}>
                            <TableCell colSpan={4} align="center" className={classes.tableCellHeader}>No topics to subscribe to</TableCell>
                        </TableRow> :
                        this.state.notificationSettings.map((d, i)=>{
                            return <TableRow key={i} className={classes.tableRow}>
                                <TableCell className={classes.tableCell}>{d.topicName}</TableCell>
                                <TableCell className={classes.tableCell}><Checkbox onChange={(e,c)=>this.handleCheckboxChange(d.topicId, 'notification', c)} checked={d.notification}/></TableCell>
                                <TableCell className={classes.tableCell}><Checkbox onChange={(e,c)=>this.handleCheckboxChange(d.topicId, 'email', c ? 1 : 0)} checked={d.email === 1}/></TableCell>
                                <TableCell className={classes.tableCell}><Checkbox onChange={(e,c)=>this.handleCheckboxChange(d.topicId, 'email', c ? 2 : 0)} checked={d.email === 2}/></TableCell>
                            </TableRow>
                        })
                    }
                    </TableBody>
                </Table>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={()=>this.setSettings()}>Save</Button>
            </React.Fragment>
        )
    }
};
export default withStyles(styles)(NotificationSettings);