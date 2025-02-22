import * as React from 'react';
import { Layout } from "../components/layout"
import { navigate, PageProps, Link } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';
import { Navigation, Pagination, Keyboard, HashNavigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Modal from 'react-modal';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Container, Heading, Hero, Breadcrumb, Button, Icon } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons'

import '../styles/album.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/keyboard';

const AlbumsPage: React.FC<PageProps<object, { album: Queries.albumsQueryQuery["allPhotoAlbum"]["edges"][0]["node"] }>> = ({ pageContext }) => {
    const album = pageContext.album;

    const [state, setState] = React.useState({
        viewerIsOpen: typeof window !== 'undefined' && window.location.hash !== "",
    });

    const openModal = (event: React.MouseEvent) => {
        navigate("/albums/" + album.slug + "#" + (event.target as HTMLElement).dataset.slug, { replace: true });
        // if we don't wait a bit, the hash navigation won't work
        // it will read slug from last time
        setTimeout(() => {
            setState({ viewerIsOpen: true });
        }, 100);
    };

    const closeModal = () => {
        navigate("/albums/" + album.slug, { replace: true });
        setState({ viewerIsOpen: false });
    };

    const openInfoModal = () => {
        navigate("/albums/" + album.slug + "/" + window.location.hash.substring(1));
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

    return (
        <Layout>
            <Container>
                <Hero size="small">
                    <Hero.Body>
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <FontAwesomeIcon icon={faBook} size="lg" />
                                <Link className="title is-5" to="/" style={{ marginLeft: "1em" }}>Albums</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>
                                <Heading size={5} textColor="black" renderAs='a'>{album.name}</Heading>
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
                        album.photos.map((image, _) => (
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
                    }
                </Masonry>
            </ResponsiveMasonry>
            <Modal
                isOpen={state.viewerIsOpen}
                onRequestClose={closeModal}
                shouldCloseOnEsc={true}
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
                <Button text id="infoModal" onClick={openInfoModal} style={{
                    position: 'absolute',
                    right: 60,
                    top: 15,
                    zIndex: 100
                }}>
                    <Icon size="small">
                        <FontAwesomeIcon icon={faInfoCircle} />
                    </Icon>
                </Button>
                <Button text className="modal-close-button" onClick={closeModal} >
                    <Icon size="small">
                        <FontAwesomeIcon icon={faTimes} />
                    </Icon>
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
                        album.photos.map((image, i) => (
                            <SwiperSlide data-hash={image.slug}>
                                <GatsbyImage
                                    objectFit="contain"
                                    className="gallery-image"
                                    image={image.imageFile!.childImageSharp!.large}
                                    alt={image.path}
                                    loading="lazy"
                                />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </Modal>
        </Layout >
    )
}

export default AlbumsPage
