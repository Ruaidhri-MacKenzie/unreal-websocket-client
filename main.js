const HOST = "127.0.0.1";
const PORT = 2000;
const socket = new WebSocket(`ws://${HOST}:${PORT}`);

const DOM = {
	imgContainer: document.querySelector(".image-container"),
	aerial: document.getElementById("aerial"),
	uPRN: document.getElementById("uprn"),
	longitude: document.getElementById("longitude"),
	latitude: document.getElementById("latitude"),
	name: document.getElementById("name"),
	street: document.getElementById("street"),
	city: document.getElementById("city"),
	postcode: document.getElementById("postcode"),
	category: document.getElementById("category"),
	yearBuilt: document.getElementById("year-built"),
	ePCRating: document.getElementById("epc-rating"),
};

const createImgElement = (src) => {
	const element = document.createElement("img");
	element.classList.add("preview");
	element.src = src;
	element.setAttribute("alt", "Preview image");
	element.addEventListener("click", (event) => {
		if (document.fullscreenElement) document.exitFullscreen();
		else element.requestFullscreen();
	});
	return element;
};

const loadImages = (uprn, longitude, latitude, extension = "png") => {
	longitude -= longitude % 250;
	latitude -= latitude % 250;
	aerial.src = `img/aerial/${longitude}_${latitude}.png`;

	for (let i = 1; i < 10; i++) {
		const imgElement = createImgElement(`img/${uprn}/${uprn}-${i}.${extension}`);
		DOM.imgContainer.appendChild(imgElement);
	}
};

socket.addEventListener("open", (event) => {
	console.log("Connected");
	
	// const jsonTest = { testing: "test" };
	// socket.send(JSON.stringify(jsonTest));
	// socket.send("HelloThere");
});

socket.addEventListener("error", (error) => {
	console.log(error);
});

socket.addEventListener("close", (event) => {
	console.log("Disconnected");
});

socket.addEventListener("message", (event) => {
	if (event.data instanceof Blob) {
		const reader = new FileReader();

		reader.onload = () => {
			const data = JSON.parse(reader.result);
			// console.log(data);

			for (const key in data) {
				const element = DOM[key];
				const value = data[key];
				if (element) element.innerText = (value == null) ? "" : value;
			}
		};

		reader.readAsText(event.data);
	}
	else {
		console.log(event.data);
	}
});

DOM.aerial.addEventListener("click", (event) => {
	if (document.fullscreenElement) document.exitFullscreen();
	else DOM.aerial.requestFullscreen();
});

loadImages("133000816", 321564, 863043, "jpg");
