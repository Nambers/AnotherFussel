import * as React from 'react';
import { Layout } from "../components/layout"
import { PageProps, Link } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';
import { Container, Hero, Breadcrumb, Heading } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons'

const PhotoPage: React.FC<PageProps<object, { album_slug: string, album: string, photo: Queries.albumsQueryQuery["allPhotoAlbum"]["edges"][0]["node"]["photos"][0] }>> = ({ pageContext }) => {
    const photo = pageContext.photo;
    const album = pageContext.album;
    const album_slug = pageContext.album_slug;
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
                    <GatsbyImage
                        image={photo.imageFile!.childImageSharp!.single!}
                        alt={photo.path}
                    />
                </div>
            </Container>
        </Layout>
    );
};

export default PhotoPage;