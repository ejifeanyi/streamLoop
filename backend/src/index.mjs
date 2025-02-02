// src/index.js
import dotenv from "dotenv";
import app from "./app.mjs";
import nms from "./rtmp-server.mjs";
import { CleanupService } from "./services/cleanup.service.mjs";

dotenv.config();

nms.run();
CleanupService.scheduleCleanup();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
