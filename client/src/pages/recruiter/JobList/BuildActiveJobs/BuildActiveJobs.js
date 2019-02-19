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
                <p>{jobObj.street_address_1}</p> 
                <p>{jobObj.street_address_2}</p> 
                <p>{jobObj.city+", "+jobObj.state+", "+jobObj.country}</p>

                <div className="applicantsAppliedContainer">
                <div className="apllicantApplied">Applicant 1</div>
                <div className="apllicantApplied">Applicant 2</div>
                <div className="apllicantApplied">Applicant 3</div>
                <div className="apllicantApplied">Applicant 4</div>
                <div className="apllicantApplied">Applicant 5</div>
                </div>
            </div> 
        )
    }
}
 

export default BuildActiveJobs;