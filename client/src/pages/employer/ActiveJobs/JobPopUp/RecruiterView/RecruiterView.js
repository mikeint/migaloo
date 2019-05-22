import React from 'react';
import {get} from '../../../../../ApiCalls';  
import AuthFunctions from '../../../../../AuthFunctions'; 
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';  
  

const styles = theme => ({
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
});
class RecruiterView extends React.Component{

    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            jobObj: props.job,
            recruiters: []
        };
        this.Auth = new AuthFunctions();
    }
    
    componentDidMount = () => {
        this.getRecruiters();
    } 
    getRecruiters = () => {
        get('/api/employerPostings/listRecruiters/'+this.state.jobObj.post_id)
        .then((res)=>{
            if(res && res.data.success){
                this.setState({recruiters:res.data.recruiters});
            }
        }).catch(errors => 
            console.log(errors)
        )
    }
    render(){ 

        const { classes } = this.props; 
        return (
            <Table className={classes.tableBody}>
                <TableHead className={classes.tableHeading}>
                    <TableRow>
                        <TableCell align="center" className={classes.tableCellHeader}>First Name</TableCell>
                        <TableCell align="center" className={classes.tableCellHeader}>Last Name</TableCell>
                        <TableCell align="center" className={classes.tableCellHeader}>Assign Date</TableCell>
                        <TableCell align="center" className={classes.tableCellHeader}>Response</TableCell>
                        <TableCell align="center" className={classes.tableCellHeader}>Candidates Posted</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {
                    this.state.recruiters.length === 0 ? 
                    <TableRow className={classes.tableRow}>
                        <TableCell colSpan={5} align="center" className={classes.tableCellHeader}>No Recruiters Assigned</TableCell>
                    </TableRow> :
                    this.state.recruiters.map((d, i)=>{
                        return <TableRow key={i} className={classes.tableRow}>
                            <TableCell className={classes.tableCell}>{d.first_name}</TableCell>
                            <TableCell className={classes.tableCell}>{d.last_name}</TableCell>
                            <TableCell className={classes.tableCell}>{d.recruiter_created}</TableCell>
                            <TableCell className={classes.tableCell}>{d.response === 1 ? 'Working on it': (d.response === 2 ? 'Will not be working on it' : 'None')}</TableCell>
                            <TableCell className={classes.tableCell}>{d.candidate_count}</TableCell>
                        </TableRow>
                    })
                }
                </TableBody>
            </Table>
        )
    }
}
 

export default withStyles(styles)(RecruiterView);
