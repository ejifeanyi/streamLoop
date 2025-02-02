// src/lib/network-monitor.ts
export class NetworkMonitor {
	private static instance: NetworkMonitor;
	private currentQuality: string = "high";
	private measurementInterval: number = 2000; // 2 seconds
	private measurements: number[] = [];
	private callback: ((quality: string) => void) | null = null;

	private constructor() {
		this.startMeasuring();
	}

	static getInstance(): NetworkMonitor {
		if (!NetworkMonitor.instance) {
			NetworkMonitor.instance = new NetworkMonitor();
		}
		return NetworkMonitor.instance;
	}

	private startMeasuring() {
		setInterval(() => {
			this.measureNetworkSpeed();
		}, this.measurementInterval);
	}

	private async measureNetworkSpeed() {
		const startTime = performance.now();
		try {
			const response = await fetch("/api/network-test", {
				method: "HEAD",
			});
			const endTime = performance.now();
			const duration = endTime - startTime;
			const speed = 1000 / duration; // Rough speed metric

			this.measurements.push(speed);
			if (this.measurements.length > 5) {
				this.measurements.shift();
			}

			this.updateQuality();
		} catch (error) {
			console.error("Network measurement failed:", error);
			this.measurements.push(0);
		}
	}

	private updateQuality() {
		const avgSpeed =
			this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length;
		let newQuality = "low";

		if (avgSpeed > 2.0) {
			newQuality = "high";
		} else if (avgSpeed > 1.0) {
			newQuality = "medium";
		}

		if (newQuality !== this.currentQuality) {
			this.currentQuality = newQuality;
			if (this.callback) {
				this.callback(newQuality);
			}
		}
	}

	public onQualityChange(callback: (quality: string) => void) {
		this.callback = callback;
	}

	public getCurrentQuality(): string {
		return this.currentQuality;
	}
}
