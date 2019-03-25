import React from 'react';
import './CandidateList.css';    
import { NavLink } from 'react-router-dom';
import ApiCalls from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import Loader from '../../../components/Loader/Loader';
import ExpandableRow from './ExpandableRow/ExpandableRow'; 
import debounce from 'lodash/debounce'; 

import whale from '../../../files/images/logo.png'
//import Overlay from '../../../components/Overlay/Overlay';
import AddCandidate from '../AddCandidate/AddCandidate';
import Pagination from "react-js-pagination";
import '../../../constants/AnimateMigalooOverlay';  

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import { withStyles } from '@material-ui/core/styles';  
import Button from '@material-ui/core/Button';
import Add from '@material-ui/icons/Add';


const styles = theme => ({
    button: {
      float: 'right', 
    },
    drawer:{ 
        minWidth: "300px",
        maxHeight: "20px",
        position: "relative"
    }
});

class CandidateList extends React.Component{

    constructor(props) {
        super(props);
		this.state = {
            migalooOverlay: false, 
            showOverlay: false,
            overlayConfig: {direction: "b-t", swipeLocation: "t"},
            candidateList: null, 
            postId: props.match.params.postId,
            candidateId: props.match.params.candidateId,
            page: 1,
            pageCount: 1,
            postData: null,
            index: 0,
            enterSlide:"page-enter"
        };
        this.Auth = new AuthFunctions();
    }

    componentWillMount = () => {
        this.setState({ migalooOverlay: sessionStorage.getItem("migalooOverlay") });
        sessionStorage.removeItem('migalooOverlay'); 
    }

    componentWillUnmount = () => {
        this.setState({enterSlide:"page-exit"})
    }

    openCandidateTop = (candidateId) => { 
        ApiCalls.get(`/api/candidate/getCandidate/${candidateId}`)
        .then((res) => {
            this.setState({ postData: res.data.postData, candidateList: res.data.candidateList, pageCount: (res.data&&res.data.candidateList.length>0)?parseInt(res.data.candidateList[0].page_count, 10):1 }) 
        });
    }

    componentDidMount = () => {
        if(this.state.migalooOverlay) {
            window.FX.fadeOut(document.getElementById('fadeOutOverlay'), {
                duration: 1500, complete: function() {  
                    document.getElementById("fadeOutOverlay").style.display = "none";
                }
            })
        }  
        if (this.state.candidateId) {this.openCandidateTop(this.state.candidateId); console.log(this.state.candidateId); }
        else this.getCandidateList();
    }
 
    onSearchChange = (event) => { 
        this.queryForNames(event.target.value);
    }

    queryForNames = debounce((searchString) => {
        searchString = searchString.trim()
        if(searchString.length > 1){
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
            this.setState({ postData: res.data.postData, candidateList: res.data.candidateList, pageCount: (res.data&&res.data.candidateList.length>0)?parseInt(res.data.candidateList[0].page_count, 10):1 }) 
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }
    callAddOverlay = () => {
        this.setState({ showOverlay : !this.state.showOverlay })
    }


    handlePageClick = selected => {
        this.setState({ page: selected }, () => {
            this.getCandidateList();
        });
    };


    render(){ 
        const { classes } = this.props; 
 
        return (
            <React.Fragment>  
                    { this.state.migalooOverlay ? <div id="fadeOutOverlay" className="migalooOverlay"><div className="middleOverlay"><img src={whale} alt="whale" /></div></div>:"" }
 
                    <div className="pageHeading">
                        Candidates 
                        <Button
                            className={classes.button}
                            variant="contained"
                            color="secondary" 
                            onClick={()=>this.callAddOverlay()}>
                            <Add/>
                        </Button>
                        {this.state.postData? <NavLink to="/recruiter/jobList/"><div className="candidateListJobSearched">{this.state.postData.title}</div></NavLink> : ""} 
                    </div>
                    <div className={'candidateListContainer '+this.state.enterSlide}> 
                        {
                            this.state.candidateList ? 
                                <React.Fragment>
                                    <input
                                        className="searchCandidateList"
                                        name="searchTerm"
                                        type="text"
                                        placeholder="Search"
                                        onChange={this.onSearchChange}/>

 
                                    <div className="candidateList" style={Object.assign({})}>  
                                    {
                                        this.state.candidateList.map((item, i) => {return <ExpandableRow key={i} candidateData={item} postData={this.state.postData} candidateId={this.state.candidateId}></ExpandableRow>})
                                    }
                                    </div>  
                                    <div className="paginationContainer">
                                        <Pagination
                                            activeClass={'active'}
                                            innerClass={'pagination'}
                                            onChange={this.handlePageClick}
                                            pageRangeDisplayed={10}
                                            marginPagesDisplayed={0}
                                            activePage={this.state.page}
                                            totalItemsCount={this.state.pageCount*10}
                                            lastPageText={'Last'}
                                            firstPageText={'First'}
                                            nextPageText={'Next'}
                                            prevPageText={'Back'}
                                            />
                                    </div>
                                </React.Fragment>
                            :
                            <Loader />
                        }
                        </div>
 
                        <SwipeableDrawer
                            anchor="bottom"
                            className={classes.drawer}
                            open={this.state.showOverlay}
                            onClose={()=>this.setState({"showOverlay":false})}
                            onOpen={()=>this.setState({"showOverlay":true})}
                        > 
                        <AddCandidate close={()=>this.setState({"showOverlay":false})} />
                    </SwipeableDrawer>
                    
            </React.Fragment>
        );
    }
};
 
export default withStyles(styles)(CandidateList);
