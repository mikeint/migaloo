import React from 'react';
import './Hub.css';  
import AuthFunctions from '../../AuthFunctions';
import { Redirect } from 'react-router-dom';
//import axios from 'axios';
import NavBar from '../NavBar/NavBar';

class Hub extends React.Component{

    constructor(props){
        super(props);
        this.state={ 
            logout: false,
            user: '', 
            searchTerm: '',
            tabState: '1',
        }
        this.Auth = new AuthFunctions();
    }
 

    componentDidMount = () => { 
        
    } 
    isSearched = searchTerm => item =>
        item.make.toLowerCase().includes(searchTerm.toLowerCase());
    
    onSearchChange = (event) => {
        //console.log(event.target.value)
        this.setState({ searchTerm: event.target.value });
    } 
 
 
    render(){
        //console.log("HUBS PROPS: ", this.props)
        if(this.state.logout){
            return <Redirect to='/login'/>
        } 

        var listItem = {};

        return (
            <React.Fragment>
                <NavBar deleteButton={false} />  
                <div className="userInfo">
                    <div className="userInfo_name">Name: {this.props.user.name}</div>
                    <div className="userInfo_email">Email:{this.props.user.email}</div>
                </div> 
  
                <div className='adminCarContainer'> 
                    <form className='searcher'>
                        <input
                            name={name} 
                            placeholder="Search . . ."
                            type='text'
                            value={this.state.searchTerm}
                            onChange={this.onSearchChange}
                        />
                    </form>
                     
                    {listItem ? "" : <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>}
                </div>

            </React.Fragment>
        );
    }
};

export default Hub;
