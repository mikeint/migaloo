import React from 'react';
import './BuildActiveJobs.css'; 
import axios from 'axios';
import AuthFunctions from '../../../../AuthFunctions'; 
import {Redirect} from 'react-router-dom';
 
  
class BuildActiveJobs extends React.Component{

    constructor(props){
        super(props);
        this.state={ 
            user: {},
            profileImage: '',
            jobObj: props.obj,
            redirectJob: false
        }
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
    } 
    componentWillMount = () => {
        this.setState({ user: this.Auth.getUser() }, ()=>{
            this.getImage();
        });
    }

    getImage = () => {
        axios.get(`/api/profileImage/view/2/${this.state.jobObj.employer_id}/small`, this.axiosConfig)
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
        console.log('/recruiter/candidateList/'+this.props.obj.post_id)
        this.setState({redirectJob:true})
    }
    render(){ 

        const jobObj = this.props.obj; 

        return ( 
            <div className="jobPostingContainer">
                {this.state.redirectJob ? <Redirect to={'/recruiter/candidateList/'+this.props.obj.post_id}/> : ''}
                {this.state.profileImage !== ''?<img className="profileImage" src={this.state.profileImage} alt="" onClick={this.showUpload}/>:''}
                <h2>{jobObj.title}</h2>
                <p>{jobObj.caption}</p>
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
                <div className="rowButton" onClick={this.searchJobsForCandidates}>Search Jobs</div>
            </div> 
        )
    }
}
 

export default BuildActiveJobs;