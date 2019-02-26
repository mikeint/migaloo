import React from 'react';
import './CandidateList.css';    
//import { NavLink } from 'react-router-dom';
import axios from 'axios';
import AuthFunctions from '../../../AuthFunctions'; 
import Loader from '../../../components/Loader/Loader';
import ExpandableRow from './ExpandableRow/ExpandableRow';
import TopBar from '../../../components/TopBar/TopBar';

import Overlay from '../../../components/Overlay/Overlay';
import '../../../constants/AnimateOverlay'; 
import AddCandidate from '../AddCandidate/AddCandidate';
import ReactPaginate from 'react-paginate';

class CandidateList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
            showOverlay: false,
            overlayConfig: {direction: "app-menu_b-t", swipeLocation: "swipeBack_t"},
            candidateList: [], 
            page: 1,
            pageCount: 1
        };
        this.Auth = new AuthFunctions();
        this.axiosConfig = {
            headers: {'Authorization': 'Bearer ' + this.Auth.getToken(), 'Content-Type': 'application/json' }
        }
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

       document.querySelector(".addBtn").addEventListener('click', this.animateButton, false); 
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
        axios.get('/api/candidate/list/'+this.state.page, this.axiosConfig)
        .then((res)=>{
            this.setState({ candidateList: res.data, pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    callOverlay = () => {
        this.setState({ showOverlay : !this.state.showOverlay })
    }


    handlePageClick = data => {
        let selected = data.selected+1;
    
        this.setState({ page: selected }, () => {
            this.getCandidateList();
        });
    };

    render(){
        const html = <AddCandidate />

        return (
            <React.Fragment>  
                <TopBar />
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
               
               <div className="mainContainer">
                    <div className='candidateListContainer'>
                        <div className="pageHeading">Candidates<button className="addBtn" onClick={() => this.callOverlay()}>+</button></div> 
                        {
                            this.state.candidateList ?
                                <div className="candidateList">
                                    {
                                        this.state.candidateList.map((item, i) => {return <ExpandableRow key={i} obj={item}></ExpandableRow>})
                                    }
                                    <div className="paginationContainer">
                                        <ReactPaginate
                                            previousLabel={'Back'}
                                            nextLabel={'Next'}
                                            breakLabel={'...'}
                                            breakClassName={'break-me'}
                                            pageCount={this.state.pageCount}
                                            marginPagesDisplayed={2}
                                            pageRangeDisplayed={10}
                                            onPageChange={this.handlePageClick}
                                            containerClassName={'pagination'}
                                            subContainerClassName={'pages pagination'}
                                            activeClassName={'active'}
                                            />
                                    </div>
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
                </div>
            </React.Fragment>
        );
    }
};

export default CandidateList;
