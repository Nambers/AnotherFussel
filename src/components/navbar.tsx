import * as React from 'react';
import { Link } from 'gatsby';
import "../styles/navbar.css";
import { StaticImage } from 'gatsby-plugin-image';
import { Navbar } from 'react-bulma-components';
import { FaBook, FaMap, FaPhotoFilm } from 'react-icons/fa6';
import { flatten_index } from '../../config';


export default function navbarComp() {
    return (
        <Navbar className="has-shadow" style={{ display: "flex", justifyContent: "center" }}>
            <Navbar.Brand>
                <Navbar.Item renderAs='div'>
                    <StaticImage src="../images/icon.png" alt="icon" width={32} height={32} />
                </Navbar.Item>
            </Navbar.Brand>
            <Navbar.Menu className="is-active" style={{ display: "flex" }} shadowless>
                <Navbar.Item renderAs={Link} to="/">
                    {flatten_index ? <FaPhotoFilm /> : <FaBook />}
                    <span style={{ fontWeight: "bold" }}>
                        {flatten_index ? "Photos" : "Albums"}
                    </span>
                </Navbar.Item>
                <Navbar.Item renderAs={Link} to="/map">
                    <FaMap />
                    <span style={{ fontWeight: "bold" }}>
                        Map
                    </span>
                </Navbar.Item>
            </Navbar.Menu>
        </Navbar>
    )
}