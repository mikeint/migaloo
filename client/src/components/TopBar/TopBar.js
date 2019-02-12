import React from 'react';
import './TopBar.css';    

class TopBar extends React.Component{ 

    render(){  
        return (
            <React.Fragment>
                <div className="topBar">
                    <div className="topBarLogo">HR</div>
                </div> 
            </React.Fragment>
        );
    }
};

export default TopBar;
