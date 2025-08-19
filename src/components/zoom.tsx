"use client";

import * as React from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { Button } from 'react-bulma-components';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';

// adapted from https://stackoverflow.com/a/20927899
const Draggable: React.FC<{ initialPos?: { x: number, y: number }, children: React.ReactNode, onClick?: () => void }> = ({ initialPos = { x: 0, y: 0 }, children, onClick }) => {
    const [pos, setPos] = React.useState(initialPos);
    const [dragging, setDragging] = React.useState(false);
    const [rel, setRel] = React.useState<{ x: number, y: number } | null>(null);
    const [hasMoved, setHasMoved] = React.useState(false);

    React.useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!dragging || !rel) return;
            setPos({
                x: e.pageX - rel.x,
                y: e.pageY - rel.y
            });
            setHasMoved(true);
            e.stopPropagation();
            e.preventDefault();
        };

        const onMouseUp = (e: MouseEvent) => {
            if (dragging && !hasMoved && onClick) {
                onClick();
            }
            setDragging(false);
            setHasMoved(false);
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
    }, [dragging, rel, hasMoved, onClick]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const pos = (e.target as HTMLElement).getBoundingClientRect();
        setDragging(true);
        setHasMoved(false);
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
        setHasMoved(false);
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
        setHasMoved(true);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent the touch from generating a click event
        if (dragging && !hasMoved && onClick) {
            onClick();
        }
        setDragging(false);
        setHasMoved(false);
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={onMouseDown}
            style={{
                position: 'relative',
                left: pos.x + 'px',
                top: pos.y + 'px',
                cursor: dragging ? 'grabbing' : 'zoom-out'
            }}
        >
            {children}
        </div>
    );
};

interface ZoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: IGatsbyImageData;
    alt: string;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ isOpen, onClose, image, alt }) => {
    React.useEffect(() => {
        if (isOpen) {
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    // Set app element for accessibility
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            Modal.setAppElement('body');
        }
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick
            shouldCloseOnEsc
            ariaHideApp={true}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 2000
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
            <Button
                text
                className="modal-close-button"
                onClick={onClose}
                style={{
                    filter: "invert(1)",
                    mixBlendMode: "difference"
                }}
            >
                <FaTimes className="inverted-icon" />
            </Button>
            <Draggable onClick={onClose}>
                <GatsbyImage
                    image={image}
                    alt={alt}
                    loading='lazy'
                    style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                    }}
                />
            </Draggable>
        </Modal>
    );
};

export default ZoomModal;
