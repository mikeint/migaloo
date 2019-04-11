import React from 'react';
import './BuildActiveJobs.css'; 
import ApiCalls from '../../../../ApiCalls';  
import AuthFunctions from '../../../../AuthFunctions'; 
import {Redirect} from 'react-router-dom';
import PostCandidateToJob from '../../../PostCandidateToJob/PostCandidateToJob';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import goldStar from '../../../../files/images/star_gold.png';
import blackStar from '../../../../files/images/star_black.png';
  
const styles = theme => ({
    drawer:{ 
        minWidth: "300px",
        position: "relative"
    },
    rightBtn:{
        float: "right",
    }
});
class BuildActiveJobs extends React.Component{

    constructor(props){
        super(props);
        this.state={ 
            user: {},
            profileImage: '',
            candidateId: props.match.params.candidateId,
            jobId: props.match.params.jobId,
            jobObj: {},
            redirectJob: false,
            showPostJob: false,
            enterSlide:"page-enter",
            openJobPageState: false,
        }
        this.Auth = new AuthFunctions();
    } 
    componentDidMount = () => {
        this.setState({ user: this.Auth.getUser() }, ()=>{
            this.getImage();
        });
        this.getJobData();
    }
    componentWillUnmount = () => {
        this.setState({enterSlide:"page-exit"})
    }
    getJobData = () => {
        (this.state.candidateId?
            ApiCalls.get('/api/recruiterJobs/getCandidateForJob/'+this.state.candidateId+'/'+this.state.jobId):
            ApiCalls.get('/api/recruiterJobs/get/'+this.state.jobId))
        .then((res)=>{
            if(res && res.data.success){
                console.log(res.data)
                const jobList = res.data.jobList;
                const candidateData = res.data.candidate;
                this.setState({
                    jobObj: jobList[0],
                    candidateData: candidateData }) 
            }
        }).catch(errors => 
            console.log(errors.response.data)
        )
    }

    getImage = () => {
        ApiCalls.get(`/api/profileImage/view/2/${this.state.jobObj.employer_id}/small`)
        .then((res)=>{
            if(res == null) return
            if(res.data.success){
                this.setState({ profileImage: res.data.url }) 
            }else{
                this.setState({ profileImage: '' })
            }
        }).catch(errors => {
            this.setState({ profileImage: '' })
        })
    }
    searchJobsForCandidates = () => {
        this.setState({redirectJob:true})
    }
    postToJob = () =>{
        this.setState({showPostJob: true})
    }

    setFavourite = () => {
        var element = document.getElementById("card-object"); 
        if ((element.classList[0] === "favourite-flip" && element.classList[1] === undefined ) || 
            (element.classList[0] === "favourite-flip" && element.classList[1] === "flip-back")) {  
            element.classList.add("favourite-flip-scale"); 
            element.classList.remove("flip-back");
        } else { 
            element.classList.add("flip-back");
            element.classList.remove("favourite-flip-scale");
        }
    }
    closeJobPage = () => {
        this.setState({openJobPageState: true}) 
    }


    render(){
        const { classes } = this.props;
        if(this.state.jobObj == null){
            return <div>Job can not be found.</div>
        }else


        if (this.state.openJobPageState) return <Redirect to={'/recruiter/jobList'+(this.state.candidateId?`/${this.state.candidateId}`:'')}/>

        return (
            <React.Fragment>
                <div className="fixedjobPostingContainer"></div>
                <div className={"jobPostingContainer "+this.state.enterSlide}> 

                    <div className="jobPostingHeader">
                        {this.state.redirectJob ? <Redirect to={'/recruiter/candidateList/'+this.state.jobObj.post_id}/> : ''}
                        {this.state.profileImage !== ''?<img className="profileImage" src={this.state.profileImage} alt="" onClick={this.showUpload}/>:''}
                        <div className="jobTitle">
                            {this.state.jobObj.title}
                        </div>
                        
                        <IconButton color="inherit"
                            onClick={() => this.closeJobPage()}
                            className={classes.rightBtn}>
                            <Close color="primary"/>
                        </IconButton>
                        {/* <div className="backButton" onClick={() => this.closeJobPage()}></div> */}
                        <span className="jobSalary">Salary: {this.state.jobObj.salary_type_name}</span> 
                        <div className="favContainer" onClick={() => this.setFavourite()}>
                            <div className="favourite-flip" id="card-object" >
                                <div className="front face">
                                    <div className="text"><img src={blackStar} alt="" /></div>
                                </div>
                                <div className="back face">
                                    <div className="text"><img src={goldStar} alt="" /></div>
                                </div>
                            </div>
                        </div>
                        
                        
                    </div> 
                    <div className="jobPostingContent">

                        <h3>Description</h3>
                        <div className="jobCaption">{this.state.jobObj.caption}</div>
                        <h3>{this.state.jobObj.company_name}</h3>
                        <p>
                            {this.state.jobObj.address_line_1}<br/>
                            {this.state.jobObj.address_line_2}<br/>
                            {this.state.jobObj.city+", "+this.state.jobObj.state+", "+this.state.jobObj.country}
                        </p>
                        <h5>Experience: {this.state.jobObj.experience_type_name}</h5>
                        <span className="jobSalary">Salary: {this.state.jobObj.salary_type_name}</span> 
                        {this.state.jobObj.tag_names?<p>Tags: {this.state.jobObj.tag_names.join(", ")}</p>:''}
                        <p>Posted: {this.state.jobObj.posted}</p>
                        <div className="rowButton" onClick={this.searchJobsForCandidates}>Search For Candidates</div>
                        {this.state.candidateData && <div className="rowButton" onClick={this.postToJob}>Post Candidate to Job</div>}
                    </div>
                </div>

 

                <Drawer
                    anchor="bottom"
                    className={classes.drawer}
                    open={this.state.showPostJob}
                    onClose={()=>this.setState({"showPostJob":false})}
                    onOpen={()=>this.setState({"showPostJob":true})}
                > 
                    <PostCandidateToJob candidate={this.state.candidateData}
                                                job={this.state.jobObj}
                                                handleClose={()=>this.setState({showPostJob:false})} />
                </Drawer>
            </React.Fragment>
        )
    }
}
 
export default withStyles(styles)(BuildActiveJobs);