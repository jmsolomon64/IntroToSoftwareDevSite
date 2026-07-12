import { createCanvasImage } from './io.js';

class CanvasControls {
    CreateEditor() {
        const editor = this.#CreateSection();
        editor.append(this.#CreateToolbar());
        editor.append(this.#CreateCanvas());
        return editor;
    }

    #CreateSection() {
        const section = document.createElement('section');
        section.classList.add(`canvasSection`);
        section.id = this.Id;
        return section;
    }

    #CreateToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = `${this.Id}toolbar`;
        toolbar.classList.add('gridToolbar');
        toolbar.append(this.#CreateLabelInput(this.NameInput.id, 'Name'));
        toolbar.append(this.NameInput);
        toolbar.append(this.#CreateLabelInput(this.ColorInput.id, 'Color'));
        toolbar.append(this.ColorInput);
        toolbar.append(this.#CreateLabelInput(this.WidthInput.id, 'Width'));
        toolbar.append(this.WidthInput);
        toolbar.append(this.#CreateButton(`${this.Id}ClearButton`, 'Clear Canvas', 
            (e) => this.#ClearClick(e)));
        toolbar.append(this.#CreateButton(`${this.Id}ExportButton`, 'Export Image', 
            (e) => this.#ExportClick(e)));
        return toolbar;
    }

    #CreateLabelInput(id, text) {
        const label = document.createElement('label');
        label.id = id;
        label.textContent = text;
        return label;
    }

    #CreateInput(id, type, event, defaultVal) {
        const input = document.createElement('input');
        input.id = id;
        input.type = type;
        if(event !== undefined) input.addEventListener('change', event);
        if(defaultVal !== undefined) input.value = defaultVal;
        return input;
    }

    #CreateButton(id, text, event) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.addEventListener('click', event);
        return button;
    }

    #CreateCanvas() {
        const div = document.createElement('div');
        div.append(this.CanvasContainer.Canvas);
        return div;
    }

    #ClearClick() { 
        const width = this.CanvasContainer.Canvas.width;
        const height = this.CanvasContainer.Canvas.height;
        this.CanvasContainer.ctx.clearRect(0, 0, width, height); 
    }
    #ColorChange(element) {
        console.log('Color Change this ', this); 
        this.CanvasContainer.ctx.strokeStyle = element.value; 
    }
    #WidthChange(element) { this.CanvasContainer.LineWidth = element.value; }
    #ExportClick() {
        if(this.NameInput.value == '') {
            alert('Please give the image a name before exporting');
            return;
        }
        this.CanvasContainer.Canvas.toBlob((blob) => createCanvasImage(blob, this.NameInput.value))
    }

    constructor(id) {
        this.Id = id;
        this.CanvasContainer = new CanvasContainer();
        this.ColorInput = this.#CreateInput(`${this.Id}ColorInput`, 'color', 
            (e) => this.#ColorChange(e.target));
        this.WidthInput = this.#CreateInput(`${this.Id}WidthInput`, 'number', 
            (e) => this.#WidthChange(e.target), this.CanvasContainer.LineWidth);
        this.NameInput = this.#CreateInput(`${this.Id}NameInput`, 'text');
    }
}

class CanvasContainer {
    #CreateCanvas(id) {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = window.innerWidth - canvas.offsetLeft;
        canvas.height = window.innerHeight - canvas.offsetTop;

        canvas.addEventListener('mousedown', (e) => this.#CanvasMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.#CanvasMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.#CanvasMouseMove(e));

        return canvas;
    }
    
    #CanvasMouseDown(e) {
        this.IsDrawing = true;
        this.StartX = e.clientX;
        this.StartY = e.clientY;
    }
    
    #CanvasMouseUp(e) {
        this.IsDrawing = false;
        this.ctx.stroke();
        this.ctx.beginPath();
    }
    
    #CanvasMouseMove(e) {
        if(!this.IsDrawing) return;
        
        this.ctx.lineWidth = this.LineWidth; 
        this.ctx.lineCap = 'round'; //TODO: Update this to have brush options
        this.ctx.lineTo(e.clientX - this.Canvas.offsetLeft, e.clientY - this.Canvas.offsetTop);
        this.ctx.stroke();
    }
    
    constructor(id) {
        this.Canvas = this.#CreateCanvas(id);
        this.ctx = this.Canvas.getContext('2d');
        this.IsDrawing = false;
        this.LineWidth = 5;
        this.StartX;
        this.StartY;
    }
}

export { CanvasControls }