// rtmp-server.mjs
import NodeMediaServer from "node-media-server";
import { spawn } from "child_process";
import { prisma } from "./utils/prisma.mjs";

const config = {
	rtmp: {
		port: 1935,
		chunk_size: 60000,
		gop_cache: true,
		ping: 30,
		ping_timeout: 60,
	},
	http: {
		port: 8000,
		allow_origin: "*",
		mediaroot: "./media",
	},
	 trans: {
        ffmpeg: process.env.FFMPEG_PATH || 'ffmpeg',
        tasks: []
    }
};

const nms = new NodeMediaServer(config);

nms.on("prePublish", async (id, StreamPath, args) => {
	const streamKey = StreamPath.split("/")[2];
	console.log(`Stream starting with key: ${streamKey}`);

	try {
		// Note: removed youtubeData from include since it's a JSON field
		const streamSession = await prisma.streamSession.findFirst({
			where: {
				streamKey: streamKey,
			},
			include: {
				user: true,
				accounts: true,
			},
		});

		if (!streamSession) {
			console.log(`No stream session found for key: ${streamKey}`);
			return;
		}

		// Parse the youtubeData JSON field
		const youtubeData = streamSession.youtubeData;
		console.log("Stream session found:", {
			id: streamSession.id,
			youtubeData,
		});

		if (!youtubeData?.rtmpUrl || !youtubeData?.streamKey) {
			console.error("Missing YouTube streaming data");
			return;
		}

		// Configure FFmpeg with optimal settings for YouTube
		const ffmpegCommand = [
			"-i",
			`rtmp://localhost:${config.rtmp.port}${StreamPath}`,
			"-c:v",
			"libx264",
			"-preset",
			"veryfast",
			"-b:v",
			"2500k",
			"-maxrate",
			"2500k",
			"-bufsize",
			"5000k",
			"-pix_fmt",
			"yuv420p",
			"-g",
			"60", // GOP size (2 * framerate)
			"-r",
			"30", // framerate
			"-force_key_frames",
			"expr:gte(t,n_forced*2)", // Force keyframe every 2 seconds
			"-x264opts",
			"no-scenecut",
			"-acodec",
			"aac",
			"-ar",
			"44100",
			"-b:a",
			"128k",
			"-threads",
			"4",
			"-f",
			"flv",
			`${youtubeData.rtmpUrl}/${youtubeData.streamKey}`,
		];

		console.log("Starting FFmpeg with command:", ffmpegCommand.join(" "));

		const ffmpeg = spawn("ffmpeg", ffmpegCommand);

		ffmpeg.stderr.on("data", (data) => {
			console.log("FFmpeg:", data.toString());
		});

		ffmpeg.on("error", (error) => {
			console.error("FFmpeg error:", error);
		});

		ffmpeg.on("close", (code) => {
			console.log(`FFmpeg process exited with code ${code}`);
		});
	} catch (error) {
		console.error("Error in prePublish handler:", error);
	}
});

nms.on("donePublish", (id, StreamPath, args) => {
	console.log(
		"[NodeEvent on donePublish]",
		`id=${id} StreamPath=${StreamPath}`
	);
});

export default nms;
