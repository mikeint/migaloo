import React from 'react';
import './ActiveJobs.css';    
import NavBar from '../../components/NavBar/NavBar';
import TopBar from '../../components/TopBar/TopBar';

class ActiveJobs extends React.Component{
 
    render(){  
        var listItem = "empty";  

        return (
            <React.Fragment>
                <NavBar />
                <TopBar />
               
                <div className='mainContainer'>
                    Active Jobs
                    {listItem === "notEmpty" ? "" : <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>}
                </div> 
            </React.Fragment>
        );
    }
};

export default ActiveJobs;
