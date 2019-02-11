import React from 'react';
import './Loader.css';    

class Loader extends React.Component{ 

    render(){  
        return (
            <React.Fragment> 
                    <div className="loadingContainer">
                        <div className="loadContainer">
                            <div className="load-shadow"></div>
                            <div className="load-box"></div>
                        </div>
                    </div> 
            </React.Fragment>
        );
    }
};

export default Loader;
