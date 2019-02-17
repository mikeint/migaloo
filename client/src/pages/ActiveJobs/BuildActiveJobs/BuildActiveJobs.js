import React from 'react';
import './BuildActiveJobs.css'; 
 
  
class BuildActiveJobs extends React.Component{

    render(){ 

        const jobObj = this.props.obj; 

        return ( 
            <div className="jobPostingContainer">
                <div className="jobPostTitle">{jobObj.title}</div>
                <div className="jobPostParagraph">{jobObj.paragraph}</div>
                <div className="jobPostLocation">{jobObj.location}</div> 
            </div> 
        )
    }
}
 

export default BuildActiveJobs;