import * as React from 'react';
import { Link } from 'gatsby';
import "../styles/navbar.css";


export default function NavBar() {
    return (
        <>
            <nav className="navbar has-shadow" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <div className="navbar-item">
                        {/* <img src={logo} alt="logo" width="32" height="32" /> */}
                    </div>
                </div>
                <div className="navbar-menu is-active">
                    <div className="navbar-start">
                        <Link className="navbar-item" to="/">
                            <span className="icon">
                                <i className="fas fa-book"></i>
                            </span>
                            <span className="navbar-text">
                                &nbsp;
                                Albums
                            </span>
                        </Link>
                    </div>
                </div>
                <div className="navbar-end">
                </div>
            </nav>
        </>
    )
}