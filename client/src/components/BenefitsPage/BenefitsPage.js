import React from 'react';
import {get} from '../../ApiCalls';  
import {Table, Checkbox, Button, TableBody, TableCell, TableRow} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';  

const styles = theme => ({
    center:{
        textAlign:"center"
    },
    button:{
        marginLeft:"auto",
        marginRight:"auto",
        width: "80%",
        marginBottom: 20
    },
    checkBox:{
        padding: 0
    },
    row:{
        height: 0
    }
});
class BenefitsPage extends React.Component{
    constructor(props) {
        super(props);
        // Initial state
        this.state = { 
            benefits: []
        };
    }
    componentDidMount = () => {
        get('/api/autocomplete/benefits')
        .then((res)=>{
            if(res && res.data.success){
                this.setState({benefits: res.data.benefits.map(d=>{d.checked = false; return d;})})
            }
        }).catch((e)=>{})
    }
    handleCheckboxChange = (id, group, c) => {
        const benefits = this.state.benefits;
        benefits.forEach(d=>{
            if(id === d.benefitsId){
                d.checked = c;
            }else if(d.groupNum != null && d.groupNum === group && c){
                d.checked = false;
            }
        })
        this.setState({benefits:benefits});
    }
    render(){
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Table className={classes.tableBody}>
                    <TableBody>
                        {
                            this.state.benefits.map((d, i)=>{
                                return <TableRow key={i} className={classes.tableRow} classes={{root:classes.row}}>
                                    <TableCell className={classes.tableCell}>{d.benefitsName}</TableCell>
                                    <TableCell className={classes.tableCell}>
                                        <Checkbox
                                            classes={{root:classes.checkBox}}
                                            onChange={(e,c)=>this.handleCheckboxChange(d.benefitsId, d.groupNum, c)}
                                            checked={d.checked}/>
                                    </TableCell>
                                </TableRow>
                            })
                        }
                    </TableBody>
                </Table>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={()=>1}>Save</Button>
            </React.Fragment>
        )
    }
};
export default withStyles(styles)(BenefitsPage);