import { useState } from "react";
import { ReactVideoPlayer } from "@glitchlab/react-video-player";
import "@glitchlab/react-video-player/style.css";

export default function App() {
    const [visible, setVisible] = useState(true);

    return (
        <div style={{ padding: 24 }}>
            <h2>react-video-player playground</h2>

            <div className="min-h-screen bg-neutral-950 p-8">
                {visible && (
                    <ReactVideoPlayer
                        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                        poster="https://ik.imagekit.io/ikmedia/blog/ghost/content/images/2024/03/Nextjs-Video-Player.png"
                        controls
                        defaultDevice="desktop"
                        tooltipText="Watch the demo"
                        onClose={() => setVisible(false)}
                    />
                )}
            </div>
        </div>
    );
}
