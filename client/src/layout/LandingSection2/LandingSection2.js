import React, { Component } from 'react';
import './LandingSection2.css';
import ScrollAnimation from 'react-animate-on-scroll';
import Slider from 'react-slick';

import carouselImg1 from '../../files/images/landingPage/carousel-1.png';
import carouselImg2 from '../../files/images/landingPage/carousel-2.png';
import carouselImg3 from '../../files/images/landingPage/carousel-3.png';
import carouselImg4 from '../../files/images/landingPage/carousel-4.png';
import carouselImg5 from '../../files/images/landingPage/carousel-5.png';
import carouselImg6 from '../../files/images/landingPage/carousel-6.png';


class LandingSection2 extends Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0 };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    } 
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    } 
    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    render() { 

      let slidesToShow = 3;
      if (this.state.width < 1024) slidesToShow=2;
      if (this.state.width < 738) slidesToShow=1;

        var settings = {
            dots: true,
            infinite: true, 
            speed: 1000, 
            slidesToShow: slidesToShow,
			slidesToScroll: 1,
			/* autoplay: true,
			autoplayspeed: 1000 */
        };
        return (
        <div className="landingSection2">  
            <Slider {...settings}>
				<ScrollAnimation animateIn='bounceInLeft' duration={2} animateOnce={true}>
                    <div>
                        <img src={carouselImg1} alt="" />
                        <h1 className="mc_4_text">Real Recruitment Platform</h1>
                        <p>The first and only platform connecting employers directly to third-party recruiters.</p>
                    </div>
                </ScrollAnimation>
				<ScrollAnimation animateIn='flipInY' duration={2} animateOnce={true}>
                    <div>
                        <img src={carouselImg2} alt="" />
                        <h1 className="mc_4_text">Top Quality Candidates</h1>
                        <p>Recruiters have the opportunity to showcase their best candidates, and employers get a ranked list of top talent to choose from.</p>
                    </div>
                </ScrollAnimation>
				<ScrollAnimation animateIn='bounceInRight' duration={2} animateOnce={true}>
                    <div>
                        <img src={carouselImg3} alt="" />
                        <h1 className="mc_4_text">Effiecient</h1>
                        <p>Employers will only view qualified candidates. Recruiters get the right information upfront so they can assess their candidate pool to see if they have a match.  </p>
                    </div>
                </ScrollAnimation> 
                <div>
                    <img src={carouselImg4} alt="" />
                    <h1 className="mc_4_text">Credit-Based System</h1>
                    <p>Recruiters can rank ahead of their competition based on the confidence in their ability to fill the opening.  Employers get an organized list of qualified candidates.</p>
                </div> 
                <div>
                    <img src={carouselImg5} alt="" />
                    <h1 className="mc_4_text">Transparency</h1>
                    <p>Each submission has recruiters' terms and conditions included allowing employers to make informed decisions on which recruiter(s) they choose to engage. </p>
                </div> 
                <div>
                    <img src={carouselImg6} alt="" />
                    <h1 className="mc_4_text">Confidentiality</h1>
                    <p>Both employer and candidate details are confidential. Only when successful matches have been made are details divulged.</p>
                </div> 
            </Slider>
          </div>
        );
    }
}

export default LandingSection2 