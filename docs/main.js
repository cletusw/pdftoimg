import {getDocument, GlobalWorkerOptions} from 'pdfjs';

GlobalWorkerOptions.workerSrc = import.meta.resolve('pdfjs/worker');

document.querySelector('input').addEventListener('change', async (event) => {
  const buffer = await event.target.files[0].arrayBuffer();
  renderBufferToCanvas(buffer);
});

async function renderBufferToCanvas(buffer) {
  const pdf = await getDocument({data: buffer}).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(3840 / base.width, 2160 / base.height);
  const viewport = page.getViewport({ scale });
  const outputScale = 1;

  //
  // Prepare canvas using PDF page dimensions
  //
  const canvas = document.getElementById("the-canvas");
  const context = canvas.getContext("2d");

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = Math.floor(viewport.width) + "px";
  canvas.style.height = Math.floor(viewport.height) + "px";

  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

  //
  // Render PDF page into canvas context
  //
  const renderContext = {
    canvasContext: context,
    transform,
    viewport,
  };
  page.render(renderContext);
}
