
function createJSONFile(json, fileName) {
    const blob = new Blob([JSON.stringify(json)], {type: 'text/json'});
    downloadBlobAsFile(blob, fileName);
}

function createCanvasImage(blob, fileName) { downloadBlobAsFile(blob, fileName); }

function readJSONFile(input) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = function() {
            console.log(input.files);
            res(reader.result);
        }
        reader.readAsText(input.files[0]);
    });
}

function downloadBlobAsFile(blob, fileName) {
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.download = `${fileName}.png`;
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
}

export { createJSONFile, readJSONFile, createCanvasImage };