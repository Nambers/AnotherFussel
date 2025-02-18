import * as React from 'react';
import { Layout } from "../components/layout"
import { navigate, PageProps, Link } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';

const PhotoPage: React.FC<PageProps<object, { album_slug: string, album: string, photo: Queries.albumsQueryQuery["allPhotoAlbum"]["edges"][0]["node"]["photos"][0] }>> = ({ pageContext }) => {
    const photo = pageContext.photo;
    const album = pageContext.album;
    const album_slug = pageContext.album_slug;
    return (
        <Layout>
            <div className="container" >
                <section className="hero is-small">
                    <div className="hero-body">
                        <nav className="breadcrumb" aria-label="breadcrumbs">
                            <ul>
                                <li>
                                    <i className="fas fa-book fa-lg"></i>
                                    <Link className="title is-5" to={"/"}>&nbsp;&nbsp;Albums</Link>
                                </li>
                                <li>
                                    <Link className="title is-5" to={"/albums/" + album_slug}>{album}</Link>
                                </li>
                                <li className="is-active">
                                    <a className="title is-5" style={{ color: "black" }}>{photo.slug}</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </section>
                <div id="imageContainer">
                    <GatsbyImage
                        image={photo.imageFile!.childImageSharp!.single!}
                        alt={photo.path}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default PhotoPage;