import React from 'react';
import './CandidateList.css';    
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions'; 
import NavBar from '../../../components/recruiter/NavBar/NavBar';
import TopBar from '../../../components/TopBar/TopBar';
import Loader from '../../../components/Loader/Loader';

import '../../../constants/AnimateOverlay'; 

class CandidateList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
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
    }


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


    render(){ 
        return (
            <React.Fragment>  
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
                <NavBar />
                <TopBar />
               
                <div className='mainContainer'>
                    <div className="pageHeading">Candidates<NavLink to="/recruiter/postAJob"><div className="addCandidateButton"></div></NavLink></div> 
                    {
                        this.state.candidateList ?
                            <div className="candidateListContainer">
                                {
                                    this.state.candidateList.map((item, i) => {
                                        return <div key={i} className="candidateListItem">{item.first_name} {item.last_name} - {item.email}</div>
                                    })
                                }
                            </div>
                        :
                        <Loader />
                    } 
                </div> 
            </React.Fragment>
        );
    }
};

export default CandidateList;
