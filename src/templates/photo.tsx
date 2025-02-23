import * as React from 'react';
import { Layout } from "../components/layout"
import { PageProps, Link } from "gatsby"
import { GatsbyImage } from 'gatsby-plugin-image';
import { Container, Hero, Breadcrumb, Heading, Button, Icon } from 'react-bulma-components';
import Modal from 'react-modal';
import { FaBook } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import { SiSony, SiNikon } from 'react-icons/si';
import type { IconType } from 'react-icons';

import '../styles/photo.css';

const BRANDS_ICONS: { [key: string]: IconType } = {
    "sony": SiSony,
    "nikon": SiNikon
};

// adapted from https://stackoverflow.com/a/20927899
const Draggable: React.FC<{ initialPos?: { x: number, y: number }, children: React.ReactNode }> = ({ initialPos = { x: 0, y: 0 }, children }) => {
    const [pos, setPos] = React.useState(initialPos);
    const [dragging, setDragging] = React.useState(false);
    const [rel, setRel] = React.useState<{ x: number, y: number } | null>(null);

    React.useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!dragging || !rel) return;
            setPos({
                x: e.pageX - rel.x,
                y: e.pageY - rel.y
            });
            e.stopPropagation();
            e.preventDefault();
        };

        const onMouseUp = (e: MouseEvent) => {
            setDragging(false);
            e.stopPropagation();
            e.preventDefault();
        };

        if (dragging) {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        } else {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, rel]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const pos = (e.target as HTMLElement).getBoundingClientRect();
        setDragging(true);
        setRel({
            x: e.pageX - pos.left,
            y: e.pageY - pos.top
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const pos = (e.target as HTMLElement).getBoundingClientRect();
        setDragging(true);
        setRel({
            x: touch.pageX - pos.left,
            y: touch.pageY - pos.top
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragging || !rel) return;
        const touch = e.touches[0];
        setPos({
            x: touch.pageX - rel.x,
            y: touch.pageY - rel.y
        });
    };

    const handleTouchEnd = () => {
        setDragging(false);
    };


    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={onMouseDown}
            style={{
                position: 'absolute',
                left: pos.x + 'px',
                top: pos.y + 'px',
                cursor: dragging ? 'grabbing' : 'grab'
            }}
        >
            {children}
        </div>
    );
};

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
                    <Hero.Body>
                        <Breadcrumb>
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
                    </Hero.Body>
                </Hero>
                <div id="imageContainer">
                    <Modal
                        isOpen={isZoomed}
                        onRequestClose={() => setIsZoomed(false)}
                        shouldCloseOnOverlayClick
                        shouldCloseOnEsc
                        style={{
                            overlay: {
                                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                                zIndex: 1000
                            },
                            content: {
                                inset: 0,
                                padding: 0,
                                border: 'none',
                                background: 'none',
                                overflow: 'hidden'
                            }
                        }}
                    >
                        <Button text className="modal-close-button" onClick={() => setIsZoomed(false)} style={{
                            filter: "invert(1)",
                            mixBlendMode: "difference"
                        }} >
                            <FaTimes />
                        </Button>
                        <Draggable>
                            <GatsbyImage
                                image={photo.imageFile!.childImageSharp!.original!}
                                alt={photo.path}
                                loading='lazy'
                            />
                        </Draggable>
                    </Modal>
                    <div onClick={() => setIsZoomed(true)} id="image">
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