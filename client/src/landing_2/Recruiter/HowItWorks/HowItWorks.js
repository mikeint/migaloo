import React, { Component } from "react";  
import './HowItWorks.css'; 

import Iphone from '../../components/Iphone/Iphone'

import chat from '../../../files/images/landingPage/hiw_recruiter/chat.jpg'
import account from '../../../files/images/landingPage/hiw_recruiter/account.jpg'
import postCandidate from '../../../files/images/landingPage/hiw_recruiter/postCandidate.jpg'
import profile from '../../../files/images/landingPage/hiw_recruiter/profile.jpg'
import filter from '../../../files/images/landingPage/hiw_recruiter/filter.jpg'
import jobSearch from '../../../files/images/landingPage/hiw_recruiter/jobSearch.jpg'
import addAccount from '../../../files/images/landingPage/hiw_recruiter/addAccount.jpg'
import addCandidate from '../../../files/images/landingPage/hiw_recruiter/addCandidate.jpg'
import calander from '../../../files/images/landingPage/hiw_recruiter/calander.jpg'
import candidateData from '../../../files/images/landingPage/hiw_recruiter/candidateData.jpg'
import candidateList from '../../../files/images/landingPage/hiw_recruiter/candidateList.jpg'
import chatList from '../../../files/images/landingPage/hiw_recruiter/chatList.jpg'
import job from '../../../files/images/landingPage/hiw_recruiter/job.jpg'
import notifications from '../../../files/images/landingPage/hiw_recruiter/notifications.jpg'
import relevantJobs from '../../../files/images/landingPage/hiw_recruiter/relevantJobs.jpg'


class HowItWorks extends Component { 
    render() {
        return ( 
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">How It Works - Recruiter</div> 
                <div className="lp2_HIWRecruiter">
                    <div className='hiwContainer'>
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={chat} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={account} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={postCandidate} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={profile} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={filter} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={jobSearch} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={addAccount} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={addCandidate} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={calander} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={candidateData} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={candidateList} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={chatList} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={job} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={notifications} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={relevantJobs} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>   
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default HowItWorks;