import React from 'react';
import './Loader.css';    

class Loader extends React.Component{ 

    render(){  
        return (
            <React.Fragment>  
                <svg className="whaleWater" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" version="1.1">
                    <g className="whale-container" fill="none" stroke={this.props.sprayColor} strokeLinecap="round" strokeLinejoin="round"> 
                        <g className="sprays">
                            <path className="spray-1" d="M54 27C53 21 51 16.5 46.5 16.5 42.9 16.5 42.5 19.5 42.5 19.5"/>
                            <path className="spray-2" d="M53.5 27.5L53.5 18C53.5 8.5 51.5 4 47 4 44 4 42.5 6.5 42.5 8.5 42.5 10 43.5 12.5 46 12.5 48 12.5 48.5 11 48.5 10 48.5 7.5 46 7.5 45.5 8.5"/>
                            <path className="spray-3" d="M54.4 27.2C54 15.5 56.5 3 48.5 0.5"/>
                            <path className="spray-4" d="M55.5 27C55.5 27 56 15 56.5 10 57 5 59.5 1.5 63.5 1.5 67.5 1.5 68.5 3.5 68.5 3.5"/>
                            <path className="spray-5" d="M55.5 27C55.5 27 56.5 20 57.5 14.5 58.5 9 61 7.5 63.5 7.5 66 7.5 67 9 67 10.5 67 12 66 13.5 64.5 13.5 63 13.5 62.5 12.5 62.5 12 62.5 11 63 10.5 63.5 10.5"/>
                            <path className="spray-6" d="M55.5 27C55.5 22 62.5 11 70.5 19"/>
                            <path className="spray-7" d="M55.5 27C55.5 21.5 61.5 18.5 66 21"/>
                        </g> 
                    </g> 
                </svg> 
            </React.Fragment>
        );
    }
};

export default Loader;
