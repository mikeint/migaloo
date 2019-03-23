import React, { Component } from "react";  
import './AboutSection.css';  

class AboutSection extends Component {

    componentDidMount = () => {
        window.scrollTo(0,0);
    }
  
    render() {

        return (
                <div className="aboutTeamContainer"> 
                    <div className="aboutSection">  
                        <div className="third">
                            <div className="content_container"> 
                                <div id="f1_container">
                                    <div id="f1_card" className="shadow">
                                        <div className="front teamFace teamMember1"> 
                                        </div>
                                        <div className="back teamFace center whaleMember1">
                                        </div>
                                    </div>
                                </div>
                                <div className="name">Michael Sansone</div>
                                <div className="title">CTO</div>
                            </div>
                        </div>
                        <div className="third">
                            <div className="content_container">   
                                <div id="f1_container">
                                    <div id="f1_card" className="shadow">
                                        <div className="front teamFace teamMember2"> 
                                        </div>
                                        <div className="back teamFace center whaleMember2">
                                            Migaloo
                                        </div>
                                    </div>
                                </div>
                                <div className="name">Michael Nasser</div>
                                <div className="title">CEO</div>
                            </div>
                        </div>
                        <div className="third">
                            <div className="content_container">   
                                <div id="f1_container">
                                    <div id="f1_card" className="shadow">
                                        <div className="front teamFace teamMember3">  
                                        </div>
                                        <div className="back teamFace center whaleMember3"> 
                                        </div>
                                    </div>
                                </div>
                                <div className="name">Michael Marcucci</div>
                                <div className="title">CTO</div>
                            </div>
                        </div> 
                    </div>
 
                    <div className="aboutTeamParagraph">
                        <p>We’re three ambitious friends who met in high school… well, a couple of us have “known” each other from playing on the same soccer team since we were single digits but we don’t count that as we don’t really remember it all that well.  To make things more interesting and also a little more confusing, we all happen to share the same first name, Michael.  So, for the sake of this section, we’ll go by our last/nicknames - Sansone, Cutch, and&nbsp;Nasser.</p>
                        <p>Sansone and Cutch are the brilliant tech brains in our founding team and left high school to attend University of Toronto for computer sciences.  Throughout their University career they knew they were going to one day work on a project of mutual interest and absolutely kill it. Nasser, on the other hand, went to University for a commerce degree where he went on to successful stints in recruitment, finance, and to lead one of Canada’s fastest growing tech&nbsp;startups.</p>
                        <p>Since Nasser left recruitment, he’s had a burning desire to go back into the space and make it better.  After years of deliberation and growing his name in the Toronto tech startup scene, he had a plan but needed someone who could help on the tech side. He called Sansone who was enamoured as he shared the same interests and beliefs. Sansone and Nasser brought the idea to Cutch who was immediately on board and that was it… the founding team was in&nbsp;place.</p>
                        <p>We wanted a name that depicted something rare as great candidates are hard to come by in this market.  We looked at everything from rare gems to animals and in our search we came across a white humpback whale named Migaloo. Funnily enough, it is a name that Sansone and Cutch’s family would call them as kids. It started in Italian as “me-ghel-lé” which eventually got to&nbsp;migaloo.</p>
                        <p>We’re here to highlight meaningful work by recruiters and to make it easier and more efficient for employers to take advantage of their important services to help them in the war for&nbsp;talent.</p>
                    </div>

                </div>


        );
    }
}

export default AboutSection;