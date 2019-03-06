import React from 'react';
import './BuildActiveJobs.css'; 
import ApiCalls from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import {Redirect} from 'react-router-dom';
import Overlay from '../../../../components/Overlay/Overlay';
import PostCandidateToJob from '../../../PostCandidateToJob/PostCandidateToJob';

import goldStar from '../../../../files/images/star_gold.png';
import blackStar from '../../../../files/images/star_black.png';
  
class BuildActiveJobs extends React.Component{

    constructor(props){
        super(props);
        this.state={ 
            user: {},
            profileImage: '',
            jobObj: props.jobData,
            redirectJob: false,
            showPostJob: false,
            overlayConfig: {direction: "b-t", swipeLocation: "t"}
        }
        this.Auth = new AuthFunctions();
    } 
    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() }, ()=>{
            this.getImage();
        });
    }

    getImage = () => {
        ApiCalls.get(`/api/profileImage/view/2/${this.state.jobObj.employer_id}/small`)
        .then((res)=>{
            if(res.data.success){
                this.setState({ profileImage: res.data.url }) 
            }else{
                this.setState({ profileImage: '' })
            }
        }).catch(errors => {
            this.setState({ profileImage: '' })
        })
    }
    searchJobsForCandidates = () => {
        this.setState({redirectJob:true})
    }
    postToJob = () =>{
        this.setState({showPostJob: true})
    }

    setFavourite = () => { 
        var element = document.getElementById("card-object");  
        if (element.classList === "favourite-flip" || element.classList === "favourite-flip flip-back") { 
            element.classList.remove("flip-back"); 
            element.classList.add("favourite-flip-scale"); 
        } else { 
            element.classList.remove("favourite-flip-scale");
            element.classList.add("flip-back");  
        }
    }


    render(){ 

        const jobObj = this.props.jobData; 

        return ( 
            <div className="jobPostingContainer">
                {this.state.redirectJob ? <Redirect to={'/recruiter/candidateList/'+this.props.jobData.post_id}/> : ''}
                {this.state.profileImage !== ''?<img className="profileImage" src={this.state.profileImage} alt="" onClick={this.showUpload}/>:''}
                <div className="jobTitle" onClick={this.setFavourite}>{jobObj.title} 
                
                 
                <div className="favourite-flip" id="card-object">
                    <div className="front face">
                        <div className="text"><img src={blackStar} alt="" /></div>
                    </div>
                    <div className="back face">
                        <div className="text"><img src={goldStar} alt="" /></div>
                    </div>
                </div>
                
                
                </div>
                <div className="jobCaption">{jobObj.caption}</div>
                <h3>{jobObj.company_name}</h3>
                <p>
                    {jobObj.street_address_1}<br/>
                    {jobObj.street_address_2}<br/>
                    {jobObj.city+", "+jobObj.state+", "+jobObj.country}
                </p>
                <h5>Experience: {jobObj.experience_type_name}</h5> 
                <h5>Salary: {jobObj.salary_type_name}</h5> 
                {jobObj.tag_names?<p>Tags: {jobObj.tag_names.join(", ")}</p>:''}
                <p>Posted: {jobObj.posted}</p>
                <div className="rowButton" onClick={this.searchJobsForCandidates}>Search For Candidates</div>
                {this.props.candidateData && <div className="rowButton" onClick={this.postToJob}>Post Candidate to Job</div>}
                {this.state.showPostJob && <Overlay
                                                html={<PostCandidateToJob candidate={this.props.candidateData} job={this.props.jobData} handleClose={()=>this.setState({showPostJob:false})} />}  
                                                handleClose={()=>this.setState({showPostJob:false})} 
                                                config={this.state.overlayConfig}
                                            />}
            </div> 
        )
    }
}
 

export default BuildActiveJobs;