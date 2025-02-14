export interface StreamSession {
	id: string;
	rtmpUrl?: string;
	streamKey?: string;
}

export interface VideoConstraints {
	width: { ideal: number };
	height: { ideal: number };
	frameRate: { ideal: number };
	aspectRatio: { ideal: number };
	facingMode: string;
}

export interface AudioConstraints {
	echoCancellation: boolean;
	noiseSuppression: boolean;
	autoGainControl: boolean;
}

export interface MediaConstraints {
	video: VideoConstraints;
	audio: AudioConstraints;
}
