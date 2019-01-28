import React, { Component } from 'react';
import './CarSaleSlider.css';
import { Parallax } from 'react-parallax';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';

//images
import dellHero from '../../../public/images/hero.jpg';
/* import sample1 from '../../../public/images/sample/sample1.jpg';
import sample2 from '../../../public/images/sample/sample2.jpg';
import sample3 from '../../../public/images/sample/sample3.jpg';
import sample4 from '../../../public/images/sample/sample4.jpg';
import sample5 from '../../../public/images/sample/sample5.jpg';
import sample6 from '../../../public/images/sample/sample6.jpg';
import sample7 from '../../../public/images/sample/sample7.jpg';
import sample8 from '../../../public/images/sample/sample8.jpg';
 */

class CarSaleSlider extends Component {
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
        axios.get('/api/cars/carList')
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

        /* SET UP CARS */
/*         const cars = 
        this.state.carList ?
        this.state.carList.map((car, i) => (
                <div key={i} className="box"> 
                    <figure className="effect-marley">
                        <img src={"/api/cars/image/" + car.primeImg} alt="img12"/>
                        <figcaption>
                            <h2><span>{car.make}</span></h2>
                            <p>{car.model}</p>
                        </figcaption>           
                    </figure>
                </div>
        )) : "" ; */


        var i, j, slideArray=[], groupSize=12;

        for(i=0,j=this.state.carList.length; i<j; i+=groupSize) 
            slideArray.push(this.state.carList.slice(i, i+groupSize));

        const cars = slideArray.map((group, a) => {
            return (
                <div key={a} className="outerBox">
                    {group.map((car, b) => {
                        return (
                            <div key={b} className="box"> 
                                <figure className="effect-marley">
                                    <img src={"/api/cars/image/" + car.primeImg} alt="img12"/>
                                    <figcaption>
                                        <h2><span>{car.make}</span></h2>
                                        <p>{car.model}</p>
                                    </figcaption>           
                                </figure>
                            </div>
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
                

                <div className="carSaleSliderContainer">
                    <div className="sliderSaleContain">
 
                         
                         {this.state.carList ? 
                            <Slider {...settings}>
                                {cars}
                            </Slider>
                        :
                        <div className="loadingContainer"><div className="loadContainer"><div className="load-shadow"></div><div className="load-box"></div></div></div>   
                        }


 
                        {/* <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample1} alt="img12"/>
                            <figcaption>
                                <h2><span>Ferrai</span></h2>
                                <p>F40</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample3} alt="img12"/>
                            <figcaption>
                                <h2><span>Lambo</span></h2>
                                <p>Gallardo</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample4} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample5} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample6} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample7} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample8} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample2} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div>
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample2} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div> 
                        <div className="box"> 
                            <figure className="effect-marley">
                            <img src={sample2} alt="img12"/>
                            <figcaption>
                                <h2><span>Mini</span></h2>
                                <p>CooperS</p>
                            </figcaption>           
                            </figure>
                        </div> */}







                        {/* <div className="box"> 
                            <img src={sample1} alt="sample1" />
                        </div>
                        <div className="box"> 
                            <img src={sample2} alt="sample2" />
                        </div>
                        <div className="box"> 
                            <img src={sample3} alt="sample3" />
                        </div>
                        <div className="box"> 
                            <img src={sample4} alt="sample4" />
                        </div>
                        <div className="box"> 
                            <img src={sample5} alt="sample5" />
                        </div>
                        <div className="box"> 
                            <img src={sample6} alt="sample6" />
                        </div>
                        <div className="box"> 
                            <img src={sample7} alt="sample7" />
                        </div>
                        <div className="box"> 
                            <img src={sample8} alt="sample8" />
                        </div>
                        <div className="box"> 
                            <img src={sample7} alt="sample7" />
                        </div>
                        <div className="box"> 
                            <img src={sample8} alt="sample8" />
                        </div> */}
                    </div>
                </div>
        
            </div>
        );
    }
}

export default CarSaleSlider;
