import * as React from 'react';
import { Layout } from "../components/layout"
import { navigate, PageProps, Link } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';
import { Navigation, Pagination, Keyboard, HashNavigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Modal from 'react-modal';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

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
            <div className="container" >
                <section className="hero is-small">
                    <div className="hero-body">
                        <nav className="breadcrumb" aria-label="breadcrumbs">
                            <ul>
                                <li>
                                    <i className="fas fa-book fa-lg"></i>
                                    <Link className="title is-5" to={"/"}>&nbsp;&nbsp;Albums</Link>
                                </li>
                                <li className="is-active">
                                    <a className="title is-5" style={{ color: "black" }}>{album.name}</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </section>
            </div>
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
                <button className="button is-text modal-close-button" onClick={closeModal} >
                    <span className="icon is-small">
                        <i className="fas fa-times"></i>
                    </span>
                </button>

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
