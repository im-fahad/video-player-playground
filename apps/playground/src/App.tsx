import React from "react";
import { VideoPlayerWrapper } from "react-video-player";
import "react-video-player/style.css";

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h2>react-video-player playground</h2>

      <div className="min-h-screen bg-neutral-950 p-8">
        <VideoPlayerWrapper
          // src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
          src="http://index1.circleftp.net/FILE/Hindi%20Movies/2026/Assi%20%282026%29%201080p%20HDTC%20Hindi%20x264/Assi%20%282026%29%201080p%20HDTC%20Hindi%20x264.mkv"
          poster="https://ik.imagekit.io/ikmedia/blog/ghost/content/images/2024/03/Nextjs-Video-Player.png"
          hoverPlay={true}
          onClose={() => console.log("close")}
          controls
          defaultDevice="desktop"
        />
      </div>
    </div>
  );
}
