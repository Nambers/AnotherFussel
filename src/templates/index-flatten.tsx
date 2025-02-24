import * as React from 'react';
import { Layout } from "../components/layout"
import { navigate, PageProps, Link, graphql } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';
import { Navigation, Pagination, Keyboard, HashNavigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Modal from 'react-modal';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Container, Heading, Hero, Breadcrumb, Button } from 'react-bulma-components';
import { FaPhotoFilm, FaCircleInfo } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import { enable_photo_info_page, swiper_hash_listener } from '../../config';

import '../styles/album.css';
import '../styles/icon.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/keyboard';

const AlbumsPage: React.FC<PageProps<Queries.IndexFlattenPageQueryQuery>> = ({ data }) => {
    const albums = data.allPhotoAlbum.edges;

    const [state, setState] = React.useState({
        viewerIsOpen: typeof window !== 'undefined' && window.location.hash !== "",
    });

    const openModal = (event: React.MouseEvent) => {
        navigate("#" + (event.target as HTMLElement).dataset.slug, { replace: true });
        // if we don't wait a bit, the hash navigation won't work
        // it will read slug from last time
        setTimeout(() => {
            setState({ viewerIsOpen: true });
        }, 100);
    };

    const closeModal = () => {
        navigate("/", { replace: true });
        setState({ viewerIsOpen: false });
    };

    const openInfoModal = (event: React.MouseEvent<HTMLElement>) => {
        navigate(
            event.currentTarget.parentElement!
                .getElementsByClassName("swiper-slide swiper-slide-active")[0]
                .getElementsByTagName("picture")[0]
                .getElementsByTagName("img")[0].dataset.infopath!
        );
    };

    React.useEffect(() => {
        if (state.viewerIsOpen) {
            document.documentElement.style.overflow = 'hidden';

        } else {
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [state.viewerIsOpen]);

    React.useEffect(() => {
        window.addEventListener('hashchange', swiper_hash_listener);
        return () => window.removeEventListener('hashchange', swiper_hash_listener);
    }, []);

    return (
        <Layout>
            <Container>
                <Hero size="small">
                    <Hero.Body>
                        <Breadcrumb>
                            <Breadcrumb.Item active>
                                <FaPhotoFilm size="1.33em" />
                                <Heading size={5} textColor="black" style={{ marginLeft: "1em" }} renderAs="a">Photos</Heading>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Hero.Body>
                </Hero>
            </Container>
            <ResponsiveMasonry
                className="container"
                columnsCountBreakPoints={{ 300: 1, 600: 2, 900: 3, 1200: 4, 1500: 5 }}
            >
                <Masonry
                    gutter="10px"
                >
                    {
                        albums.map((album) => (
                            album.node.photos.map((image, _) => (
                                <div onClick={openModal}>
                                    <GatsbyImage
                                        data-slug={image.slug}
                                        image={image.imageFile!.childImageSharp!.thumbnail}
                                        alt={image.path}
                                        loading="lazy"
                                        className="gallery-image"
                                    />
                                </div>
                            ))
                        ))
                    }
                </Masonry>
            </ResponsiveMasonry>
            <Modal
                isOpen={state.viewerIsOpen}
                onRequestClose={closeModal}
                shouldCloseOnEsc
                // https://github.com/reactjs/react-modal/issues/279
                // sadly Modal will return to top of page after closing

                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)'
                    },
                    content: {
                        inset: '10px',
                        padding: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 1)',
                    }
                }}
            >
                {
                    enable_photo_info_page &&
                    <Button text id="infoModal" onClick={openInfoModal} style={{
                        position: 'absolute',
                        right: 60,
                        top: 15,
                        zIndex: 100
                    }}>
                        <FaCircleInfo size="0.875em" className="inverted-icon" />
                    </Button>
                }
                <Button text style={{
                    position: "absolute",
                    zIndex: 100,
                    right: "15px",
                    top: "15px",
                }} onClick={closeModal} >
                    <FaTimes size="0.875em" className="inverted-icon" />
                </Button>

                <Swiper
                    slidesPerView={1}
                    navigation={{
                        enabled: true,
                    }}
                    keyboard={{ enabled: true, }}
                    pagination={{ clickable: true, }}
                    hashNavigation={{
                        watchState: true,
                        replaceState: true,
                    }}
                    modules={[Navigation, Keyboard, HashNavigation, Pagination]}
                    className="swiper"
                >
                    {
                        albums.map((album) => (
                            album.node.photos.map((image, i) => (
                                <SwiperSlide data-hash={image.slug}>
                                    <GatsbyImage
                                        objectFit="contain"
                                        className="gallery-image"
                                        image={image.imageFile!.childImageSharp!.large}
                                        alt={image.path}
                                        loading="lazy"
                                        data-infopath={"/albums/" + album.node.slug + "/" + image.slug}
                                    />
                                </SwiperSlide>
                            ))
                        ))
                    }
                </Swiper>
            </Modal>
        </Layout >
    )
}

export default AlbumsPage

export const query = graphql`
  query IndexFlattenPageQuery {
    allPhotoAlbum {
      edges {
        node {
            slug
            photos {
                exif
                slug
                path
                imageFile {
                    childImageSharp{
                        thumbnail: gatsbyImageData(width:500, layout: CONSTRAINED, transformOptions: {fit: CONTAIN})
                        large: gatsbyImageData(width:1600, layout: CONSTRAINED, transformOptions: {fit: CONTAIN})
                    }
                }
            }
        }
      }
    }
  }
`
