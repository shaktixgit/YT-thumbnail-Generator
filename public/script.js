const form = document.querySelector("#generatorForm");
const thumbnailInput = document.querySelector("#thumbnailInput");
const portraitInput = document.querySelector("#portraitInput");
const thumbnailPreview = document.querySelector("#thumbnailPreview");
const portraitPreview = document.querySelector("#portraitPreview");
const statusMessage = document.querySelector("#statusMessage");
const generateButton = document.querySelector("#generateButton");
const resultImage = document.querySelector("#resultImage");
const emptyResult = document.querySelector("#emptyResult");
const downloadButton = document.querySelector("#downloadButton");

thumbnailInput.addEventListener("change", () => previewUpload(thumbnailInput, thumbnailPreview));
portraitInput.addEventListener("change", () => previewUpload(portraitInput, portraitPreview));
form.addEventListener("submit", generateFaceSwap);

function previewUpload(input, image) {
  const file = input.files?.[0];

  if (!file) {
    image.hidden = true;
    image.removeAttribute("src");
    return;
  }

  image.src = URL.createObjectURL(file);
  image.hidden = false;
}

async function generateFaceSwap(event) {
  event.preventDefault();
  setStatus("Generating your face-swapped thumbnail...");
  setLoading(true);

  try {
    const formData = new FormData(form);
    const response = await fetch("/api/generate", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "The image could not be generated.");
    }

    resultImage.src = payload.image;
    resultImage.hidden = false;
    emptyResult.hidden = true;
    downloadButton.href = payload.image;
    downloadButton.hidden = false;
    setStatus("Done. Your generated thumbnail is ready.");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.textContent = isLoading ? "Generating..." : "Generate Face Swap";
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}
