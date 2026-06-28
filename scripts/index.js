import { loadStyles } from "./style.js";
import * as io from './io.js';
import * as site from "./site.js";


loadStyles();
site.renderHeader(site.homeId);

// This will fire once whenever the DOM has loaded
document.addEventListener("DOMContentLoaded", function() {
    testButtonSetup();
    testInputSetup();
});

function testButtonSetup() {
    const button = document.getElementById('testButton');
    const testJson = {
        string: 'yes',
        int: 1,
        float: 1.1
    };
    button.onclick = (() => io.createJSONFile(testJson, 'test.json'));
}

function testInputSetup() {
    const input = document.getElementById('testInput');
    input.addEventListener('change', function() {
        console.log('this: ', this);
        io.readJSONFile(this).then((data) => console.log(data));
    })
}
