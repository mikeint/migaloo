import React, { Component } from 'react';
import './CarSoldSlider.css';
import { Parallax } from 'react-parallax';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';


import dellHero from '../../../public/images/hero2.jpg';
/* import sample1 from '../../../public/images/sample/sample1.jpg';
import sample2 from '../../../public/images/sample/sample2.jpg';
import sample3 from '../../../public/images/sample/sample3.jpg';
import sample4 from '../../../public/images/sample/sample4.jpg';
import sample5 from '../../../public/images/sample/sample5.jpg';
import sample6 from '../../../public/images/sample/sample6.jpg'; */


class CarSoldSlider extends Component {
    constructor(props){
        super(props);
        this.state={ 
            carList: '', 
        } 
    }

    componentDidMount = () => {
        this.setCarList();
    }

    setCarList = () => {
        axios.get('/api/cars/carSoldList')
        .then(res => {
            this.setState({
                carList: res.data
            });
            console.log("CARS OBJ-->", this.state.carList);
        })
        .catch(function (error) {
            console.log(error);
        }) 
    }  

    render() { 
        /* SLIDER SETTINGS */
        var settings = {
            dots: true,
            arrows: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1
        }; 

        var i, j, slideArray=[], groupSize=12;

        for(i=0,j=this.state.carList.length; i<j; i+=groupSize) 
            slideArray.push(this.state.carList.slice(i, i+groupSize));

        const cars = slideArray.map((group, a) => {
            return (
                <div key={a} className="outerBox">
                    {group.map((car, b) => {
                        return ( 
                            <figure key={b} className="snip1104">
                                <img src={"/api/cars/image/" + car.primeImg} alt="img12"/>
                                <figcaption>
                                    <h2>{car.model}  <span> {car.make}</span></h2>
                                    <h3><span> SOLD</span></h3>
                                </figcaption>
                                <a href="#"></a>
                            </figure>  
                        )
                    })}
                </div>
            )
        })

        return (
            <div className='carList'>
                <Parallax bgImage={dellHero} bgImageAlt="dellhero" strength={400}>  
                    {/* <div id="heroText" className="heroTextImage"></div> 
                    <div className="heroTextB"></div>  */}
                    <div style={{ height: '600px' }} />
                </Parallax>
                

                <div className="carSoldSliderContainer">
                    <div className="sliderSoldContain">

                        
                        {this.state.carList ? 
                            <Slider {...settings}>
                                {cars}
                            </Slider>
                        :
                        <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>   
                        }
                </div>
            </div>

 
                

{/*                <div className="carSoldSliderContainer">
                    <div className="sliderSoldContain">
                    
                        <figure className="snip1104">
                            <img src={sample1} alt="sample1" />
                            <figcaption>
                                <h2>Ferrari  <span> F40</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample2} alt="sample2" />
                            <figcaption>
                                <h2>Ferrari  <span> Spider</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample3} alt="sample3" />
                            <figcaption>
                                <h2>Mini <span> Cooper S</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample4} alt="sample4" />
                            <figcaption>
                                <h2>Mini <span> Cooper S</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample5} alt="sample5" />
                            <figcaption>
                                <h2>Mini <span> Cooper S</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample6} alt="sample6" />
                            <figcaption>
                                <h2>Mini <span> Cooper S</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample6} alt="sample6" />
                            <figcaption>
                                <h2>Mini <span> Cooper S</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample6} alt="sample6" />
                            <figcaption>
                                <h2>Mini <span> Cooper S</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
                        <figure className="snip1104"><img src={sample6} alt="sample6" />
                            <figcaption>
                                <h2>Mini <span> Cooper S</span></h2>
                                <h3><span> SOLD</span></h3>
                            </figcaption>
                            <a href="#"></a>
                        </figure>
 
                    </div>
                </div> */}
        
            </div>
        );
    }
}

export default CarSoldSlider;