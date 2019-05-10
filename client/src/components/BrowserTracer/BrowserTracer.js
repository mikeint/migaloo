import React from 'react';
import {post} from '../../ApiCalls';  

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c==='x' ? r :((r&0x3)|0x8)).toString(16);
    });
    return uuid;
}
class BrowserTracer extends React.Component{
    componentDidMount = () => {
        var newUser = false;
        var uuid = localStorage.getItem('uuid');
        if(uuid == null){
            uuid = create_UUID()
            localStorage.setItem('uuid', uuid);
            newUser = true;
        }
        post('/api/landing/helloThere', {uuid:uuid, newUser:newUser}).then(()=>{}).catch(()=>{})
    }
    render(){
        return (
            <React.Fragment> 
            </React.Fragment>
        );
    }
};

export default BrowserTracer;