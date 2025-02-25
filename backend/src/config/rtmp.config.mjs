// src/config/rtmp.config.mjs
export const rtmpConfig = {
	server: process.env.RTMP_SERVER || "rtmp://localhost/live",
	streamKey: process.env.RTMP_STREAM_KEY || "stream",
};
