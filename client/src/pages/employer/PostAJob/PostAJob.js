import React from 'react';
import './PostAJob.css'; 
import { Redirect } from 'react-router-dom';

import AuthFunctions from '../../../AuthFunctions'; 
import NavBar from '../../../components/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';

import axios from 'axios';

class PostAJob extends React.Component{
    constructor() {
        super();
        this.state = {   
            title:'',
            caption:'',
            experience_type_name:'',
            compensation:'',
        }
        this.Auth = new AuthFunctions();
    }
 
    componentDidMount() {
        window.scrollTo(0, 0); 
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleSubmit = () => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        axios.post('/api/postings/create', this.state, config)
        .then((res) => { 
            if(res.data.success) return <Redirect to='/activeJobs' />
        })

        .catch(error => {
            console.log(error);
            document.getElementById("registration_popup").style.display = "block"
        });
    }



    render(){   
        return (
            <React.Fragment>
                <NavBar />
                 <TopBar />

                <div className='mainContainer'>
                    <div className="pageHeading">Post a job</div>
                    <div className="postAJobContainer">
                        <div className="formSection">  
                            <div className="input-2">
                                <div className="i-2 il">
                                    <div className="user-input-wrp">
                                        <input
                                            id="title"
                                            type="text"
                                            name="title"
                                            required
                                            onChange={this.handleChange}
                                            value={this.state.title}
                                        />
                                        <span className="floating-label">Title</span>
                                    </div>
                                </div>
                                <div className="i-2">
                                    <div className="user-input-wrp">
                                        <textarea
                                            id="caption"
                                            type="text"
                                            name="caption"
                                            required
                                            onChange={this.handleChange}
                                            value={this.state.caption}
                                        />
                                        <span className="floating-label">Description</span>
                                    </div>
                                </div>
                            </div>  

                            <div className="input-2">
                                <div className="i-2 il">
                                    <div className="user-input-wrp">
                                        <input
                                            id="experience_type_name"
                                            type="text"
                                            name="experience_type_name"
                                            required
                                            onChange={this.handleChange}
                                            value={this.state.experience_type_name}
                                        />
                                        <span className="floating-label">Experience type</span>
                                    </div>
                                </div>
                                <div className="i-2">
                                    <div className="user-input-wrp">
                                        <input
                                            id="compensation"
                                            type="text"
                                            name="compensation"
                                            required
                                            onChange={this.handleChange}
                                            value={this.state.compensation}
                                        />
                                        <span className="floating-label">Compensation</span>
                                    </div>
                                </div>
                            </div>
                            <div className="submitJobBtn" onClick={this.handleSubmit}>Post</div>
                        </div>
                    </div> 
                </div>

            </React.Fragment>
        );
    }
};

export default PostAJob;
