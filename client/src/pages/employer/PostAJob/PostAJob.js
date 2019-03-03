import React from 'react';
import './PostAJob.css'; 
import { Redirect } from 'react-router-dom';

import AuthFunctions from '../../../AuthFunctions'; 

import axios from 'axios';
import TagSearch from '../../../components/TagSearch/TagSearch';

class PostAJob extends React.Component{
    constructor() {
        super();
        this.state = {   
            title:'',
            caption:'',
            experience_type_name:'',
            compensation:'',
            redirect: false
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
            if(res.data.success) {
                this.setState({ redirect: true })
            }
        })

        .catch(error => {
            console.log(error);
            document.getElementById("registration_popup").style.display = "block"
        });
    }



    render(){   
        return (
            <React.Fragment>
                {this.state.redirect ? <Redirect to='/employer/activeJobs' /> : ''}
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
                            <TagSearch onChange={(tags)=>this.setState({tagIds:tags})}/>
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
