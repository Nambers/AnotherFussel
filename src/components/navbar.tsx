import * as React from 'react';
import { Link } from 'gatsby';
import "../styles/navbar.css";
import { StaticImage } from 'gatsby-plugin-image';
import { Navbar } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faB, faBook, faMap, faPhotoFilm } from '@fortawesome/free-solid-svg-icons';
import { flatten_index } from '../../config';


export default function navbarComp() {
    return (
        <Navbar className="has-shadow">
            <Navbar.Brand>
                <Navbar.Item renderAs='div'>
                    <StaticImage src="../images/icon.png" alt="icon" width={32} height={32} />
                </Navbar.Item>
            </Navbar.Brand>
            <Navbar.Menu>
                <Navbar.Container>
                    <Navbar.Item renderAs={Link} to="/">
                        <FontAwesomeIcon icon={flatten_index ? faPhotoFilm : faBook} />
                        <span style={{ fontWeight: "bold" }}>
                            {flatten_index ? "Photos" : "Albums"}
                        </span>
                    </Navbar.Item>
                    <Navbar.Item renderAs={Link} to="/map">
                        <FontAwesomeIcon icon={faMap} />
                        <span style={{ fontWeight: "bold" }}>
                            Map
                        </span>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
        </Navbar>
    )
}