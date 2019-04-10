import React from 'react';
import ApiCalls from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions';  
import './BuildActiveJobs.css';  
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import ExpandableRow from './ExpandableRow/ExpandableRow';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';  
import Close from '@material-ui/icons/Close';
  
const styles = theme => ({
    button:{ 
        width: "80%",
    },
    buttonContainer:{
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
class BuildActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            postId: props.obj.post_id,
            onClose: props.onClose,
            candidateList: []
        };
        this.Auth = new AuthFunctions();
    }
    componentDidMount = () => {
        this.getJobList();
    } 
    getJobList = () => {
        ApiCalls.get('/api/employerPostings/listCandidates/'+this.state.postId)
        .then((res)=>{
            if(res && res.data.success){
                this.setState({ candidateList: res.data.candidateList });
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    removeJob = () => {
        this.state.onClose();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this job.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) { 
                ApiCalls.post('/api/employerPostings/remove', {postId:this.state.postId})
                .then((res)=>{
                    if(res && res.data.success){
                        if(this.props.removedCallback != null){
                            this.props.removedCallback();
                        }
                        Swal.fire(
                            'Deleted!',
                            'Your job file has been deleted.',
                            'success'
                        )
                    }
                }).catch(errors => 
                    console.log(errors.response.data)
                )  
            } 
          })
    }
    render(){ 

        const { classes } = this.props; 

        const jobObj = this.props.obj; 
        return ( 
            <div className="activeJobContainer"> 
                <div className={classes.alertTitle} color="primary">
                    <span>{jobObj.title}</span>
                    <IconButton color="inherit" className={classes.alertClose} onClick={this.state.onClose}>
                        <Close />
                    </IconButton>
                </div>
                <div className="jobPostingContainer">
                    <p>{jobObj.caption}</p>
                    <h3>{jobObj.experience_type_name}</h3> 
                    {jobObj.tag_names?<p>Tags: {jobObj.tag_names.join(", ")}</p>:''}
                    <p>Created: {jobObj.created}</p>
                </div> 
                <div className="applicantsAppliedContainer">
                    {
                        this.state.candidateList.map((d, i)=>{
                            return <ExpandableRow obj={d} job={jobObj} key={i}/>
                        })
                    }
                </div>
                <div className={classes.buttonContainer}>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={this.removeJob.bind(this)}>Remove Job Posting</Button>
                </div>
            </div> 
        )
    }
}
 

export default withStyles(styles)(BuildActiveJobs);
