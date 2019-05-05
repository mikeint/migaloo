import React, { Component } from "react"
import './Contact.css'
import axios from 'axios'
import AOS from 'aos'
import 'aos/dist/aos.css' 
import Loader from '../../components/Loader/Loader'
 
class Contact extends Component {
    constructor() {
        super() 
        this.state = {
            firstname: '', 
            email: '',  
            message: '',
            buttonState: false,
            sending: false
        }
    }
    componentDidMount(){
        AOS.init({
          duration : 500
        })
    }
    
    async handleSubmit(e) {
        this.setState({ sending: true })  
        document.getElementById("theForm").reset();
        e.preventDefault()
        const { firstname, email, message} = this.state
         axios.post('/api/landing/sendContactEmail', {
            name:firstname, 
            email:email, 
            message:message
        }).then(res => {
            console.log(res, this.state.buttonState)
            this.setState({ buttonState: true,  sending: false })
        });
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }


    render() {
        const buttonSpot = this.state.buttonState ?
        (<div id='formSubmitText'> Thank you for filling out the form.< br />  Your information has been successfully sent!</div>)
        :
        (<button className='contactBtnHome'>Submit</button>)

        return ( 
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">Contact Us</div> 
                <div className="lp2_contactContainer"> 
                    <div className="contactContainer">
                        <form id="theForm" className="contactForm" onSubmit={this.handleSubmit.bind(this)}> 
                            <input
                                id="firstname"
                                type="text"
                                name="firstname"
                                placeholder="Your name"
                                required
                                onChange={this.handleChange.bind(this)}
                            />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Your email"
                                required
                                onChange={this.handleChange.bind(this)}
                            />
                            <textarea
                                id="message" 
                                type="textarea"
                                name="message"
                                placeholder="Your Message"
                                required
                                onChange={this.handleChange.bind(this)}
                            /> 
                            <div className="submitContainer">
                                {this.state.sending ?
                                    <Loader sprayColor="#fff" />
                                :
                                    buttonSpot
                                }
                            </div> 
                        </form>

                    </div>
                </div> 
            </React.Fragment>
        );
    }
}

export default Contact;