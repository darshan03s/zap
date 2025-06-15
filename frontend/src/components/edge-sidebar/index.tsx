import { useEffect, useState } from "react";

function EdgeSidebar() {
    const [showSidebar, setShowSidebar] = useState(false);
    const [mouseX, setMouseX] = useState(window.innerWidth);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const edgeThreshold = 20;

    useEffect(() => {
        if (mouseX < edgeThreshold) {
            if (!showSidebar) {
                setShowSidebar(true);
            }
        } else {
            if (showSidebar) {
                setShowSidebar(false);
            }
        }
    }, [mouseX, showSidebar]);

    return (
        <div>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '200px',
                    height: '100%',
                    transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
                    backgroundColor: 'lightblue',
                    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s ease',
                    zIndex: 1000,
                }}
            >
            </div>
        </div>
    );
}

export default EdgeSidebar;