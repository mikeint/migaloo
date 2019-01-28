import React from 'react';
import './AddCar.css'; 
import { Redirect} from "react-router-dom";
import axios from 'axios';
import AuthFunctions from '../../AuthFunctions';
import NavBar from '../NavBar/NavBar';
 
import 'sweetalert2/src/sweetalert2.scss'; 
import Swal from 'sweetalert2/dist/sweetalert2.all.min.js'

class AddCar extends React.Component{

    constructor(props){
        super(props);
        this.state={
            make: '',
            model: '',
            year: '',
            in_color: '',
            ex_color: '',  
            km: '',
            body_type: '', 
            transmission: '',
            drivetrain: '',  
            fuel_type: '',
            doors: '',
            engine: '',
            cylinders: '',
            VIN: '',
            price: '', 
            description: '',
            sold: '',

            data_id: '', 
            thumbnail: '',
            default_img: '',  
            errors: '', 

            images: '',
        };
        this.Auth = new AuthFunctions();
    } 
    
	componentDidMount = () => {
        this.getCarImgs();
        this.setInputFields();
        this.getCarId();
    }
    

    getCarId = () => {
        return localStorage.getItem("car_id");
    }

    handleChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

 
	getCarImgs = () => {
        var params = { params: { car_id: this.getCarId() } }
        
		axios.get('/api/cars/getImgs', params)
          .then((res)=>{
			//console.log(res.data)
			//return window.location = "/hub";
			this.setState({
				images: res.data
			})
		})
    }
    setInputFields = () => {
        var params = { params: { car_id: this.getCarId() } } 

        axios.get('/api/cars/getCarData', params)
        .then(res => {
            console.log(res.data[0])
            var data=res.data[0];
            this.setState({ 
                make: data.make || "",
                model: data.model || "",
                year: data.year || "",
                in_color: data.in_color || "",
                ex_color: data.ex_color || "",
                km: data.km || "",
                body_type: data.body_type || "",
                transmission: data.transmission || "",
                drivetrain: data.drivetrain || "",
                fuel_type: data.fuel_type || "",
                doors: data.doors || "",
                engine: data.engine || "",
                cylinders: data.cylinders || "",
                VIN: data.VIN || "",
                price: data.price || "",
                description: data.description || "", 
                sold: data.sold || ""
            }); 

        })
        .catch(function (error) {
          console.log(error);
        })
    }



	addCarImg = () => {
		var input = document.querySelector('input[type="file"]').files[0];
		const data = new FormData(); 
		data.append('action', 'ADD');
		data.append('param', 0);
		data.append('secondParam', 0);
        data.append('carid', this.getCarId());
        data.append('file', input, { type: 'multipart/form-data' });
        

		if (input) {
			axios.post('/api/cars/addCarImg', data).then((response) => {
				console.log(response)
				this.getCarImgs();
			});
		}
		this.clearFileInput("file");
	} 
	clearFileInput = (id) => { 
		var oldInput = document.getElementById(id);  
		var newInput = document.createElement("input");  
		newInput.type = "file"; 
		newInput.id = oldInput.id; 
		newInput.name = oldInput.name; 
		newInput.className = oldInput.className; 
		newInput.style.cssText = oldInput.style.cssText; 
		// TODO: copy any other relevant attributes 

		oldInput.parentNode.replaceChild(newInput, oldInput); 
    }
    deleteOneCarImg = (id) => {
		axios.delete('/api/cars/removeImg/'+id).then((response) => {
			console.log(response)
			this.getCarImgs();
		}); 
    }
    

    /* INPUT TEXT */
    addCar = () => {

        Swal({
            title: 'Are you sure?',
            text: "You can edit this car later", 
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!'
        }).then((result) => {
            if (result.value) {
 
                var config = {
                    headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
                }; 
                var bodyParameters = {
                    make: this.state.make,
                    model: this.state.model,
                    year: this.state.year,
                    in_color: this.state.in_color,
                    ex_color: this.state.ex_color, 
                    km: this.state.km,
                    body_type: this.state.body_type,
                    transmission: this.state.transmission,
                    drivetrain: this.state.drivetrain,
                    fuel_type: this.state.fuel_type,
                    engine: this.state.engine, 
                    doors: this.state.doors, 
                    cylinders: this.state.cylinders, 
                    VIN: this.state.VIN, 
                    price: this.state.price, 
                    description: this.state.description, 
                    sold: this.state.sold,
                    car_id: localStorage.getItem('car_id')
                }
                axios.post(
                    '/api/cars/addCar',
                    bodyParameters,
                    config
                ).then((res)=>{
                    console.log("car added: ", res.data);
                    localStorage.removeItem("car_id");
                    return window.location = "/#/hub";
                }).catch(error => {
                    console.log(error.response.data.join(".\n"));
 
                    Swal({
                        title: "Some errors here:",
                        text: error.response.data.join(".\n"),
                        type: 'error',
                        animation: true,
                        customClass: 'animated tada'
                    }) 
                });
            }
        }) 
    }

    deleteFullCar = () => {
        
        Swal({
            title: 'Are you sure you want to remove this car and all its images?', 
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.value) {
                var config = {
                    headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
                }; 
                var bodyParameters = {
                    car_id: this.getCarId(), 
                }
                axios.post('/api/cars/deleteFullCar', bodyParameters, config)
                .then((res)=>{
                    console.log("car added: ", res.data);
                    localStorage.removeItem("car_id");
                    return window.location = "/#/hub";
                })
            }
        })
    }

    makePrime = (filename) => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }; 
        var bodyParameters = {
            car_id: this.getCarId(),
            filename: filename,
        }
        axios.post('/api/cars/makePrime', bodyParameters, config)
        .then((res)=>{
            console.log("prime changes: ", res); 
            this.getCarImgs();
        })
    }

    handleSold = () => {

        if (this.state.sold === "sold")this.setState({ sold: "sale" })
        else this.setState({ sold: "sold" })

        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        };
        var bodyParameters = {
            car_id: this.getCarId(), 
        }
        axios.post('/api/cars/toggleCarSold', bodyParameters, config).then((res)=>{
            //console.log("for what?: ", this.state.sold);
        })
    }
 
    render(){    
        if(this.state.logout){
            return <Redirect to='/login'/>
        }

        if (this.state.images) {
			var images = this.state.images.map((image, i) => (
				<div key={i} className="imgContainer">
                    <div className="primeImgBtn" onClick={() => this.makePrime(image.filename)}>
                        {image.metadata.primeImg === "yes" ? <div className="primeBanner">Prime Image</div> : ""}
                        <img id={image._id} className="imgStyle" src={"/api/cars/image/" + image.filename} alt={"img"+i} /> 
                          
                    </div>
					<div className="deleteImgBtn" onClick={() => this.deleteOneCarImg(image._id)}>Delete</div>
				</div>
			))
        }
        
        return (
            
            <React.Fragment>
                <NavBar 
                    deleteFullCar={this.deleteFullCar}
                    deleteButton={true}
                />  


                <div className="addImgContainer">
                    {images ? images : <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>}
                    <div className="imgContainer">  
                        <div className="custom-file mb-3">
                            <input type="file" name="file" id="file" /> 
                        </div>
                        <div className="submitImg" onClick={this.addCarImg}>+</div>
                    </div>
                </div>
                


                <div className="addCarContainer">
                    <div className="inputContainer">
                        <input
                            name='make'
                            type='text'
                            placeholder='Make'
                            className='form-control'
                            onChange={this.handleChange}
                            value={this.state.make}
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            name='model'
                            type='text'
                            placeholder='Model'
                            className='form-control'
                            onChange={this.handleChange}
                            value={this.state.model}
                        />
                    </div> 
                    <div className="inputContainer inputPad">
                        <input
                            name='year'
                            type='text'
                            placeholder='Year'
                            className='form-control'
                            onChange={this.handleChange}
                            value={this.state.year}
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            name='in_color'
                            type='text'
                            placeholder='Interior Color'
                            className='form-control'
                            onChange={this.handleChange}
                            value={this.state.in_color}
                        />
                    </div>
                    <div className="inputContainer inputPad">
                        <input
                            name='ex_color'
                            type='text'
                            placeholder='Exterior Color'
                            className='form-control'
                            onChange={this.handleChange}
                            value={this.state.ex_color}
                        />
                    </div> 
                    <div className="inputContainer">
                        <input
                            name='km'
                            type='text'
                            placeholder='Kilometers'
                            className='form-control'
                            onChange={this.handleChange}
                            value={this.state.km}
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            name='body_type'
                            type='text'
                            className='form-control'
                            placeholder='Body Type'
                            onChange={this.handleChange}
                            value={this.state.body_type}
                        />
                    </div>  
                    <div className="inputContainer">
                        <input
                            name='transmission'
                            type='text'
                            className='form-control'
                            placeholder='Transmission'
                            onChange={this.handleChange}
                            value={this.state.transmission}
                        />
                    </div>
        
                    <div className="inputContainer">
                        <input
                            name='drivetrain'
                            type='text'
                            className='form-control'
                            placeholder='Drivetrain'
                            onChange={this.handleChange}
                            value={this.state.drivetrain}
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            name='fuel_type'
                            type='text'
                            className='form-control'
                            placeholder='Fuel Type'
                            onChange={this.handleChange}
                            value={this.state.fuel_type}
                        />
                    </div> 
                    <div className="inputContainer">
                        <input
                            name='engine'
                            type='text'
                            className='form-control'
                            placeholder='Engine'
                            onChange={this.handleChange}
                            value={this.state.engine}
                        />
                    </div>
                    <div className="inputContainer inputPad">
                        <input
                            name='cylinders'
                            type='text'
                            className='form-control'
                            placeholder='Cylinders'
                            onChange={this.handleChange}
                            value={this.state.cylinders}
                        />
                    </div>

                    <div className="inputContainer">
                        <input
                            name='doors'
                            type='text'
                            className='form-control'
                            placeholder='Doors'
                            onChange={this.handleChange}
                            value={this.state.doors}
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            name='VIN'
                            type='text'
                            className='form-control'
                            placeholder='VIN'
                            onChange={this.handleChange}
                            value={this.state.VIN}
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            name='price'
                            type='text'
                            className='form-control'
                            placeholder='Price'
                            onChange={this.handleChange}
                            value={this.state.price}
                        />
                    </div>
                    <div className="inputContainer">
                        <input
                            name='description'
                            type='textarea'
                            className='form-control'
                            placeholder='Description'
                            onChange={this.handleChange}
                            value={this.state.description}
                        />
                    </div>
                    <div className="inputContainer">
                        <div className={this.state.sold === "sold" ? "formSoldBtn active" : "formSoldBtn"} onClick={() => this.handleSold(this.state.sold)}>Sold</div>
                    </div>
                </div> 

                <div className='createBtnContainer'>
                    <div className='createBtn' onClick={this.addCar}>
                        <a target="_blank">Save</a>
                    </div>
                </div> 
            </React.Fragment>
        );
    }
};

export default AddCar;
