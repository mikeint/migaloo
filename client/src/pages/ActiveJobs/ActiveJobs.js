import React from 'react';
import './ActiveJobs.css';    
import NavBar from '../../components/NavBar/NavBar';
import TopBar from '../../components/TopBar/TopBar';
import Loader from '../../components/Loader/Loader';

class ActiveJobs extends React.Component{
 
    render(){  
        var listItem = "empty";  

        return (
            <React.Fragment>
                <NavBar />
                <TopBar />
               
                <div className='mainContainer'>
                    Active Jobs
                    {listItem === "notEmpty" ? "" : <Loader />}
                </div> 
            </React.Fragment>
        );
    }
};

export default ActiveJobs;
