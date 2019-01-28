import React, { Component } from "react";
import { Parallax } from 'react-parallax';  
import foundationImage from '../../../public/images/hero4.jpg';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import axios from 'axios';

import './ContactPage.css'; 

class ContactPage extends Component {

    constructor() {
        super()

        this.state = {
            firstname: '',
            lastname: '',
            email: '', 
            pnumber: '',
            message: '',
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
        document.getElementById("theForm").reset();
        e.preventDefault()
        this.setState({ buttonState: true })
        const { firstname, lastname, email, pnumber, message} = this.state
        await axios.post('/api/mailto', {
            firstname,
            lastname,
            email,
            pnumber,
            message
        });
    }



    render() {

        const buttonSpot = this.state.buttonState ?
            (<div id='formSubmitText'> Thank you for filling out the form.< br />  Your information has been successfully sent!</div>)
            :
            (<Button id='formSubmit'>Submit</Button>)

        return (
            <div className="formBackground">
                

            <div id="parallaxSignUp">
                <Parallax bgImage={foundationImage} strength={300}> 
                    <div style={{ height: '600px' }}></div>
                </Parallax>
                </div>

 
                <Form onSubmit={this.handleSubmit} id="theForm">
                    <div className="signUpContainer"> 
                        <div className="layerBackground"></div>
                        <div className="formSection">  
                            <div className="input-2">
                                <div className="i-2 il">
                                    <FormGroup>
                                        <Input
                                            id="fname"
                                            type="text"
                                            name="firstname"
                                            placeholder="Your first name"
                                            required
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                </div>
                                <div className="i-2">
                                    <FormGroup>
                                        <Input
                                            id="lname"
                                            type="text"
                                            name="lastname"
                                            placeholder="Your last name"
                                            required
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                </div>
                            </div>

                            <div className="input-2">
                                <div className="i-2 il">
                                    <FormGroup>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            placeholder="Your email"
                                            required
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                </div>
                                <div className="i-2">
                                    <FormGroup>
                                        <Input
                                            id="pnumber"
                                            type="number"
                                            name="pnumber"
                                            placeholder="Your number"
                                            required
                                            onChange={this.handleChange}
                                        />
                                    </FormGroup>
                                </div>
                                <FormGroup>
                                    <Input
                                        id="message" 
                                        type="textarea"
                                        name="message"
                                        placeholder="Your Message"
                                        required
                                        onChange={this.handleChange}
                                    />
                                </FormGroup>
                            </div>
                        </div> 
                        <div className="submitContainer">
                            {buttonSpot}
                        </div> 
                    </div>
                </Form>
            </div>
        );
    }
}

export default ContactPage;