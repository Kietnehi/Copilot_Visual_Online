import React, { useRef, useState, useEffect } from 'react';
import './SplitPane.css';

type Props = {
    children: [React.ReactNode, React.ReactNode];
    rightInitialWidth?: number; // pixels
    minRight?: number; // pixels
    minLeft?: number; // pixels
    className?: string;
};

export default function SplitPane({ children, rightInitialWidth = 400, minRight = 200, minLeft = 200, className }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [rightWidth, setRightWidth] = useState<number>(rightInitialWidth);
    const draggingRef = useRef(false);
    const pointerIdRef = useRef<number | null>(null);

    // Use pointer events for better cross-device support and safer handlers.
    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            try {
                if (!draggingRef.current || !containerRef.current) return;
                if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return;

                const clientX = (typeof e.clientX === 'number') ? e.clientX : NaN;
                if (!Number.isFinite(clientX)) return;

                const rect = containerRef.current.getBoundingClientRect();
                let desired = rect.right - clientX;
                const maxRight = Math.max(0, rect.width - minLeft);
                desired = Math.max(minRight, Math.min(desired, maxRight));
                if (!Number.isFinite(desired)) return;
                setRightWidth(Math.round(desired));
            } catch (err) {
                draggingRef.current = false;
                pointerIdRef.current = null;
                document.body.style.userSelect = '';
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            try {
                if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return;
            } finally {
                draggingRef.current = false;
                pointerIdRef.current = null;
                document.body.style.userSelect = '';
                try {
                    (containerRef.current as Element | null)?.releasePointerCapture?.(e.pointerId);
                } catch {}
            }
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [minLeft, minRight]);

    useEffect(() => {
        // update when initial prop changes
        setRightWidth(rightInitialWidth);
    }, [rightInitialWidth]);

    const startDrag = (e: React.PointerEvent) => {
        e.preventDefault();
        draggingRef.current = true;
        pointerIdRef.current = e.pointerId;
        document.body.style.userSelect = 'none';
        try {
            (e.target as Element).setPointerCapture?.(e.pointerId);
        } catch {
            // ignore failures
        }
    };

    return (
        <div ref={containerRef} className={"split-pane " + (className || '')} style={{ height: '100%' }}>
            <div className="split-left">{children[0]}</div>

            <div className="split-handle" onPointerDown={startDrag} />

            <div className="split-right" style={{ width: `${rightWidth}px` }}>{children[1]}</div>
        </div>
    );
}
