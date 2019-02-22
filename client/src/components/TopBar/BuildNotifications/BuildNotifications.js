import React from 'react'; 
import './BuildNotifications.css';     
import AlertItem from '../../AlertItem/AlertItem'; 

class BuildNotifications extends React.Component{

    constructor() {
        super();
		this.state = { 
        }; 
    }
   
    render(){ 
 
        return ( 
            <div className='alertList'>
                {this.props.alertList.map((item, i) => {
                    return <AlertItem key={i} alert={item}/>
                })}
            </div>
        )
    }
}
 

export default BuildNotifications;