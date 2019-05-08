import React, { Component } from "react";  
import './HowItWorks.css'; 

import Iphone from '../../components/Iphone/Iphone'

import activeJobs from '../../../files/images/landingPage/hiw_employer/activeJobs.jpg'
import addCompany from '../../../files/images/landingPage/hiw_employer/addCompany.jpg'
import addContact from '../../../files/images/landingPage/hiw_employer/addContact.jpg'
import calander from '../../../files/images/landingPage/hiw_employer/calander.jpg'
import candidateOptions from '../../../files/images/landingPage/hiw_employer/candidateOptions.jpg'
import candidateOptions2 from '../../../files/images/landingPage/hiw_employer/candidateOptions2.jpg'
import candidatesPosted from '../../../files/images/landingPage/hiw_employer/candidatesPosted.jpg'
import chat from '../../../files/images/landingPage/hiw_employer/chat.jpg'
import comapnies from '../../../files/images/landingPage/hiw_employer/comapnies.jpg'
import contactList from '../../../files/images/landingPage/hiw_employer/contactList.jpg'
import denial from '../../../files/images/landingPage/hiw_employer/denial.jpg'
import notifications from '../../../files/images/landingPage/hiw_employer/notifications.jpg'
import postAJob from '../../../files/images/landingPage/hiw_employer/postAJob.jpg'
import profile from '../../../files/images/landingPage/hiw_employer/profile.jpg'


class HowItWorks extends Component { 
    render() {
        return ( 
            <React.Fragment>
                <div className="fywText" data-aos="zoom-out-down">How It Works - Employer</div> 
                <div className="lp2_HIWEmployer">
                    <div className='hiwContainer'>
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={activeJobs} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={addCompany} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={addContact} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>                         
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={calander} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={candidateOptions} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={candidateOptions2} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={candidatesPosted} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>                        
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={chat} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={comapnies} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={contactList} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={denial} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={notifications} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div> 
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={postAJob} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>  
                        <div className="hiwSection">
                            <div className="hiwImage"><Iphone image={profile} /></div>
                            <div className="hiwDesc">something lorem ipsum, something some thing something about something</div>
                        </div>    
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default HowItWorks;