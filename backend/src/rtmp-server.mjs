import NodeMediaServer from "node-media-server";

const config = {
	rtmp: {
		port: process.env.RTMP_SERVER_PORT || 1935,
		chunk_size: 60000,
		gop_cache: true,
		ping: 30,
		ping_timeout: 60,
	},
	http: {
		port: process.env.RTMP_HTTP_PORT || 8000,
		allow_origin: "*",
	},
};

const nms = new NodeMediaServer(config);
export default nms;
