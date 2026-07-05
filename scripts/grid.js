import * as io from './io.js';

/** Allows for creation and control of a dynamic table in HTML */
class Grid {
    // =============== Getters ===============
    /** Returns table element with id == this.Id */
    get Table() { return document.getElementById(this.Id); }
    /** Returns thead from this.Table */
    get Header() { return this.Table.querySelector('thead'); }
    /** Returns tbody from this.Table */
    get Body() { return this.Table.querySelector('tbody'); }
    /** Returns all th from this.Header */
    get Columns() { return this.Header.querySelectorAll('th'); }
    /** Returns all tr from this.Body */
    get Rows() { return this.Body.querySelectorAll('tr'); }
    /** Returns all cells from this.Body */
    get Cells() { return this.Body.querySelectorAll('td'); }
    /** Converts all rows from this.Rows into an array of objects */
    get RowData() { return this.IO.GetObjectDataFromTable(this.Rows, this.Columns); }
    
    // =============== Public Methods ===============
    /** Appends a new table to whatever element has id == this.PlaceHolderId */
    AddNewTable() { return this.UI.CreateTable(this.IO.ColumnNames, this.IO.RowData); }
    /** Appends a new column to an existing table */
    AddNewColumn() { this.UI.CreateNewColumn(this.Rows, this.Header.firstChild); }
    /** Appends a new row to an existing table */
    AddNewRow() { this.Body.appendChild(this.UI.CreateNewRow(this.Columns)); }

    DeleteRow() { this.UI.DeleteRow(this.Table); }

    DeleteColumn() {this.UI.DeleteColumn(this.Table); }

    // =============== Constructor ===============
    /** Create instance of Grid class
     *  @param {string} tableId Id of the table to be created 
     *  @param {string} placeholderId location of div to append the table if making a new one
     *  @param {string} jsonData string containing valid json object or array
    */
    constructor(tableId, placeholderId = null, jsonData = null) {
        this.Id = tableId;
        this.IO = new GridImportExport();
        this.UI = new GridBuilder(placeholderId, tableId);
        if(jsonData != null) {
            //This means we need to dynamically create the table
            this.IO.Data = jsonData;
        } else {
            this.IO.Data = this.RowData;
        }
        if(this.Table !== null) {
            this.UI.AddOnClickEventsToAllBodyCells(this.Cells);
        }
    } 
}

class GridControls {
    //Holds instance of grid
    //--Config state
    //Holds buttons for importing/creating new
    //  logic for handling input usage
    //  after one of these two options are used, we change state from config state

    //--Main state 
    //Holds table, buttons for adding new rows/columns
    //Also buttons for removing rows/columns
    //Input for the name of the file at the top of the panel
    //Button and logic for exporting file 


    // =============== UI Builder ===============
    CreatePanel() {
        const summary = this.#CreateSummary();
        summary.append(this.TitleNode);
        
        const inputs = this.#CreateInputHolder();
        inputs.append(this.#CreateNewButton());
        inputs.append(this.#CreateFileUpload());
        
        this.PanelNode.append(summary);
        this.PanelNode.append(inputs);
        return this.PanelNode;
    }
    
    // =============== Private UI Methods ===============
    #CreatePanel() {
        const panel = document.createElement('details');
        panel.classList.add(this.#PanelClass);
        panel.id = this.Id;
        return panel;
    }

    #CreateSummary() {
        const summary = document.createElement('summary');
        summary.classList.add(this.#PanelSummaryClass);
        return summary;
    }

    #CreateTitle() {
        const title = document.createElement('input');
        title.type = 'text';
        title.id = `${this.Id}title`;
        return title;
    }

    #CreateInputHolder() { 
        const holder = document.createElement('div');
        holder.id = this.InputHolderId;
        return holder;
    }

    #CreateNewButton() { 
        const btn = document.createElement('button');
        btn.id = this.CreateBtnId;
        btn.textContent = 'Create New';
        return btn;
    }

    #CreateFileUpload() {
        const input = document.createElement('input')
        input.id = this.FileUploadId;
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => this.#FileUploadChange(e.target));
        return input;
    }

    #CreateExportButton() {
        const btn = document.createElement('button');
        btn.id = this.ExportBtnId;
        btn.textContent = 'Export File';
        btn.addEventListener('click', (e) => this.#FileExport(e.target));
        return btn;
    }

    #CreateButton(text, event) {
        const button = document.createElement('button');
        button.classList.add('gridButton');
        button.textContent = text;
        button.addEventListener('click', (e) => event(e.target));
        return button;
    }

    #CreateGridModifyButtonHolder() {
        const holder = document.createElement('div');
        holder.append(this.#CreateButton('Add Row', () => this.Grid.AddNewRow()));
        holder.append(this.#CreateButton('Remove Row', () => this.Grid.DeleteRow()));
        holder.append(this.#CreateButton('Add Column', () => this.Grid.AddNewColumn()));
        holder.append(this.#CreateButton('Remove Column', () => this.Grid.DeleteColumn()));
        return holder;
    }

    #CreateGrid(data) {
        this.Grid = new Grid(this.GridId, this.Id, data);
        const holder = document.getElementById(this.InputHolderId);
        holder.innerHTML = ''
        holder.append(this.#CreateGridModifyButtonHolder());
        this.Grid.AddNewTable().then((table) => {
            holder.append(table);
            holder.append(this.#CreateExportButton());
        });
    }

    // =============== Events ===============
    #FileUploadChange(element) { 
        this.TitleNode.value = element.files[0].name.replace('.json', '');
        io.readJSONFile(element).then((data) => this.#CreateGrid(data));
     } 
     #FileExport(element) {
        io.createJSONFile(this.Grid.RowData, `${this.TitleNode.value}.json`);
     }
    #AddRow(grid) { grid.AddNewRow(); }

    #PanelClass = 'gridControlPanel';
    #PanelSummaryClass = 'panelTitle';

    constructor(panelId) {
        this.Id = panelId;
        this.GridId = `${this.Id}grid`;
        this.InputHolderId = `${this.Id}inputHolder`;
        this.GridButtonHolder = `${this.Id}GridButtonHolder`;
        this.CreateBtnId = `${this.Id}CreatButton`;
        this.FileUploadId = `${this.Id}FileInput`;
        this.ExportBtnId = `${this.Id}ExportButton`;
        this.PanelNode = this.#CreatePanel();
        this.TitleNode = this.#CreateTitle();
        this.Grid = null;
    }
}

class GridBuilder {
    // =============== UI Builder ===============
    /** Creates entire table 
     * @param {string[]} columnNames Names for the headers
     * @param {object[]} rowData Data to populate the rows of the table
    */
    CreateTable(columnNames, rowData) {
        return new Promise((res, rej) => {
            const table = this.#GetNewtableElement();
            this.#CreateTableHead(columnNames).then((header) => {
                table.appendChild(header);
                this.#CreateTableBody(rowData).then((body) => table.appendChild(body))
                // .then(() => document.getElementById(this.PlaceHolderId).appendChild(table))
                .then(() => res(table));
            });
        });
    }
    /** Create a new th for the header, and gives every row in the body a new td
     * @param {HTMLElement[]} rows rows to have a new column appended 
     */
    CreateNewColumn(rows, header) {
        header.appendChild(this.#GetNewthElement());
        for(const row of rows) row.appendChild(this.#GetNewtdElement());
    }
    /** Iterate through table columns or value properties to create a row
     * @param {object[]} columns some sort of iterable to know how many cols to make in row
     * @param {boolean} [hasValue=false] determines if iterable has value to place into columns in the row
     * @param {boolean} [isHeading=false] determines if row is filled with td or th elements 
     */
    CreateNewRow(columns, hasValue = false, isHeading = false) {
        let newRow = this.#GetNewtrElement();
        if(columns instanceof NodeList) this.#NodeListRowHandler(columns, isHeading, hasValue, newRow);
        else this.#OtherRowHandler(columns, isHeading, hasValue, newRow);
        return newRow;
    }

    DeleteRow(table) {
        //Check if input is present on any row
        //  If so delete that row
        //  If not delete the buttom row
        let input = document.getElementById(this.CellInputId);
        if(input != null) {
            console.log('closest:', input.closest('tr'));
            let index = input.closest('tr').rowIndex;
            
            if(index != 0) {
                table.deleteRow(index);
            } else alert('Cannot delete header.');
            return;
        } 
        alert('Please select row to delete');
    }

    DeleteColumn(table) {
        let input = document.getElementById(this.CellInputId);
        if(input != null) {
            console.log('closest:', input.closest('tr'));
            let index = input.closest('td').cellIndex;

            for(let i = 0; i < table.rows.length; i++) 
                table.rows[i].deleteCell(index);
            
            return;
        } 
        alert('Please select column to delete');
    }

    #CreateRow(col, isHeading, hasValue, newRow) {
        const newCol =  isHeading ? this.#GetNewthElement() : this.#GetNewtdElement();
        if(hasValue) newCol.textContent = col;
        
        newRow.appendChild(newCol);
    }

    #NodeListRowHandler(nodelist, isHeading, hasValue, newRow) {
        nodelist.forEach((col) => this.#CreateRow(col, isHeading, hasValue, newRow));
    }

    #OtherRowHandler(columns, isHeading, hasValue, newRow) {
        for(const col in columns) {
            this.#CreateRow(columns[col], isHeading, hasValue, newRow);
        }
    }

    AddOnClickEventsToAllBodyCells(cells) {
        for(const cell of cells) {
            cell.addEventListener('click', this.#CellOnClick)
            //Create an input, input will be based on some attribute added to cell later
        }
    }

    /** Create a new thead and populate the headers
     * @param {string[]} columnNames names to populate in th elements for column header row 
     */
    #CreateTableHead(columnNames) {
        return new Promise((res, rej) => {
            const header = this.#GetNewtheadElement();
            header.appendChild(this.CreateNewRow(columnNames, true, true));
            res(header);
        });
    }
    /** Create a new tbody amd populate the rows 
     * @param {object[]} rowData data to populate body rows  
    */
    #CreateTableBody(rowData) {
        return new Promise((res, rej) => {
            const body = this.#GetNewtbodyElement();
            for(const row in rowData) 
                body.appendChild(this.CreateNewRow(rowData[row], true));
            res(body);
        })
    }

    // =============== Events ===============
    #CellOnClick(args) {
        const cell = args.target;
        let input = document.getElementById(this.CellInputId);
        if(input == null) {
            input = document.createElement('input');
            input.id = this.CellInputId;
            input.type = 'text';
        } else if(cell.contains(input)) {
            return; // if cell already has input no need to do anything
        } else {
            const oldCell = input.parentElement;
            oldCell.textContent = input.value;
        }
        
        input.value = cell.textContent;
        cell.textContent = '';
        cell.appendChild(input);
        input.focus();
    }

    // =============== Element Generators ===============
    /** Creates a table element for the grid */
    #GetNewtableElement() { 
        const table = document.createElement('table');
        table.id = this.TableId;
        return table;
    }
    /** Creates a thead element for the grid */
    #GetNewtheadElement() { return document.createElement('thead');}
    /** Creates a tbody element for the grid */
    #GetNewtbodyElement() { return document.createElement('tbody'); }
    /** Creates a tr element for the grid */
    #GetNewtrElement() { return document.createElement('tr'); }
    /** Creates a th element for the grid */
    #GetNewthElement() { 
        const element = document.createElement('th');
        element.addEventListener('click', (e) => this.#CellOnClick(e));
        return element;
    }
    /** Creates a td element for the grid */
    #GetNewtdElement() { 
        const element = document.createElement('td');
        element.addEventListener('click', (e) => this.#CellOnClick(e));
        return element;
     }

    // =============== Constructor ===============
    /** 
     * @param {string} placeHolderId element id to place table in 
     */
    constructor(placeHolderId, tableId) {
        this.PlaceHolderId = placeHolderId;
        this.TableId = tableId;
        this.CellInputId = `${this.TableId}_input`
    }
}

/** Handles Importing and Exporting of JSON data to table */
class GridImportExport {
    // =============== Getters/Setters ===============
    /** Retrieves all property names from this.Json */
    get ColumnNames() { return this.#ParseColumns(); }
    /** Retrieves all of the records from this.Json, will add columns if an object is missing some from this.ColumnNames */
    get RowData() { return this.#ParseRows(); }
    /** Convert string data into JSON */
    set Data(val) { typeof val === 'string' ? this.Json = JSON.parse(val) : this.Json = val; }
    
    // =============== Public Methods ===============
    /** Reads all of the rows in the body and creates an array of objects where the column names are the property names
     * @param {HTMLElement[]} rows to convert into object
     * @param {HTMLElement[]} cols to use to get property names for object  
     */
    GetObjectDataFromTable(rows, cols) {
        let allRowData = [];
        for(const row of rows) {
            let rowData = {};
            let i = 0;
            for(const col of cols) {
                rowData[col.textContent] = row.children[i].textContent;
                i++;
            }
            allRowData.push(rowData);
        }
        return allRowData;
    }

    // =============== Private Methods ===============
    /** Retrieves a unique list of all of the property names for the objects in this.Json */
    #ParseColumns() {
        let columnNames = [];
        if(Array.isArray(this.Json)) {
            for(const obj of this.Json) {
                for(const prop in obj) {
                    if(!columnNames.includes(prop))
                        columnNames.push(prop);
                }   
            }
        } else {
            for(const prop in this.Json) {
                if(!columnNames.includes(prop))
                    columnNames.push(prop);
            }   
        }
        return columnNames;
    }
    /** Retrieves objects from this.Json and appends properties if an object is missing any */
    #ParseRows() {
        if(Array.isArray(this.Json)) {
            let allRowData = [];
            for(const obj of this.Json) {
                let rowData = {};
                for(const col of this.ColumnNames) {
                    const val = obj[col] !== undefined ? obj[col] : null;  
                    rowData[col] = val;
                }
                allRowData.push(rowData);
            }
            return allRowData;
        } 
        return [this.Json];
    }

    // =============== Constructor ===============
    constructor() {
        this.Json = null;
    }
}

export { Grid, GridControls };


// =============== Rough Draft/Ideas ===============
    //Grid:
    //  Id: html Id of table itself
    //  Rows: list of records on table and their values
    //  Columns: list of the columns on table with their names
    //  AddRow: adds a row to table
    //  AddCol: adds a col to table

    // *-*-*-*-*-*- Keep in mind we may want to allow this class to take control of existing table
    
    // ---------- Idea for Rows/Columns getters ----------
    // What if we have the table rows and headers editable 
    //  th will be used to track col data
    //      Use dom query to get values from table headers from table with id
    //  tr will be used to track row data
    //      Like wise use dom query to get each tr from table with Id
    //      create objects from values of each row and add object to array
    //          need to figure out how to dynamically name props to match column names that user can change too

    // ---------- How do I want to interact with this table?
    // Will need this to allow JSON data to create the table for me
    //      Will need to determine how to handle when an array of objects is added with differing objects
    //          Probably build something that keeps track of every property enters and make sure that every objecthas a place for its property somewhere. 
    //          Need to consider fuzzy matching (or whatever its called) to ensure if there is mispelling, it can be caught and put in the right col
    //      Should also give alert to user that the file did not contain all of the same items, and to please review how items have been imported before continuing.


    //TODO later 2026-06-28
    // Create Grid controls class that will also be exported
    // Will contain buttons for handling input from file to create table
    // Will also have the ability to rename the header later since we need controls for creating brand new table
    // Handle buttons for creating table from scratch with 1 col/row
    // buttons to add more columns and rows available to import and new table