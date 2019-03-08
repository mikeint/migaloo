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
            <React.Fragment>
                <div className="alertTitle">Notifications</div>
                <div className='alertList'>
                    {this.props.alertList.map((item, i) => {
                        return <AlertItem key={i} alert={item}/>
                    })}
                </div>
            </React.Fragment>
        )
    }
}
 

export default BuildNotifications;