import * as React from 'react';
import { Layout } from "../components/layout"
import { PageProps, Link } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';
import { Container, Hero, Breadcrumb, Heading } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons'

import { Controlled } from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css';

import '../styles/photo.css';

const PhotoPage: React.FC<PageProps<object, { album_slug: string, album: string, photo: Queries.albumsQueryQuery["allPhotoAlbum"]["edges"][0]["node"]["photos"][0] }>> = ({ pageContext }) => {
    const photo = pageContext.photo;
    const album = pageContext.album;
    const album_slug = pageContext.album_slug;

    const [isZoomed, setIsZoomed] = React.useState(false);

    React.useEffect(() => {
        if (isZoomed) {
            document.documentElement.style.overflow = 'hidden';

        } else {
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [isZoomed]);

    return (
        <Layout>
            <Container>
                <Hero size="small">
                    <Hero.Body>
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <FontAwesomeIcon icon={faBook} size="lg" />
                                <Heading size={5} style={{ marginLeft: "1em" }} renderAs={Link} to="/">Albums</Heading>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <Heading size={5} renderAs={Link} to={"/albums/" + album_slug}>{album}</Heading>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>
                                <Heading size={5} textColor="black" renderAs='a'>{photo.slug}</Heading>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Hero.Body>
                </Hero>
                <div id="imageContainer">
                    <Controlled isZoomed={isZoomed} onZoomChange={setIsZoomed}>
                        <GatsbyImage
                            id="image"
                            style={{
                                height: '100%',
                                width: '100%'
                            }}
                            image={photo.imageFile!.childImageSharp!.single!}
                            alt={photo.path}
                        />
                    </Controlled>
                    <div id="infoContainer">
                        <div id="camera-info">
                            {
                                "Make" in photo.exif && <><div id="brand">{photo.exif["Make"] as String}</div><span id="separator">|</span></>
                            }
                            <div id="specs">
                                {
                                    "Model" in photo.exif && <div id="model">{photo.exif["Model"] as String}</div>
                                }
                                {
                                    "LensModel" in photo.exif && <div id="len">{photo.exif["LensModel"] as String}</div>
                                }
                            </div>
                        </div>
                        <div id="photo-properties">{
                            Object.entries(photo.exif).map((item, i) => (
                                <div>
                                    <b>{item[0]}:</b> {item[1] as String}
                                </div>
                            ))
                        }</div>
                    </div>
                </div>
            </Container>
        </Layout>
    );
};

export default PhotoPage;