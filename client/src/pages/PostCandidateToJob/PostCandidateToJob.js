import React from 'react';
import './PostCandidateToJob.css'; 
import { Redirect } from 'react-router-dom';
import ApiCalls from '../../ApiCalls';  
import coin from '../../files/images/coin.png'

class PostCandidateToJob extends React.Component{
    constructor(props) {
        super(props);
        console.log(props.candidate, props.job)
        this.state = {   
            candidate: props.candidate,
            candidateId: props.candidate.candidate_id,
            job: props.job,
            postId: props.job.post_id,
            comment: '',
            coins:1,
            profileInfo: {}
        }
        this.getProfileInfo();
    }

    handleChange = (e) => {
        if(e.target.name === "coins"){
            var value = parseInt(e.target.value, 10);
            if(value > this.state.profileInfo.coins)
                e.target.value = this.state.profileInfo.coins;
            else if(value < 1)
                e.target.value = 1;
        }
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
        ApiCalls.post('/api/jobs/postCandidate', this.state)
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
    getProfileInfo = () => {
        ApiCalls.get('/api/recruiter/getProfile')
        .then((res)=>{    
            this.setState({ profileInfo: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
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
                <div className="pageHeading">Post a Candidate</div>
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
                                <div className="rowMargin"><span className="heading">Experience:</span> {this.state.candidate.experience_type_name || 'Not Specified'}</div>
                                <div className="rowMargin"><span className="heading">Salary:</span> {this.state.candidate.salary_type_name || 'Not Specified'}</div>
                                {this.state.candidate.tag_names && <div className="rowMargin"><span className="heading">Tags:</span> {this.state.candidate.tag_names.length === 0 ? 'Not Specified' : this.state.candidate.tag_names.join(", ")}</div>}
                                {this.state.candidate.resume_id != null && <div className="rowButton" onClick={this.getResumeURL}>View Resume</div>}
                            </div>
                        </div>
                        <div className="jobContainer">
                            <h3>Job</h3>
                            <div>
                                <div className="rowMargin">{this.state.job.title}</div>
                                <div className="rowMargin"><span className="heading">Experience:</span> {this.state.job.experience_type_name || 'Not Specified'}</div>
                                <div className="rowMargin"><span className="heading">Salary:</span> {this.state.job.salary_type_name || 'Not Specified'}</div>
                                {this.state.job.tag_names && <div className="rowMargin"><span className="heading">Tags:</span> {this.state.job.tag_names.length === 0 ? 'Not Specified' : this.state.job.tag_names.join(", ")}</div>}
                            </div>
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <div className="formSection">
                        <div className="input-2">
                            <div className="i-1-4 il">
                                <div className="user-input-wrp">
                                    <div className="numberCircle">
                                        <img className="numberCoin" src={coin} alt=""/>
                                        <span className="number">{this.state.profileInfo.coins}</span>
                                    </div>
                                </div>
                                <div className="user-input-wrp">
                                    <input
                                        id="coins"
                                        type="number"
                                        name="coins"
                                        required
                                        onChange={this.handleChange}
                                        value={this.state.coins}
                                        min="1"
                                        max={this.state.profileInfo.coins}
                                    />
                                    <span className="floating-label">Coins</span>
                                </div>
                                <div className="user-input-wrp">
                                    Coins Left After Posting: {`${this.state.profileInfo.coins} - ${this.state.coins} = ${this.state.profileInfo.coins - this.state.coins}`}
                                </div>
                            </div>
                            <div className="i-3-4">
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
                        </div>
                        <div className="submitCandidateBtn" onClick={this.handleSubmit}>Post Candidate</div>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default PostCandidateToJob;
