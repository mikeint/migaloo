import React from 'react';
import './CandidateList.css';    
import { NavLink } from 'react-router-dom';
import {get,cancel} from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions'; 
import LoaderSquare from '../../../components/LoaderSquare/LoaderSquare';
import ExpandableRow from './ExpandableRow/ExpandableRow'; 
import debounce from 'lodash/debounce'; 

import whale from '../../../files/images/logo.png'
import AddCandidate from '../AddCandidate/AddCandidate';
import Pagination from "react-js-pagination";
import '../../../constants/AnimateMigalooOverlay';  

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';  
import Button from '@material-ui/core/Button';
import Add from '@material-ui/icons/Add';


const styles = theme => ({
    button: {
        marginLeft: 'auto', 
    },
    drawer:{ 
        minWidth: "300px",
        position: "relative"
    },
    candidateSearched:{
        display: "inline-block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        background: "#b1b9dbba",
        color: "#ffffff",
        margin: "0 20px",
        padding: "5px 10px",
        whiteSpace: "nowrap",
        height: "30px",
        lineHeight: "20px",
        boxShadow: "0px 0px 0px 1px #fff",
        flex: "0 1 auto"
    },
    unshrinkable:{
        flex: "0 0 auto"
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
        cancel()
        this.setState({enterSlide:"page-exit"})
    }

    openCandidateTop = (candidateId) => { 
        get(`/api/candidate/getCandidate/${candidateId}`)
        .then((res) => {
            if(res)
                this.setState({ postData: res.data.postData, candidateList: res.data.candidateList, pageCount: (res.data&&res.data.candidateList.length>0)?parseInt(res.data.candidateList[0].pageCount, 10):1 }) 
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
            get('/api/candidate/listForJob/'+this.state.postId+"/"+this.state.page+(searchString?`/${searchString}`:'')):
            get('/api/candidate/list/'+this.state.page+(searchString?`/${searchString}`:'')))
        .then((res)=>{
            if(res)
                this.setState({ postData: res.data.postData, candidateList: res.data.candidateList, pageCount: (res.data&&res.data.candidateList.length>0)?parseInt(res.data.candidateList[0].pageCount, 10):1 }) 
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
                    { this.state.migalooOverlay ? <div id="fadeOutOverlay" className="migalooOverlay"><div className="middleOverlay"></div></div>:"" }
 
                    <div className="pageHeading">
                        <span className={classes.unshrinkable}>Candidates</span>
                        {this.state.postData &&
                        <NavLink to={`/recruiter/jobList/job/${this.state.postData.postId}`} className={classes.candidateSearched}>
                            {this.state.postData.title}
                        </NavLink>} 
                        <Button
                            className={classes.button+" "+classes.unshrinkable}
                            variant="contained"
                            color="secondary" 
                            onClick={()=>this.callAddOverlay()}>
                            <Add/>
                        </Button>
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
                            <LoaderSquare />
                        }
                        </div>
 
                    <Drawer
                        anchor="bottom"
                        className={classes.drawer}
                        open={this.state.showOverlay}
                        onClose={()=>this.setState({"showOverlay":false})}
                        // onOpen={()=>this.setState({"showOverlay":true})}
                    > 
                        <AddCandidate onClose={()=>this.setState({"showOverlay":false})} />
                    </Drawer>
                    
            </React.Fragment>
        );
    }
};
 
export default withStyles(styles)(CandidateList);
