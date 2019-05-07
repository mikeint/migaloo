import React, { Component } from "react";  
import './HowItWorks.css'; 

import Iphone from '../../components/Iphone/Iphone'

import chat from '../../../files/images/landingPage/hiw_recruiter/chat.jpg'
import account from '../../../files/images/landingPage/hiw_recruiter/account.jpg'
import postCandidate from '../../../files/images/landingPage/hiw_recruiter/postCandidate.jpg'
import profile from '../../../files/images/landingPage/hiw_recruiter/profile.jpg'
import filter from '../../../files/images/landingPage/hiw_recruiter/filter.jpg'
import jobSearch from '../../../files/images/landingPage/hiw_recruiter/jobSearch.jpg'

class HowItWorks extends Component { 
    render() {
        return (
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
                </div>
            </div>
        );
    }
}

export default HowItWorks;