import React from 'react';
import './BuildActiveJobs.css'; 
 
  
class BuildActiveJobs extends React.Component{

    render(){ 

        const jobObj = this.props.obj; 

        return ( 
            <div className="jobPostingContainer">
                <h2>{jobObj.title}</h2>
                <p>{jobObj.caption}</p>
                <h3>{jobObj.experience_type_name}</h3> 
                <p>{jobObj.company_name}</p> 
                <p>{jobObj.image_id}</p> 
                <p>
                    {jobObj.street_address_1}<br/>
                    {jobObj.street_address_2}<br/> 
                    {jobObj.city+", "+jobObj.state+", "+jobObj.country}
                </p>

                {jobObj.tag_names?<p>Tags: {jobObj.tag_names.join(", ")}</p>:''}
                <p>Posted: {jobObj.posted}</p>

            </div> 
        )
    }
}
 

export default BuildActiveJobs;