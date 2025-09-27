import * as React from 'react';
import { Link } from 'gatsby';
import "../styles/navbar.css";
import { StaticImage } from 'gatsby-plugin-image';
import { Navbar } from 'react-bulma-components';
import { FaBook, FaMap, FaPhotoFilm, FaMoon, FaLightbulb } from 'react-icons/fa6';
import { flatten_index, enable_map_page, enable_gear_page } from '../../config';

export default function navbarComp() {
    const [theme, setTheme] = React.useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") || "light";
        }
        return "light";
    });

    React.useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    return (
        <Navbar className="has-shadow" style={{ display: "flex", }}>
            <Navbar.Brand>
                <Navbar.Item renderAs='div'>
                    <StaticImage src="../images/icon.png" alt="icon" width={32} height={32} />
                </Navbar.Item>
            </Navbar.Brand>
            <Navbar.Menu className="is-active" style={{ display: "flex" }} shadowless>
                <Navbar.Item renderAs={Link} to="/">
                    {flatten_index ? <FaPhotoFilm /> : <FaBook />}
                    <span style={{ fontWeight: "bold", paddingLeft: "0.2em" }}>
                        {flatten_index ? "Photos" : "Albums"}
                    </span>
                </Navbar.Item>
                {enable_map_page &&
                    <Navbar.Item renderAs={Link} to="/map">
                        <FaMap />
                        <span style={{ fontWeight: "bold", paddingLeft: "0.2em" }}>
                            Map
                        </span>
                    </Navbar.Item>
                }
                {
                    enable_gear_page &&
                    <Navbar.Item renderAs={Link} to="/gear">
                        <FaBook />
                        <span style={{ fontWeight: "bold", paddingLeft: "0.2em" }}>
                            Gear
                        </span>
                    </Navbar.Item>
                }
                <Navbar.Item
                    onClick={toggleTheme}
                    style={{ cursor: "pointer", margin: "auto 1rem auto auto" }}
                >
                    {theme === "light"
                        ? <FaMoon size="1em" />
                        : <FaLightbulb size="1em" />}
                </Navbar.Item>
            </Navbar.Menu>
        </Navbar>
    )
}