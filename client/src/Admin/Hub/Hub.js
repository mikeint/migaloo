import React from 'react';
import './Hub.css';  
import AuthFunctions from '../../AuthFunctions';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../NavBar/NavBar';

class Hub extends React.Component{

    constructor(props){
        super(props);
        this.state={ 
            logout: false,
            user: '',
            carList: '',
            searchTerm: '',
            tabState: '1',
        }
        this.Auth = new AuthFunctions();
    }
 

    componentDidMount = () => { 
        this.setCarList();
    }

    setCarList = () => {
        axios.get('/api/cars/carList')
        .then(res => {
            this.setState({
                carList: res.data
            });
            console.log("CARS OBJ-->", this.state.carList);
        })
        .catch(function (error) {
          console.log(error);
        }) 
    } 
    setCarSoldList = () => {
        axios.get('/api/cars/carSoldList')
        .then(res => {
            this.setState({
                carList: res.data
            });
            console.log("CARS OBJ-->", this.state.carList);
        })
        .catch(function (error) {
          console.log(error);
        }) 
    } 
    setCarId = (id) => {
        console.log(id);
        localStorage.setItem("car_id", id);
    } 

    isSearched = searchTerm => item =>
        item.make.toLowerCase().includes(searchTerm.toLowerCase());
    
    onSearchChange = (event) => {
        //console.log(event.target.value)
        this.setState({ searchTerm: event.target.value });
    } 

    changeTab = (tab) => {
        this.setState({ 
            tabState: tab
        });
        if (tab === "1") this.setCarList();
        if (tab === "2") this.setCarSoldList();
    }
 
    render(){
        //console.log("HUBS PROPS: ", this.props)
        if(this.state.logout){
            return <Redirect to='/login'/>
        }
   

        const cars = 
        this.state.carList ?
        this.state.carList.filter(this.isSearched(this.state.searchTerm)).map((car, i) => ( 

            <Link to="/addCar" key={car._id}>
                <div className="hub shadowEffect" onClick={() => this.setCarId(car._id)}>
                    <div className="adminPrimeImg"><img className="imgStyle" src={"/api/cars/image/" + car.primeImg} alt={"img"+i} /></div>
                    <div className="adminCarMake">{car.make}</div> 
                </div>
            </Link>
        )) : "" ;
             

        return (
            <React.Fragment>
                <NavBar deleteButton={false} />  
                <div className="userInfo">
                    <div className="userInfo_name">Name: {this.props.user.name}</div>
                    <div className="userInfo_email">Email:{this.props.user.email}</div>
                </div> 
  
                <div className='adminCarContainer'>
                    <div id="tabContainer" className="tabContainer">
                         <div className={this.state.tabState==="1" ? "tab-item active" : "tab-item"} onClick={() => this.changeTab("1")}>SALE</div>
                         <div className={this.state.tabState==="2" ? "tab-item active" : "tab-item"} onClick={() => this.changeTab("2")}>SOLD</div>
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
                     
                    {cars ? cars : <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>}
                </div>

            </React.Fragment>
        );
    }
};

export default Hub;
