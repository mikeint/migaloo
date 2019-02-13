import React, { Component } from "react"; 
import "./Overlay.css";    

class Overlay extends Component {

    componentDidMount = () => {
        document.querySelector(".back").addEventListener("click", this.toggleClassMenu, false);
        document.querySelector(this.props.class).addEventListener("click", this.toggleClassMenu, false);
    }

    toggleClassMenu() {
        document.querySelector(".menu").classList.add("menu--animatable");
        if(!document.querySelector(".menu").classList.contains("menu--visible")) {
            document.querySelector(".menu").classList.add("menu--visible");
        } else {
            document.querySelector(".menu").classList.remove('menu--visible');		
        }
    }

    render() {

        return (
            <React.Fragment>
                <div className="menu">
                    <div className="app-menu">
                        <div className="back">x</div>
                        <div className="jobTitle">Front end web developer</div>
                        <div className="jobDescTitle">Job Description</div>
                        <div className="jobDescription">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum</div>
                        <div className="jobDescApplicantsContainer">
                            <div className="jobApplicantTitle">This job has received 3 aplicants so far</div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
 
export default Overlay;