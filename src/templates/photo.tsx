"use client";

import * as React from 'react';
import { Layout } from "../components/layout"
import { PageProps, Link } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';
import { Container, Hero, Breadcrumb, Heading, Button, Icon } from 'react-bulma-components';
import { FaBook, FaDownload } from 'react-icons/fa6';
import { SiSony, SiNikon } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { saveAs } from "file-saver";
import ZoomModal from "../components/zoom";

import '../styles/photo.css';
import '../styles/icon.css';

const BRANDS_ICONS: { [key: string]: IconType } = {
    "sony": SiSony,
    "nikon": SiNikon
};

const PhotoPage: React.FC<PageProps<object, { album_slug: string, album: string, photo: Queries.albumsQueryQuery["allPhotoAlbum"]["edges"][0]["node"]["photos"][0] }>> = ({ pageContext }) => {
    const photo = pageContext.photo;
    const album = pageContext.album;
    const album_slug = pageContext.album_slug;

    const [isZoomed, setIsZoomed] = React.useState(false);

    var brand_icon = <></>;
    if ("Make" in photo.exif) {
        const make = (photo.exif["Make"] as string).toLowerCase();
        if (make in BRANDS_ICONS) {
            const BrandIcon = BRANDS_ICONS[make];
            brand_icon = <BrandIcon size="5em" />;
        } else {
            brand_icon = <>{make}</>;
        }
    }

    return (
        <Layout>
            <Container>
                <Hero size="small">
                    <Hero.Body style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Breadcrumb style={{ marginBottom: "0" }}>
                            <Breadcrumb.Item>
                                <FaBook size="1.33em" />
                                <Heading size={5} style={{ marginLeft: "1em" }} renderAs={Link} to="/">Albums</Heading>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <Heading size={5} renderAs={Link} to={"/albums/" + album_slug}>{album}</Heading>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>
                                <Heading size={5} textColor="black" renderAs='a'>{photo.slug}</Heading>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                        <Button
                            text
                            onClick={() =>
                                saveAs(
                                    photo.imageFile!.childImageSharp!.original.images.fallback!.src,
                                    photo.slug
                                )
                            }
                        >
                            <FaDownload size="0.875em" className="inverted-icon" />
                        </Button>
                    </Hero.Body>
                </Hero>
                <div id="imageContainer">
                    <ZoomModal
                        isOpen={isZoomed}
                        onClose={() => setIsZoomed(false)}
                        image={photo.imageFile!.childImageSharp!.original!}
                        alt={photo.path}
                    />
                    <div style={{ backgroundColor: "var(--card-bg)" }} onClick={() => setIsZoomed(true)} id="image">
                        <GatsbyImage
                            style={{
                                width: '70vw',
                                cursor: 'zoom-in'
                            }}
                            image={photo.imageFile!.childImageSharp!.single!}
                            alt={photo.path}
                        />
                    </div>
                    <div id="infoContainer">
                        <div id="camera-info">
                            {
                                "Make" in photo.exif && <>{brand_icon}<span id="separator"> | </span></>
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
                            Object.entries(photo.exif)
                                .map((item, i) => (
                                    <><b>{item[0]}:</b> {item[1] as String}<br /></>
                                ))
                        }</div>
                    </div>
                </div>
            </Container>
        </Layout >
    );
};

export default PhotoPage;