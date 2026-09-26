import {getDocument, GlobalWorkerOptions} from 'pdfjs';

GlobalWorkerOptions.workerSrc = import.meta.resolve('pdfjs/worker');

document.querySelector('input').addEventListener('change', async (event) => {
  const buffer = await event.target.files[0].arrayBuffer();
  const canvas = document.getElementById("the-canvas");
  await renderBufferToCanvas(buffer, canvas);
});

document.querySelector('#download-png').addEventListener('click', async () => {
  const canvas = document.getElementById("the-canvas");
  await downloadPNG(canvas);
});

async function renderBufferToCanvas(buffer, canvas) {
  const pdf = await getDocument({data: buffer}).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(3840 / base.width, 2160 / base.height);
  const viewport = page.getViewport({ scale });
  const outputScale = 1;

  //
  // Prepare canvas using PDF page dimensions
  //;
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

async function downloadPNG(canvas) {
  canvas.toBlob((blob) => {
    if (!blob) {
      alert('Unable to render selected file.');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'page.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}
