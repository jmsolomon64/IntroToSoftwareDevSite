
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
    /** Converts all rows from this.Rows into an array of objects */
    get RowData() { return this.#CreateDynamicObjectsFromTable(); }
    
    // =============== Public Methods ===============
    /** Appends a new table to whatever element has id == this.PlaceHolderId */
    AddNewTable() { return this.#CreateTable() }
    /** Appends a new column to an existing table */
    AddNewColumn() { this.#CreateNewColumn(); }
    /** Appends a new row to an existing table */
    AddNewRow() { this.Body.appendChild(this.#CreateNewRow()); }

    // =============== Private Methods ===============
    /** Reads all of the rows in the body and creates an array of objects where the column names are the property names */
    #CreateDynamicObjectsFromTable() {
        let allRowData = [];
        for(const row of this.Rows) {
            let rowData = {};
            let i = 0;
            for(const col of this.Columns) {
                rowData[col.textContent] = row.children[i].textContent;
                i++;
            }
            allRowData.push(rowData);
        }
        return allRowData;
    }

    // =============== UI Builder ===============
    /** Creates entire table utilizing what is in this.IO.Json */
    #CreateTable() {
        return new Promise((res, rej) => {
            const table = this.#GetNewtableElement();
            table.appendChild(this.#CreateTableHead());
            table.appendChild(this.#CreateTableBody());
            document.getElementById(this.PlaceHolderId).appendChild(table);
            res();
        });
    }
    /** Create a new thead and populate the headers based on this.IO.ColumnNames */
    #CreateTableHead() {
        const header = this.#GetNewtheadElement();
        header.appendChild(this.#CreateNewRow(this.IO.ColumnNames, true));
        return header;
    }
    /** Create a new tbody amd populate the rows based on this.IO.RowData */
    #CreateTableBody() {
        const body = this.#GetNewtbodyElement();
        for(const row of this.IO.RowData) 
            body.appendChild(this.#CreateNewRow(row));
        return body;
    }
    /** Create a new th for the header, and gives every row in the body a new td */
    #CreateNewColumn() {
        this.Header.appendChild(this.#GetNewthElement());
        const rows = this.Rows !== undefined ? this.Rows : this.IO.RowData
        for(const row of rows) row.appendChild(this.#GetNewtdElement());
    }
    /** Iterate through table columns or value properties to create a row
     * @param {object} [value=null] value whose properties contain data for the row
     * @param {boolean} [isHeading=false] whether or not a th should be used instead of td (only applies if value is not null) 
     */
    #CreateNewRow(value = null, isHeading = false) {
        let newRow = this.#GetNewtrElement();
        if(value == null) {
            for(let i = 0; i < this.Columns.length; i++) {
                const newCol =  this.#GetNewtdElement();
                newRow.appendChild(newCol);
            }
        } else {
            console.log('value: ', value);
            for(let prop in value) {
                const newCol =  isHeading ? this.#GetNewthElement() : this.#GetNewtdElement();
                newCol.textContent = value[prop];
                newRow.appendChild(newCol);
            }
        }
        return newRow;
    }

    // =============== Element Generators ===============
    /** Creates a table element for the grid */
    #GetNewtableElement() { 
        const table = document.createElement('table');
        table.id = this.Id;
        return table;
    }
    /** Creates a thead element for the grid */
    #GetNewtheadElement() { return document.createElement('thead');}
    /** Creates a tbody element for the grid */
    #GetNewtbodyElement() { return document.createElement('tbody'); }
    /** Creates a tr element for the grid */
    #GetNewtrElement() { return document.createElement('tr'); }
    /** Creates a th element for the grid */
    #GetNewthElement() { return document.createElement('th'); }
    /** Creates a td element for the grid */
    #GetNewtdElement() { return document.createElement('td'); }


    // =============== Constructor ===============
    /** Create instance of Grid class
     *  @param {string} tableId Id of the table to be created 
     *  @param {string} placeholderId location of div to append the table if making a new one
     *  @param {string} jsonData string containing valid json object or array
    */
    constructor(tableId, placeholderId = null, jsonData = null) {
        this.Id = tableId;
        this.PlaceHolderId = placeholderId;
        this.IO = new GridImportExport();
        if(jsonData != null) {
            //This means we need to dynamically create the table
            this.IO.Data = jsonData;
        }
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
    set Data(val) { this.Json = JSON.parse(val); }

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

export { Grid };

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