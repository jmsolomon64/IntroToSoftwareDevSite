import { loadStyles } from "./style.js";
import * as io from './io.js';
import * as site from "./site.js";
import { Grid, GridControls } from './grid.js';


loadStyles();
site.renderHeader(site.fileEditorId);

// const test = new Grid('test');

// This will fire once whenever the DOM has loaded
document.addEventListener("DOMContentLoaded", function() {
    // testButtonSetup();
    // testInputSetup();
    testGridControls()
});

function testButtonSetup() {
    const button = document.getElementById('testButton');
    const testJson = {
        string: 'yes',
        int: 1,
        float: 1.1
    };
    button.onclick = (() => io.createJSONFile(test.RowData, 'test.json'));
}

function testGridControls() {
    const test = [ 'testControl1', 'testControl2', 'testControl3' ];
    let testGrids = []
    const holder = document.getElementById('gridHolder');
    for(const i of test) {
        let grid = new GridControls(i);
        holder.append(grid.CreatePanel());
        testGrids.push(grid);
    }
}

function testInputSetup() {
    const input = document.getElementById('testInput');
    input.addEventListener('change', function() {
        console.log('this: ', this);
        io.readJSONFile(this).then((data) => {
            const grid = new Grid('test1', 'placeholder', data);
            grid.AddNewTable().then(() => {
                console.log('grid.Id: ', grid.Id);
                console.log('grid.Columns', grid.Columns);
                console.log('grid.Rows', grid.Rows);
                console.log('grid.Table', grid.Table);
                console.log('grid.RowData', grid.RowData);
            });
        });
    })
}
