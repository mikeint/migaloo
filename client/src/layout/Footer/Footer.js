import React from 'react';
import './Footer.css';

import { Link } from 'react-router-dom';

export default () => {
	return (
		<footer className="footerContainer">
			<div className="inFooterContainer">
				<Link className="navFootItem" to="/contact">Contact Us</Link> 
				<Link className="navFootItem" to="/about">About Us</Link> 
			</div>
		</footer>
	);
};
