import app from "./app.mjs";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Running on port ${PORT}`);
});
