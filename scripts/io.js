
function createJSONFile(json, fileName) {
    const blob = new Blob([JSON.stringify(json)], {type: 'text/json'});
    const link = document.createElement('a');
    link.download = fileName;
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

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

export { createJSONFile, readJSONFile };