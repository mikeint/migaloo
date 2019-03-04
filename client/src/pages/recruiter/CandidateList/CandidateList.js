import React from 'react';
import './CandidateList.css';    
//import { NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import Loader from '../../../components/Loader/Loader';
import ExpandableRow from './ExpandableRow/ExpandableRow';

import Overlay from '../../../components/Overlay/Overlay';
import AddCandidate from '../AddCandidate/AddCandidate';
import ReactPaginate from 'react-paginate';
import '../../../constants/AnimateHROverlay'; 

class CandidateList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            HROverlay: false, 
            showOverlay: false,
            overlayConfig: {direction: "b-t", swipeLocation: "t"},
            candidateList: null, 
            postId: props.match.params.postId,
            page: 1,
            pageCount: 1,
            postData: null,
            searchTerm:'',
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
 
    isSearched = (searchTerm) => item =>
        item.make.toLowerCase().includes(searchTerm.toLowerCase());
        
 
    onSearchChange = (event) => { 
        this.setState({ searchTerm: event.target.value });
    }


    getCandidateList = () => {
        (this.state.postId?
            ApiCalls.get('/api/candidate/listForJob/'+this.state.postId+"/"+this.state.page):
            ApiCalls.get('/api/candidate/list/'+this.state.page))
        .then((res)=>{
            this.setState({ postData: res.data.postData, candidateList: res.data.candidateList, pageCount: (res.data&&res.data.length>0)?parseInt(res.data[0].page_count, 10):1 }) 
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
        const html = <AddCandidate handleClose={this.callOverlay} />

        return (
            <React.Fragment>  
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
               
                    <div className='candidateListContainer'>
                        <div className="pageHeading">Candidates {this.state.postData?" - For: "+this.state.postData.title:''} <button className="addBtn" onClick={() => this.callOverlay()}></button></div> 
                        {
                            this.state.candidateList ?
                                <div className="candidateList"> 
                                    <input
                                        className="searchCandidateList"
                                        name={name}
                                        type="text"
                                        value={this.state.searchTerm}
                                        placeholder="Search"
                                        onChange={this.onSearchChange}
                                    /> 
                                    
                                    {
                                        this.state.candidateList.filter(() => this.isSearched(this.state.searchTerm)).map((item, i) => {return <ExpandableRow key={i} candidateData={item} postData={this.state.postData}></ExpandableRow>})
                                         
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
                                                    handleClose={this.callOverlay} 
                                                    config={this.state.overlayConfig}
                                                />}
                    </div>
            </React.Fragment>
        );
    }
};

export default CandidateList;
