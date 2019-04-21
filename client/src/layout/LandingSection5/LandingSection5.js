import React, { Component } from "react";  
import './LandingSection5.css'; 

import AOS from 'aos';
import 'aos/dist/aos.css';

import s1 from "../../files/images/landingPage/skills/1.png";
import s2 from "../../files/images/landingPage/skills/2.png";
import s3 from "../../files/images/landingPage/skills/3.png";
import s4 from "../../files/images/landingPage/skills/4.png";
import s5 from "../../files/images/landingPage/skills/5.png";
import s6 from "../../files/images/landingPage/skills/6.png";
import s7 from "../../files/images/landingPage/skills/7.png";
import s8 from "../../files/images/landingPage/skills/8.png";
import s9 from "../../files/images/landingPage/skills/9.png";
import s10 from "../../files/images/landingPage/skills/10.png";
import s11 from "../../files/images/landingPage/skills/11.png";
import s12 from "../../files/images/landingPage/skills/12.png";
import s13 from "../../files/images/landingPage/skills/13.png";
import s14 from "../../files/images/landingPage/skills/14.png";
import s15 from "../../files/images/landingPage/skills/15.png";
import s16 from "../../files/images/landingPage/skills/16.png";
import s17 from "../../files/images/landingPage/skills/17.png";
import s18 from "../../files/images/landingPage/skills/18.png";
import s19 from "../../files/images/landingPage/skills/19.png";
import s20 from "../../files/images/landingPage/skills/20.png";
import s21 from "../../files/images/landingPage/skills/21.png";
import s22 from "../../files/images/landingPage/skills/22.png";
import s23 from "../../files/images/landingPage/skills/23.png";
import s24 from "../../files/images/landingPage/skills/24.png";
import s25 from "../../files/images/landingPage/skills/25.png";
import s26 from "../../files/images/landingPage/skills/26.png";
import s27 from "../../files/images/landingPage/skills/27.png";
import s28 from "../../files/images/landingPage/skills/28.png";
import s29 from "../../files/images/landingPage/skills/29.png";
import s30 from "../../files/images/landingPage/skills/30.png";
import s31 from "../../files/images/landingPage/skills/31.png";
import s32 from "../../files/images/landingPage/skills/32.png";
import s33 from "../../files/images/landingPage/skills/33.png";
import s34 from "../../files/images/landingPage/skills/34.png";
import s35 from "../../files/images/landingPage/skills/35.png";
import s36 from "../../files/images/landingPage/skills/36.png";
import s37 from "../../files/images/landingPage/skills/37.png";
 
class LandingSection5 extends Component {
    constructor() {
        super();
		this.state = { 
        }; 
    }

    componentDidMount(){
        AOS.init({
          duration : 100
        })
    }
  
    render() {  
        return (
            <div className="landingSection5">   
                <div className="techInfoContainer">
                    <div className="techInfoText1">All about the tech</div>
                    <div className="techInfoText2">Whales know skills</div>
                    <div className="skillSection" alt="XYZ"  data-aos='fade-up' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-100">
                        <img src={s1} alt="" />
                        <img src={s2} alt="" />
                        <img src={s3} alt="" />
                        <img src={s4} alt="" />
                        <img src={s5} alt="" />
                        <img src={s6} alt="" />
                        <img src={s7} alt="" />
                    </div>
                    <div className="skillSection skillSectionL" alt="XYZ"  data-aos='fade-up' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-100" data-aos-delay="100">
                        <img src={s8} alt="" />
                        <img src={s9} alt="" />
                        <img src={s10} alt="" />
                        <img src={s11} alt="" />
                        <img src={s12} alt="" />
                        <img src={s13} alt="" />
                        <img src={s14} alt="" />
                        <img src={s15} alt="" />
                    </div>
                    <div className="skillSection skillSectionL" alt="XYZ"  data-aos='fade-up' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-100" data-aos-delay="200">
                        <img src={s16} alt="" />
                        <img src={s17} alt="" />
                        <img src={s18} alt="" />
                        <img src={s19} alt="" />
                        <img src={s20} alt="" />
                        <img src={s21} alt="" />
                        <img src={s22} alt="" />
                    </div>
                    <div className="skillSection skillSectionL" alt="XYZ"  data-aos='fade-up' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-100" data-aos-delay="300">
                        <img src={s23} alt="" />
                        <img src={s24} alt="" />
                        <img src={s25} alt="" />
                        <img src={s26} alt="" />
                        <img src={s27} alt="" />
                        <img src={s28} alt="" />
                        <img src={s29} alt="" />
                        <img src={s30} alt="" />
                    </div>
                    <div className="skillSection skillSectionL" alt="XYZ"  data-aos='fade-up' data-aos-easing="ease-in-out" data-aos-duration="500" data-aos-offset="-100" data-aos-delay="400">
                        <img src={s31} alt="" />
                        <img src={s32} alt="" />
                        <img src={s33} alt="" />
                        <img src={s34} alt="" />
                        <img src={s35} alt="" />
                        <img src={s36} alt="" /> 
                        <img src={s37} alt="" />
                    </div>
                </div>
            </div>
        );
    }
}

export default LandingSection5;