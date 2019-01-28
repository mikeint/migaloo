import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './Navbar.css';

class Navbar extends Component {
  render() {
    return (
      <div className="navbarContainer"> 
        <Link className="navbar-link" to="/">Home</Link> 
        <Link className="navbar-link" to="/register">For Sale</Link>
        <Link className="navbar-link" to="/register">Sold</Link>
        <Link className="navbar-link" to="/register">About</Link> 
      </div>
    );
  }
}

export default Navbar;
