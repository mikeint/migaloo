import React from 'react';
import './CandidateList.css';    
//import { NavLink } from 'react-router-dom';
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions'; 
import NavBar from '../../../components/recruiter/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';
import Loader from '../../../components/Loader/Loader';
import ExpandableRow from './ExpandableRow/ExpandableRow';

import Overlay from '../../../components/Overlay/Overlay';
import '../../../constants/AnimateOverlay'; 
import AddCandidate from '../AddCandidate/AddCandidate';

class CandidateList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
            showOverlay: false,
            overlayConfig: {direction: "app-menu_b-t", backButtonLocation: "back_t-m"},
            candidateList: [], 
        };
        this.Auth = new AuthFunctions();
    }

    componentWillMount = () => {
        this.setState({ HROverlay: sessionStorage.getItem("HROverlay") });
        sessionStorage.removeItem('HROverlay');
        this.getCandidateList();
    }

    componentDidMount = () => {
        if(this.state.HROverlay) {
            window.FX.fadeOut(document.getElementById('fadeOutOverlay'), {
                duration: 1500, complete: function() {  
                    document.getElementById("fadeOutOverlay").style.display = "none";
                }
            })
        }

        var bubblyButtons = document.getElementsByClassName("addCandidateBtn");
        for (var i = 0; i < bubblyButtons.length; i++) {
            bubblyButtons[i].addEventListener('click', this.animateButton, false);
        }
    }
    animateButton = (e) => {
        e.preventDefault(); 
        e.target.classList.remove('animate');
        e.target.classList.add('animate');
        setTimeout(function(){
          e.target.classList.remove('animate');
        },700);
    };
      



    getCandidateList = () => {
        var config = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
        axios.get('/api/candidate/list', config)
        .then((res)=>{    
            this.setState({ candidateList: res.data }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    callOverlay = () => {
        this.setState({ showOverlay : !this.state.showOverlay })
    }

    render(){
        const html = <AddCandidate />

        return (
            <React.Fragment>  
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <NavBar />
                <TopBar />
               
                <div className='mainContainer'>
                    <div className="pageHeading">Candidates<button className="addCandidateBtn" onClick={() => this.callOverlay()}>+</button>{/* <div className="addCandidateButton" onClick={() => this.callOverlay()}></div> */}</div> 
                    {
                        this.state.candidateList ?
                            <div className="candidateListContainer">
                                {
                                    this.state.candidateList.map((item, i) => {return <ExpandableRow key={i} obj={item}></ExpandableRow>})
                                }
                            </div>
                        :
                        <Loader />
                    }

                    {this.state.showOverlay && <Overlay
                                                html={html}  
                                                callOverlay={this.callOverlay} 
                                                config={this.state.overlayConfig}
                                            />}
                </div> 
            </React.Fragment>
        );
    }
};

export default CandidateList;
