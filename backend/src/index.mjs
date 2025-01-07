// src/index.js
import dotenv from "dotenv";
import app from "./app.mjs";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
