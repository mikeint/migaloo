import React from 'react';
import './Hub.css';  
import AuthFunctions from '../../AuthFunctions';
import { Redirect } from 'react-router-dom';
//import axios from 'axios';
import NavBar from '../NavBar/NavBar';

class Hub extends React.Component{

    constructor(){
        super();
        this.state={ 
            logout: false, 
            searchTerm: '', 
        }
        this.Auth = new AuthFunctions();
    } 
 
    isSearched = searchTerm => item =>
        item.make.toLowerCase().includes(searchTerm.toLowerCase());
    
    onSearchChange = (event) => {
        console.log(event.target.value)
        this.setState({ searchTerm: event.target.value });
    } 
 
 
    render(){
        //console.log("HUBS PROPS: ", this.props)
        if(this.state.logout){ 
            return <Redirect to='/login'/>
        } 

        var listItem = "empty";

        return (
            <React.Fragment>
                <NavBar />
                <div className='mainContainer'>
                    <div className="userInfo">
                        <div className="userInfo_name">Name: {this.Auth.getUser().name}</div>
                        <div className="userInfo_email">Email:{this.Auth.getUser().email}</div>
                    </div> 
                    <form className='searcher'>
                        <input
                            name={name} 
                            placeholder="Search . . ."
                            type='text'
                            value={this.state.searchTerm}
                            onChange={this.onSearchChange}
                        />
                    </form>
                     
                    {listItem === "notEmpty" ? "" : <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>}
                </div>

            </React.Fragment>
        );
    }
};

export default Hub;
