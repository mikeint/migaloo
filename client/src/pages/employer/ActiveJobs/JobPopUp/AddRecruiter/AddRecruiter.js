import React from 'react';
import {get, post} from '../../../../../ApiCalls';  
import AuthFunctions from '../../../../../AuthFunctions'; 
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';  
import classNames from 'classnames';
  

const styles = theme => ({
    tableBody:theme.table.tableBody,
    tableHeading:theme.table.tableHeading,
    tableCellHeader:theme.table.tableCellHeader,
    tableCell:theme.table.tableCell,
    center:{
        textAlign:"center"
    }
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
        get('/api/employerPostings/listNewRecruiters/'+this.state.jobObj.post_id)
        .then((res)=>{
            if(res && res.data.success){
                this.setState({recruiters:res.data.recruiters});
            }
        }).catch(errors => 
            console.log(errors)
        )
    }
    addRecruiter = (recruiterId) => {
        post('/api/employerPostings/addRecruiter',
            {postId:this.state.jobObj.post_id, recruiterId:recruiterId})
        .then((res)=>{
            if(res && res.data.success){
            this.setState({recruiters:this.state.recruiters.filter(r=>r.recruiter_id !== recruiterId)});
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
                        <TableCell align="center" className={classes.tableCellHeader}>score</TableCell>
                        <TableCell align="center" className={classes.tableCellHeader}>Assign</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {
                    this.state.recruiters.length === 0 ? 
                    <TableRow className={classes.tableRow}>
                        <TableCell colSpan={4} align="center" className={classes.tableCellHeader}>No Recruiters Assigned</TableCell>
                    </TableRow> :
                    this.state.recruiters.map((d, i)=>{
                        return <TableRow key={i} className={classes.tableRow}>
                            <TableCell className={classes.tableCell}>{d.first_name}</TableCell>
                            <TableCell className={classes.tableCell}>{d.last_name}</TableCell>
                            <TableCell className={classes.tableCell}>{Math.trunc(d.score*100)+"%"}</TableCell>
                            <TableCell className={classNames(classes.tableCell, classes.center)}>
                                <Button 
                                    variant="outlined"
                                    color="primary"
                                    onClick={()=>this.addRecruiter(d.recruiter_id)}>Assign</Button>
                            </TableCell>
                        </TableRow>
                    })
                }
                </TableBody>
            </Table>
        )
    }
}
 

export default withStyles(styles)(RecruiterView);
