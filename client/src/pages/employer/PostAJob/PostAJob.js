import React from 'react';
import './PostAJob.css';   
import NavBar from '../../../components/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';

class PostAJob extends React.Component{ 
 

    render(){   
        return (
            <React.Fragment>
                <NavBar />
                 <TopBar />

                <div className='mainContainer'>
                    <div className="pageHeading">Post a job</div>
                </div> 
            </React.Fragment>
        );
    }
};

export default PostAJob;
