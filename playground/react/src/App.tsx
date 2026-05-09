import { useEffect, useRef, useState } from "react";
import { ReactVideoPlayer } from "@glitchlab/react-video-player";
import "@glitchlab/react-video-player/style.css";
import "./playground.css";

const DEFAULT_VIDEO = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function isLikelyValidUrl(value: string): boolean {
    try {
        const u = new URL(value);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

export default function App() {
    const [videoSrc, setVideoSrc] = useState<string>(DEFAULT_VIDEO);
    const [inputUrl, setInputUrl] = useState<string>(DEFAULT_VIDEO);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const previousBlobRef = useRef<string | null>(null);

    useEffect(() => {
        if (videoSrc.startsWith("blob:")) {
            const current = videoSrc;
            return () => {
                if (
                    previousBlobRef.current &&
                    previousBlobRef.current !== current
                ) {
                    URL.revokeObjectURL(previousBlobRef.current);
                }
                previousBlobRef.current = current;
            };
        }
        if (previousBlobRef.current) {
            URL.revokeObjectURL(previousBlobRef.current);
            previousBlobRef.current = null;
        }
    }, [videoSrc]);

    useEffect(() => {
        return () => {
            if (previousBlobRef.current) {
                URL.revokeObjectURL(previousBlobRef.current);
            }
        };
    }, []);

    const acceptFile = (file: File) => {
        setError(null);
        if (!file.type.startsWith("video/")) {
            setError("Please select a video file.");
            return;
        }
        const url = URL.createObjectURL(file);
        setFileName(file.name);
        setVideoSrc(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) acceptFile(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) acceptFile(file);
    };

    const handleLoadUrl = () => {
        const trimmed = inputUrl.trim();
        if (!trimmed) {
            setError("Please enter a URL.");
            return;
        }
        if (!isLikelyValidUrl(trimmed)) {
            setError("Enter a valid http(s) URL.");
            return;
        }
        setError(null);
        setFileName(null);
        setVideoSrc(trimmed);
    };

    const trimmedInput = inputUrl.trim();
    const loadDisabled =
        !trimmedInput ||
        trimmedInput === videoSrc ||
        !isLikelyValidUrl(trimmedInput);

    return (
        <div className="pg-page">
            <div className="pg-card">
                <header className="pg-header">
                    <h1>
                        <span aria-hidden="true">🎬</span> React Video Player Playground
                    </h1>
                    <p>Upload a video or paste a URL to preview instantly.</p>
                </header>

                <div className="pg-grid">
                    <label
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`pg-drop${isDragging ? " is-dragging" : ""}`}
                    >
                        <span className="pg-drop-label">
                            {fileName ? "Selected file" : "Click or drop a video here"}
                        </span>
                        <span className="pg-drop-hint">
                            {fileName ||
                                "MP4, WebM, MOV, or any format your browser supports"}
                        </span>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="pg-sr-only"
                            aria-label="Upload video file"
                        />
                    </label>

                    <div className="pg-url">
                        <div>
                            <label htmlFor="video-url">Paste video URL</label>
                            <input
                                id="video-url"
                                type="url"
                                inputMode="url"
                                placeholder="https://example.com/video.mp4"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !loadDisabled) {
                                        handleLoadUrl();
                                    }
                                }}
                            />
                            <p className="pg-url-help">
                                Direct video files or HLS streams (.m3u8) are supported.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleLoadUrl}
                            disabled={loadDisabled}
                            className="pg-button"
                        >
                            Load Video
                        </button>
                    </div>
                </div>

                {error && (
                    <div role="alert" className="pg-error">
                        {error}
                    </div>
                )}

                <div className="pg-player">
                    <ReactVideoPlayer
                        key={videoSrc}
                        src={videoSrc}
                        controls
                        showDeviceToggle
                        frameMaxWidth={{ desktop: "100%" }}
                        hoverPlay={false}
                        muted={false}
                    />
                </div>

                <footer className="pg-footer">
                    <p>
                        Some external video URLs may not load due to browser CORS
                        restrictions.
                    </p>
                    <p>
                        Powered by{" "}
                        <a
                            href="https://www.npmjs.com/package/@glitchlab/react-video-player"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            @glitchlab/react-video-player
                        </a>{" "}
                        — a lightweight and flexible React video player built for modern
                        web applications.
                    </p>
                    <p>
                        Using Vue or Nuxt? Try{" "}
                        <a
                            href="https://www.npmjs.com/package/@glitchlab/vue-video-player"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            @glitchlab/vue-video-player
                        </a>{" "}
                        — the Vue 3 / Nuxt 3 counterpart with HLS support, device-mode
                        toggle, and hover-to-play.
                    </p>
                </footer>
            </div>
        </div>
    );
}
