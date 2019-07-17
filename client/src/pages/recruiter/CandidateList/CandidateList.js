import React from 'react';
import './CandidateList.css';    
import { NavLink } from 'react-router-dom';
import {get,post,cancel} from '../../../ApiCalls';  
import AuthFunctions from '../../../AuthFunctions';
import ExpandableRow from './ExpandableRow/ExpandableRow'; 
import debounce from 'lodash/debounce'; 
 
import AddCandidate from '../AddCandidate/AddCandidate';
import Pagination from "../../../components/Pagination/Pagination"; 
import '../../../constants/AnimateMigalooOverlay';  

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';  
import Button from '@material-ui/core/Button';
import Add from '@material-ui/icons/Add';
import LinearProgress from '@material-ui/core/LinearProgress';


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
            showAddCandidate: false,
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
        get(`/api/candidate/get/${candidateId}`)
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
        if (this.state.candidateId) {this.openCandidateTop(this.state.candidateId); }
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

    candidateSearch = (url) => {
        get(url)
        .then((res)=>{
            if(res)
                this.setState({ lastSearchUrl:url, postData: res.data.postData, candidateList: res.data.candidateList, pageCount: (res.data&&res.data.candidateList.length>0)?parseInt(res.data.candidateList[0].pageCount, 10):1 }) 
        }).catch(errors => 
            console.log(errors)
        )
    }
    deleteCandidate = (candidateId) => {
        if(window.confirm("Are you sure you want to delete this candidate?\n\nThis action is irreversible.")){
            post('/api/candidate/delete', {candidateId:candidateId})
            .then((res)=>{
                if(res && res.data.success){
                    this.candidateSearch(this.state.lastSearchUrl)
                }
            }).catch(errors => 
                console.log(errors)
            )
        }
    }
    getCandidateList = (searchString) => {
        const url = this.state.postId?
            (`/api/candidate/listForJob/${this.state.postId}/${this.state.page}`+(searchString?`/${searchString}`:'')):
            (`/api/candidate/list/${this.state.page}`+(searchString?`/${searchString}`:''))
        this.candidateSearch(url)
    }
    callAddOverlay = () => {
        this.setState({ showAddCandidate : !this.state.showAddCandidate })
    }
    closeAddCandidate = () => {
        this.setState({"showAddCandidate":false, editCandidateId: null});
        this.candidateSearch(this.state.lastSearchUrl);
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
                                        this.state.candidateList.map((item, i) => {
                                            return <ExpandableRow
                                            key={i}
                                            candidateData={item}
                                            postData={this.state.postData}
                                            onEdit={()=> this.setState({showAddCandidate:true, editCandidateId: item.candidateId})}
                                            onDelete={()=> this.deleteCandidate(item.candidateId)}
                                            candidateId={this.state.candidateId}></ExpandableRow>
                                        })
                                    }
                                    </div>  
                                    <div className="paginationContainer">
                                        <Pagination
                                            onChange={this.handlePageClick}
                                            pageRangeDisplayed={10}
                                            activePage={this.state.page}
                                            totalItemsCount={this.state.pageCount*10}
                                            />
                                    </div>
                                </React.Fragment>
                            :
                            <LinearProgress />
                        }
                        </div>
 
                    <Drawer
                        anchor="bottom"
                        className={classes.drawer}
                        open={this.state.showAddCandidate}
                        onClose={this.closeAddCandidate}
                        // onOpen={()=>this.setState({"showAddCandidate":true})}
                    > 
                        <AddCandidate candidateId={this.state.editCandidateId} onClose={this.closeAddCandidate} />
                    </Drawer>
                    
            </React.Fragment>
        );
    }
};
 
export default withStyles(styles)(CandidateList);
