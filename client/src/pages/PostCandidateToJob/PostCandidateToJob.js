import React from 'react';
import './PostCandidateToJob.css'; 
import { Redirect } from 'react-router-dom';
import ApiCalls from '../../ApiCalls';  

class PostCandidateToJob extends React.Component{
    constructor(props) {
        super(props);
        this.state = {   
            candidate: props.candidate,
            job: props.job,
            comment: ''
        }
        console.log(props.candidate)
        console.log(props.job)
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
        ApiCalls.post('/api/candidate/create', this.state)
        .then((res) => {

            // THIS IS getting messy, its to shut the overlay after submitting a new candidate.
            // TO-DO (not here) show the added candidate behind overlay
            if(res.data.success) {
                document.querySelector(".menu").classList.add("menu--animatable");	 
                document.querySelector(".menu").classList.remove('menu--visible');
                return <Redirect to='/candidateList' /> // why cant i do this...?
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    getResumeURL = () => {
        ApiCalls.get('/api/resume/view/'+this.props.candidateData.candidate_id)
        .then((res)=>{
            if(res.data.success)
                window.open(res.data.url, '_blank');
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }

    render(){   
        return (
            <React.Fragment> 
                {/* this.state.redirect ? <Redirect to='/recruiter/candidateList' /> : '' */}
                <div className='mainContainer'>
                    <div className="pageHeading">Post a Candidate</div>
                    <div className="postACandidateContainer">
                        {this.state.candidate.tag_score?<span className="matchingScore">
                            <span className="matchingScoreText">Match Score<br/>{parseInt(this.state.candidate.tag_score, 10)+"%"}</span>
                        </span>:''}
                        <div className="candidateJobContainer">
                            <div className="candidateContainer">
                                <h3>Candidate</h3>
                                <div>
                                    <div className="rowMargin">{this.state.candidate.first_name} {this.state.candidate.last_name}</div>
                                    <div className="rowMargin"><span className="heading">Experience:</span> {this.state.candidate.experience_type_name}</div>
                                    {this.state.candidate.tag_names && <div className="rowMargin"><span className="heading">Tags:</span> {this.state.candidate.tag_names.join(", ")}</div>}
                                    {this.state.candidate.resume_id != null && <div className="rowButton" onClick={this.getResumeURL}>View Resume</div>}
                                </div>
                            </div>
                            <div className="jobContainer">
                                <h3>Job</h3>
                                <div>
                                    <div className="rowMargin">{this.state.job.title}</div>
                                    <div className="rowMargin"><span className="heading">Experience:</span> {this.state.job.experience_type_name}</div>
                                    {this.state.job.tag_names && <div className="rowMargin"><span className="heading">Tags:</span> {this.state.job.tag_names.join(", ")}</div>}
                                </div>
                            </div>
                        </div>
                        <br/>
                        <br/>
                        <div className="formSection">
                            <div className="i-2">
                                <div className="user-input-wrp">
                                    <textarea
                                        id="comment"
                                        type="text"
                                        name="comment"
                                        required
                                        onChange={this.handleChange}
                                        value={this.state.comment}
                                    />
                                    <span className="floating-label">Comment</span>
                                </div>
                            </div>
                            <div className="submitCandidateBtn" onClick={this.handleSubmit}>Post Candidate</div>
                        </div>
                    </div> 
                </div>

            </React.Fragment>
        );
    }
};

export default PostCandidateToJob;
