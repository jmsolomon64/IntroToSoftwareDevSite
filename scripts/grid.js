
/** Allows for creation and control of a dynamic table in HTML */
class Grid {
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

    // ---------- 
    
    // =============== Getters ===============
    /**  */
    get Table() { return document.getElementById(this.Id); }
    /**  */
    get Header() { return this.Table.querySelector('thead'); }
    /**  */
    get Body() { return this.Table.querySelector('tbody'); }
    /**  */
    get Columns() { return this.Header.querySelectorAll('th'); }
    /**  */
    get Rows() { return this.Body.querySelectorAll('tr'); }
    /**  */
    get RowData() { return this.#CreateDynamicObjectsFromTable(); }
    
    // =============== Public Methods ===============
    /** */
    AddNewColumn() { this.#CreateNewColumn(); }
    /** */
    AddNewRow() { this.#CreateNewRow(); }

    // =============== Private Methods ===============
    /** */
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
    /** */
    #CreateNewColumn() {
        this.Header.appendChild(this.#GetNewthElement());
        for(const row of this.Rows) {
            row.appendChild(this.#GetNewtdElement());
        } 
    }
    /** */
    #CreateNewRow() {
        let newRow = this.#GetNewtbodytrElement();
        let colLength = this.Columns.length;
        for(let i = 0; i < colLength; i++) {
            newRow.appendChild(this.#GetNewtdElement());
        }
        this.Body.appendChild(newRow);
    }

    // In case I want to make the cells more complicated later
    /** */
    #GetNewthElement() { return document.createElement('th'); }
    /** */
    #GetNewtdElement() { return document.createElement('td'); }
    /** */
    #GetNewtbodytrElement() { return document.createElement('tr'); }

    // =============== Constructor ===============
    /** @param {string} tableId Id of the table to be created */
    constructor(tableId) {
        this.Id = tableId;
    } 
}

//Need to create an object that will take all options for the table on constructor (Do this later)

export { Grid };