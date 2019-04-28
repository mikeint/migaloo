import React, { Component } from 'react';
import './LandingSection2.css'; 
import Slider from 'react-slick';
 
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
            speed: 500, 
            slidesToShow: slidesToShow,
			slidesToScroll: 1,
			/* autoplay: true,
			autoplayspeed: 5000 */
        };
        return (
        <div className="landingSection2">  
            <Slider {...settings}>
                <div>
                    <img src={carouselImg2} alt="" />
                    <h1 className="mc_4_text">Top Talent</h1>
                    <p>Recruiters have the opportunity to showcase their most qualified candidates. Employers get a shortlist of vetted candidates from migaloo within 72&nbsp;hours.</p>
                </div>
                <div>
                    <img src={carouselImg3} alt="" />
                    <h1 className="mc_4_text">Efficient</h1>
                    <p>Employers only view top talent that they would otherwise not have access to. Moreover, the shortlist is further distilled by migaloo ensuring that the employer is left with a tough hiring&nbsp;decision.</p>
                </div>
                <div>
                    <img src={carouselImg4} alt="" />
                    <h1 className="mc_4_text">Concierge Service</h1>
                    <p>Dedicated account managers with outstanding track records are always available to make everyone's lives&nbsp;easier.</p>
                </div> 
                <div>
                    <img src={carouselImg5} alt="" />
                    <h1 className="mc_4_text">Transparency</h1>
                    <p>An unbiased agreement that takes into consideration the thoughts and opinions from top recruiters and employers makes for an efficient&nbsp;process.</p>
                </div> 
                <div>
                    <img src={carouselImg6} alt="" />
                    <h1 className="mc_4_text">Confidentiality</h1>
                    <p>Candidates can take comfort knowing that they remain entirely anonymous until they wish to move forward in a given hiring&nbsp;process.</p>
                </div> 
            </Slider>
          </div>
        );
    }
}

export default LandingSection2 