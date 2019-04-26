import React, { Component } from 'react'; 
import HomePage from './HomePage/HomePage';
import MainPage from './MainPage/MainPage';

class Landing extends Component {
    constructor(props) {
        super(props);
		this.state = {
            page:"recruiter"
        };
    }
    
    selectPage = (page) => {
        this.setState({page}) 
    }

	render() {
        var showPage="";
        if (this.state.page === "home") showPage = <HomePage selectPage={this.selectPage} />
        else if (this.state.page === "recruiter") showPage = <MainPage page={this.state.page} selectPage={this.selectPage} />
        else if (this.state.page === "employer") showPage = <MainPage page={this.state.page} selectPage={this.selectPage} />

		return (
			<React.Fragment>
                {showPage}
			</React.Fragment>
		);
  	}
}

export default Landing;
