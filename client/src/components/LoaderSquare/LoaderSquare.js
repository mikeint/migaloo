import React from 'react';
import './LoaderSquare.css';    

class LoaderSquare extends React.Component{ 

    render(){  
        return (
            <React.Fragment>  
                    <div className="loadContainer">
                        <div className="load-shadow"></div>
                        <div className="load-box"></div>
                    </div> 
            </React.Fragment>
        );
    }
};

export default LoaderSquare;
