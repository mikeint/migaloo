import React from 'react';
import './CandidateList.css';    
import { NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import Loader from '../../../components/Loader/Loader';
import ExpandableRow from './ExpandableRow/ExpandableRow';
import SwipeableViews from 'react-swipeable-views';
import debounce from 'lodash/debounce';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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
            index: 0,
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
 
    onSearchChange = (event) => { 
        this.queryForNames(event.target.value);
    }

    queryForNames = debounce((searchString) => {
        searchString = searchString.trim()
        if(searchString.length > 0){
            this.getCandidateList(searchString)
        }else{
            this.getCandidateList()
        }
    }, 250)

    getCandidateList = (searchString) => {
        (this.state.postId?
            ApiCalls.get('/api/candidate/listForJob/'+this.state.postId+"/"+this.state.page+(searchString?`/${searchString}`:'')):
            ApiCalls.get('/api/candidate/list/'+this.state.page+(searchString?`/${searchString}`:'')))
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
    
               
    handleChange = (event, value) => {
        this.setState({
          index: value,
        });
      };
    
      handleChangeIndex = index => {
        this.setState({
          index,
        });
      };

    render(){
        const html = <AddCandidate handleClose={this.callOverlay} />
 
        return (
            <React.Fragment>  
                { this.state.HROverlay ? <div id="fadeOutOverlay" className="HROverlay"><div className="middleOverlay">HR</div></div>:"" }
 
                    <div className='candidateListContainer'>
 
  

                        <div className="pageHeading">
                            Candidates 
                            <button className="addBtn" onClick={() => this.callOverlay()}></button> 
                            {this.state.postData? <NavLink to="/recruiter/jobList/"><div className="jobSearched">{this.state.postData.title}</div></NavLink> : ""} 
                        </div>


                        <Tabs value={this.state.index} onChange={this.handleChange}>
                            <Tab label="List" />
                            <Tab label="Favourites" />
                            <Tab label="Archived" />
                        </Tabs>
                        
                        {
                            this.state.candidateList ? 
                                <React.Fragment>
                                    <input
                                        className="searchCandidateList"
                                        name="searchTerm"
                                        type="text"
                                        placeholder="Search"
                                        onChange={this.onSearchChange}
                                    /> 
                                    <SwipeableViews enableMouseEvents index={this.state.index} onChangeIndex={this.handleChangeIndex}>
                                        <div className="candidateList" style={Object.assign({})}>  
                                            { 
                                                this.state.candidateList.map((item, i) => {return <ExpandableRow key={i} candidateData={item} postData={this.state.postData}></ExpandableRow>})
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
                                    
                                        <div style={Object.assign({})}>slide n°2</div>
                                        <div style={Object.assign({})}>slide n°3</div>
                                    </SwipeableViews>
                                </React.Fragment>
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
