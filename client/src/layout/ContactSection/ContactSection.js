import React, { Component } from "react"; 
import { Button, Form } from 'reactstrap';
import axios from 'axios';

import Loader from '../../components/Loader/Loader';

import './ContactSection.css'; 

class ContactSection extends Component {

    constructor() {
        super()

        this.state = {
            firstname: '', 
            email: '',  
            message: '',
            buttonState: false,
            sending: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    async handleSubmit(e) {
        this.setState({ sending: true }) 

        document.getElementById("theForm").reset();
        e.preventDefault()
        const { firstname, email, message} = this.state
        axios.post('/api/mailto', {
            firstname, 
            email, 
            message
        }).then(res => {
            console.log(res, this.state.buttonState)
            this.setState({ buttonState: true,  sending: false })
        });
    }



    render() {

        const buttonSpot = this.state.buttonState ?
            (<div id='formSubmitText'> Thank you for filling out the form.< br />  Your information has been successfully sent!</div>)
            :
            (<Button id='formSubmit'>Submit</Button>)


        return (
            <div className="formBackground"> 
                <Form onSubmit={this.handleSubmit} id="theForm">
                    <div className="contactUsContainer"> 
                        <h1>Contact Us</h1>
                        <div className="layerBackground"></div>
                        <div className="formSection">  
                            <div className="input-2">
                                <div className="i-2 il"> 
                                    <input
                                        id="fname"
                                        type="text"
                                        name="firstname"
                                        placeholder="Your name"
                                        required
                                        onChange={this.handleChange}
                                    />  
                                </div>
                                <div className="i-2"> 
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="Your email"
                                        required
                                        onChange={this.handleChange}
                                    /> 
                                </div> 
                            </div>

                            <div className="input-2">  
                                <textarea
                                    id="message" 
                                    type="textarea"
                                    name="message"
                                    placeholder="Your Message"
                                    required
                                    onChange={this.handleChange}
                                /> 
                            </div>
                        </div> 
                        <div className="submitContainer">
                            {this.state.sending ?
                               <Loader />
                            :
                            buttonSpot
                            }
                        </div>
                        <div className="copyRight">© 2019 by HireRanked.</div>
                    </div>
                </Form>
            </div>
        );
    }
}

export default ContactSection;