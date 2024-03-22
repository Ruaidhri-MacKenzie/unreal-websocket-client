const TILESIZE_X = 250;
const TILESIZE_Y = 250;
const HOST = "127.0.0.1";
const PORT = 2000;
const DOM = {
	layout: document.querySelector(".layout"),
	splashContainer: document.querySelector(".splash-container"),
	dataContainer: document.querySelector(".data-container"),
	imageContainer: document.querySelector(".image-container"),
	panoramaContainer: document.querySelector(".panorama-container"),

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

// Create WebSocket client
const socket = new WebSocket(`ws://${HOST}:${PORT}`);

// Create panorama viewer
const panoramaViewer = new PANOLENS.Viewer({
	container: DOM.panoramaContainer,
	controlBar: false,
});

const showSplash = () => {
	DOM.dataContainer.classList.add("hidden");
	DOM.imageContainer.classList.add("hidden");
	DOM.panoramaContainer.classList.add("hidden");

	DOM.splashContainer.classList.remove("hidden");
};

const showBuildingData = () => {
	DOM.splashContainer.classList.add("hidden");
	DOM.panoramaContainer.classList.add("hidden");

	DOM.dataContainer.classList.remove("hidden");
	DOM.imageContainer.classList.remove("hidden");
};

const showPanorama = () => {
	DOM.splashContainer.classList.add("hidden");
	DOM.dataContainer.classList.add("hidden");
	DOM.imageContainer.classList.add("hidden");

	DOM.panoramaContainer.classList.remove("hidden");
};

const populateDataList = (data) => {
	for (const key in data) {
		const element = DOM[key];
		const value = data[key];
		if (element) element.innerText = (value == null) ? "" : value;
	}
};

const createImageElement = (src) => {
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

const loadImages = (longitude, latitude, uprn) => {
	DOM.imageContainer.replaceChildren();
	loadAerialImage(longitude, latitude);
	loadThermalImages(longitude, latitude, uprn, 9);
};

const loadAerialImage = (longitude, latitude) => {
	longitude -= longitude % TILESIZE_X;
	latitude -= latitude % TILESIZE_Y;

	const imageElement = createImageElement(`img/${longitude}_${latitude}/aerial/${longitude}_${latitude}-aerial.png`);
	DOM.imageContainer.appendChild(imageElement);
};

const loadThermalImages = (longitude, latitude, uprn, imageCount) => {
	longitude -= longitude % TILESIZE_X;
	latitude -= latitude % TILESIZE_Y;

	for (let i = 0; i < imageCount; i++) {
		const imageElement = createImageElement(`img/${longitude}_${latitude}/${uprn}/thermal/${uprn}-thermal-${i}.jpg`);
		DOM.imageContainer.appendChild(imageElement);
	}
};

const loadPanoramicImage = (longitude, latitude, uprn, index = 0) => {
	longitude -= longitude % TILESIZE_X;
	latitude -= latitude % TILESIZE_Y;

	const panoramaImage = new PANOLENS.ImagePanorama(`img/${longitude}_${latitude}/${uprn}/panoramic/${uprn}-panoramic-${index}.jpg`);
	panoramaViewer.add(panoramaImage);
	panoramaViewer.setPanorama(panoramaImage);
};

// Bind socket events
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
			if (reader.result === "Splash") {
				showSplash();
			}
			else if (reader.result === "BuildingData") {
				showBuildingData();
			}
			else if (reader.result === "Panorama") {
				showPanorama();
			}
			else {
				const data = JSON.parse(reader.result);
				// console.log(data);

				// Set Text Data
				populateDataList(data);
				
				// Load Images
				loadImages(data.longitude, data.latitude, data.uPRN);	
			}
		};

		reader.readAsText(event.data);
	}
	else {
		console.log(event.data);
	}
});

document.addEventListener("keydown", (event) => {
	// console.log(event.key);
	if (event.key === "1") {
		showSplash();
	}
	else if (event.key === "2") {
		showBuildingData();
	}
	else if (event.key === "3") {
		showPanorama();
	}
	else if (event.key === "Enter") {
		DOM.layout.requestFullscreen();
	}
	else if (event.key === " ") {
		loadPanoramicImage(321500, 863000, 133000816, 1);
	}
});

loadPanoramicImage(321500, 863000, 133000816);
loadPanoramicImage(321500, 863000, 133000816, 1);
showSplash();
