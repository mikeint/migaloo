import React, { Component } from "react"; 
import { Form } from 'reactstrap';
//import axios from 'axios';
import Whale from '../../components/Whale/Whale';
 

import './SignUpForm.css'; 

class SignUpForm extends Component {

    constructor() {
        super()
        this.state = {
            a1: "",
            a2: "",
            a3: "",
 
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    async handleSubmit(e) {
        this.setState({ sending: true }) 
/* 
        document.getElementById("theForm").reset();
        e.preventDefault()
        const { firstname, email, message} = this.state
        axios.post('http://ec2-3-89-115-26.compute-1.amazonaws.com:5000/api/mailto', {
            firstname, 
            email, 
            message
        }).then(res => {
            console.log(res, this.state.buttonState)
            this.setState({ buttonState: true,  sending: false })
        }); */
    }

    chooseQ1 = answer => {
        this.setState({a1: answer})
    }
    chooseQ2 = answer => {
        this.setState({a2: answer})
    }
    chooseQ3 = answer => {
        this.setState({a3: answer})
    }


    render() {
        const whaleOptions={whaleImg:'whaleBs.png', sprayColor:'#fff'};


        const showQ1 = this.state.a1 ? <div className="formButtonContainer">
                <div className="formQuestionTitle" onClick={() => this.chooseQ2("recruiter")}>Recruiter</div>
                <div className="formQuestionTitle" onClick={() => this.chooseQ2("employer")}>Employer</div>
            </div> : ""
        
        const showQ2 = this.state.a2 ? <div className="formButtonContainer">
                <div className="formQuestionTitle" onClick={() => this.chooseQ3("recruiter")}>Recruiter</div>
                <div className="formQuestionTitle" onClick={() => this.chooseQ3("employer")}>Employer</div>
            </div> : ""

        const showQ3 = this.state.a3 ? <div className="formButtonContainer">
                <div className="formQuestionTitle" onClick={() => this.chooseQ4("recruiter")}>Recruiter</div>
                <div className="formQuestionTitle" onClick={() => this.chooseQ4("employer")}>Employer</div>
            </div> : ""
        


        return (
            <div className="signUpFormContainer">
                <Form onSubmit={this.handleSubmit} id="theForm">
                    <div className="signUpForm"> 
                        <div className="whaleContactContainer">
                            <Whale {...whaleOptions}/>
                        </div>
                        
                        <h1>Hey ! Welcome to Migaloo ! <br/>
                            Answer these quick quesitons and we will send you an invite to join our exclsive slack group
                        </h1>

                        <h3>Are you a</h3> 
                        <div className="formButtonContainer">
                            <div className="formQuestionTitle" onClick={() => this.chooseQ1("recruiter")}>Recruiter</div>
                            <div className="formQuestionTitle" onClick={() => this.chooseQ1("employer")}>Employer</div>
                        </div>

                    
                        {showQ1}
                        {showQ2}
                        {showQ3}
                        

                        
                    </div>
                        
                </Form>
            </div>
        );
    }
}

export default SignUpForm;