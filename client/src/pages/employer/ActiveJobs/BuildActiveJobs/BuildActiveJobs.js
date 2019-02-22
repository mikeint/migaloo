import React from 'react';
import axios from 'axios';
import AuthFunctions from '../../../../AuthFunctions';  
import './BuildActiveJobs.css';  
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'
import ExpandableRow from './ExpandableRow/ExpandableRow';
  
class BuildActiveJobs extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            postId: props.obj.post_id,
            candidateList: []
        };
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        this.getJobList();
    }
    getJobList = () => {
        axios.get('/api/postings/listCandidates/'+this.state.postId, this.axiosConfig)
        .then((res)=>{
            if(res.data.success){
                this.setState({ candidateList: res.data.candidateList });
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    removeJob = () => {



        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this job.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) { 
                axios.post('/api/postings/remove', {postId:this.state.postId}, this.axiosConfig)
                .then((res)=>{
                    if(res.data.success){
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

        const jobObj = this.props.obj; 
        return ( 
            <div className="activeJobContainer"> 
                <div className="jobPostingContainer">
                    <h2>{jobObj.title}</h2>
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
                <div className="button" onClick={this.removeJob.bind(this)}>Remove Job Posting</div>
            </div> 
        )
    }
}
 

export default BuildActiveJobs;