import React from "react";
import { isZoomed } from "../store";

// adapted from https://stackoverflow.com/a/20927899
const Draggable: React.FC<{ initialPos?: { x: number, y: number }, children: React.ReactNode }> = ({ initialPos = { x: 0, y: 0 }, children }) => {
    const [pos, setPos] = React.useState(initialPos);
    const [dragging, setDragging] = React.useState(false);
    const [rel, setRel] = React.useState<{ x: number, y: number } | null>(null);
    const [hasMoved, setHasMoved] = React.useState(false);
    const onClick = () => {
        isZoomed.set(!isZoomed.get());
    }

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
                onClick(e);
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
            onClick(e);
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

export default Draggable;