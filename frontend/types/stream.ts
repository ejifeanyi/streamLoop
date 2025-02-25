import { Socket as SocketIOSocket } from "socket.io-client";
// Import the specific types from mediasoup-client
import { types as mediasoupTypes } from "mediasoup-client";

// Only import types we actually use in interfaces
export type Socket = SocketIOSocket;

// Use mediasoup's types directly where needed
export type RtpCapabilities = mediasoupTypes.RtpCapabilities;
export type IceParameters = mediasoupTypes.IceParameters;
export type IceCandidate = mediasoupTypes.IceCandidate;
export type DtlsParameters = mediasoupTypes.DtlsParameters;

export interface MediaConstraints {
	audio?: boolean | MediaTrackConstraints;
	video?: boolean | MediaTrackConstraints;
}

export interface AuthResponse {
	success: boolean;
	rtpCapabilities?: RtpCapabilities;
	error?: string;
}

export interface TransportResponse {
	success: boolean;
	transport?: {
		id: string;
		iceParameters: IceParameters;
		iceCandidates: IceCandidate[];
		dtlsParameters: DtlsParameters;
	};
	error?: string;
}

export interface ConnectResponse {
	success: boolean;
	error?: string;
}

export interface ProduceResponse {
	success: boolean;
	producerId?: string;
	error?: string;
}

export interface StartStreamResponse {
	success: boolean;
	error?: string;
}

export interface StreamSession {
	id: string;
	title: string;
	createdAt: string;
	status: "pending" | "live" | "ended";
	viewerCount?: number;
	duration?: number;
}
