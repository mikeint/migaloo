import React from 'react';
import './PostCandidateToJob.css'; 
import { Redirect } from 'react-router-dom';
import {get, post} from '../../ApiCalls';  
//import coin from '../../files/images/coin.png'
import TextField from '@material-ui/core/TextField';
//import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    postButton:{
        width:"100%",
        marginTop: "20px"
    },
    textArea:{
        width:"100%"
    },
    rightBtn:{
        marginLeft: 'auto', 
    }
})
class PostCandidateToJob extends React.Component{
    constructor(props) {
        super(props);
        this.state = {   
            candidate: props.candidate,
            candidateId: props.candidate.candidate_id,
            job: props.job,
            handleClose: this.props.handleClose,
            postId: props.job.post_id,
            comment: '',
            // coins:1,
            profileInfo: {},
            candidateSubmitted: false,
        }
    }

    componentDidMount = () => {
        this.getProfileInfo();
    } 
    handleChange = (e) => {
        // if(e.target.name === "coins"){
        //     var value = parseInt(e.target.value, 10);
        //     if(value > this.state.profileInfo.coins)
        //         e.target.value = this.state.profileInfo.coins;
        //     else if(value < 1)
        //         e.target.value = 1;
        // }
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
        post('/api/recruiterJobs/postCandidate', this.state)
        .then((res) => {
            // THIS IS getting messy, its to shut the overlay after submitting a new candidate.
            // TO-DO (not here) show the added candidate behind overlay
            if(res && res.data.success) {
                this.setState({candidateSubmitted: true})
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    dialogClose(){
        this.state.handleClose();
    }
    getProfileInfo = () => {
        get('/api/recruiter/getProfile')
        .then((res)=>{    
            if(res == null) return
            this.setState({ profileInfo: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    getResumeURL = () => {
        get('/api/resume/view/'+this.props.candidateData.candidate_id)
        .then((res)=>{
            if(res && res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }

    render(){
        const { classes } = this.props;

        if (this.state.candidateSubmitted) return <Redirect to={`/recruiter/jobList/${this.state.candidateId}`} /> 

        return (
            <React.Fragment> 
                <div className="pageHeading">
                    Post a Candidate
                    <IconButton color="inherit" onClick={this.dialogClose.bind(this)} className={classes.rightBtn}>
                        <Close color="primary"/>
                    </IconButton>
                </div>
                <div className="postACandidateContainer">
                    {this.state.candidate.tag_score?<span className="matchingScore">
                        <span className="matchingScoreText">Match Score</span>
                        <span className="matchingScoreValue">{parseInt(this.state.candidate.tag_score, 10)+"%"}</span> 
                    </span>:''}
                    <div className="candidateJobContainer">
                        <div className="candidateContainer">
                            <h3>Candidate</h3>
                            <div>
                                <div className="rowMargin">{this.state.candidate.first_name} {this.state.candidate.last_name}</div>
                                <div className="rowMargin"><span className="heading">Experience:</span> {this.state.candidate.experience_years || 'Not Specified'}</div>
                                <div className="rowMargin"><span className="heading">Salary:</span> {this.state.candidate.salary_type_name || 'Not Specified'}</div>
                                {this.state.candidate.tag_names && <div className="rowMargin"><span className="heading">Tags:</span> {this.state.candidate.tag_names.length === 0 ? 'Not Specified' : this.state.candidate.tag_names.join(", ")}</div>}
                                {this.state.candidate.resume_id != null && <div className="rowButton" onClick={this.getResumeURL}>View Resume</div>}
                            </div>
                        </div>
                        <div className="jobContainer">
                            <h3>Job</h3>
                            <div>
                                <div className="rowMargin">{this.state.job.title}</div>
                                <div className="rowMargin"><span className="heading">Experience:</span> {this.state.job.experience_years || 'Not Specified'}</div>
                                <div className="rowMargin"><span className="heading">Salary:</span> {this.state.job.salary_type_name || 'Not Specified'}</div>
                                {this.state.job.tag_names && <div className="rowMargin"><span className="heading">Tags:</span> {this.state.job.tag_names.length === 0 ? 'Not Specified' : this.state.job.tag_names.join(", ")}</div>}
                            </div>
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <div className="formSection">
                        <div className="input-2">
                            <div>
                                <TextField
                                    name="comment"
                                    label="Comment"
                                    multiline={true}
                                    className={classes.textArea}
                                    placeholder="A comment regarding the candidate"
                                    rowsMax={7}
                                    rows={7}
                                    required
                                    onBlur={this.handleChange}
                                    margin="normal"
                                    variant="outlined"
                                />
                            </div>
                        </div>
                        <Button 
                            variant="contained"
                            color="secondary"
                            className={classes.postButton}
                            onClick={this.handleSubmit}>
                            Post Candidate
                        </Button>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default withStyles(styles)(PostCandidateToJob);  
