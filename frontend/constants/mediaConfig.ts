import { useMemo } from "react";
import type { MediaConstraints } from "../types/stream";

export const useMediaConstraints = () => {
	return useMemo<MediaConstraints>(
		() => ({
			video: {
				width: { ideal: 1280 },
				height: { ideal: 720 },
				frameRate: { ideal: 30 },
				aspectRatio: { ideal: 16 / 9 },
				facingMode: "user",
			},
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
			},
		}),
		[]
	);
};
