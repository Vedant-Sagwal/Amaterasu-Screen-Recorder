
const videoElement = document.querySelector("video");
const startBtn = document.getElementById("startbtn");
const stopBtn = document.getElementById("stopbtn");
const videoSelectBtn = document.getElementById("choosesrcbtn");

let mediaRecorder;
let recordedChunks = [];

document.addEventListener("DOMContentLoaded", () => {
	videoSelectBtn.addEventListener("click", chooseSrc);
	startBtn.addEventListener("click", startRecording);
	stopBtn.addEventListener("click", stopRecording);
	window.electronAPI.onVideoSourceSelected((event, source) => {
		selectSource(source);
	});
});

async function chooseSrc() {
	try {
		await window.electronAPI.showVideoSourcesMenu();
	}
	catch(error) {
		console.log("error :  ", error );
		alert("Try Again!!");
	}
}

async function selectSource(source) {
	videoSelectBtn.innerText = source.name;
	const constraints = {
		audio : false,
		video : {
			mandatory : {
				chromeMediaSource : "desktop",
				chromeMediaSourceId  : source.id
			}
		}
	}
	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	videoElement.srcObject= stream;
	videoElement.play();

	const options = {mimeType : "video/webm; codecs=vp9"};
	mediaRecorder = new MediaRecorder(stream, options);
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.onstop = handleStop;
	startBtn.disabled = false;
}

function handleDataAvailable(e) {
	recordedChunks.push(e.data);
}

async function  handleStop(e) {
	const blob = new Blob(recordedChunks, {
		type : "video/webm; codecs=vp9"
	})
	const arrayBuffer = await blob.arrayBuffer()
	const path = await window.electronAPI.saveVideo();
	if (!path) {
		alert("Unable to Save!");
		return ;
	}
	try {
		await window.electronAPI.saveFile({ path, buffer : arrayBuffer });
		alert("Video saved successfully!");
	} catch (error) {
		console.error("Error saving file:", error);
		alert("Error saving file!");
	}
}


function startRecording() {
  recordedChunks = [];
  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
}

function stopRecording() {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
}
