// ========== Exported Functionality ==========
class StyleSettings {
    #FieldAttribute = 'data-field';

    CreateStyleSettings() {
        const holder = document.createElement('div');
        for(const fieldSet in styleSet) 
            holder.append(this.#CreateFieldSet(fieldSet, styleSet[fieldSet]));
        holder.append(this.#CreateResetButton());
        return holder;
    }

    #CreateFieldSet(fieldSetName, fields) {
        const fieldSet = document.createElement('fieldset');
        fieldSet.append(this.#CreateLegend(fieldSetName));
        for(const field in fields) {
            const id = fields[field].replaceAll('-', '');
            const div = document.createElement('section')
            div.append(this.#CreateLabel(field, id));
            div.append(this.#CreateColorInput(fields[field], id));
            fieldSet.append(div);
        }
        return fieldSet;
    }

    #CreateLegend(fieldSetName) {
        const legend = document.createElement('legend');
        legend.textContent = fieldSetName;
        return legend;
    }

    #CreateLabel(fieldName, id) {
        const label = document.createElement('label');
        label.textContent = fieldName;
        label.htmlFor = id;
        return label;
    } 

    #CreateColorInput(fieldData, id) {
        const input = document.createElement('input');
        input.type = 'color';
        input.id = id;
        input.setAttribute(this.#FieldAttribute, fieldData);
        input.value = this.CSSValues.getPropertyValue(fieldData);
        input.addEventListener('change', (e) => this.#InputChange(e.target));
        return input;
    }

    #CreateResetButton() {
        const button = document.createElement('button');
        button.textContent = 'Reset Styles';
        button.addEventListener('click', () => this.#ResetStyleClick());
        return button;
    }

    #InputChange(element) {
        const varName = element.getAttribute(this.#FieldAttribute);
        //Need to create validation to make sure that choices do not break accessibility
        root.style.setProperty(varName, element.value);
        this.CookieHandler.CreateCookie(varName, element.value);
        //Need to set something up to handle cookies for saving style preferences
    }

    #ResetStyleClick() {
        //Clear all cookies
        const styleVars = getAllStyleCSSVariables();
        for(const style in styleVars) {
            root.style.removeProperty(styleVars[style]);
            this.CookieHandler.DeleteCookie(styleVars[style]);
            const input = document.getElementById(styleVars[style].replaceAll('-',''));
            input.value = this.CSSValues.getPropertyValue(styleVars[style]);
        } 
    }

    constructor(id) { 
        this.Id = id;
        this.CSSValues = getComputedStyle(root);
        this.CookieHandler = new StyleCookieManager();
    }
}

/** Load any styles from cookies that exist */
function loadStyles() {
    const cookieHandler = new StyleCookieManager();
    const styleCookies = cookieHandler.ReadCookies();
    for(const style in styleCookies) {
        root.style.setProperty(style, styleCookies[style]);
    }
}

//========== Private Functionality ==========
const root = document.querySelector(':root');
const styleSet = {
    'Global Stlyes': {
        'Background Color': '--background-color',
        'Font Color': '--font-color'
    },
    'Navigation Styles': {
        'Background Color': '--nav-background-color',
        'Font Color': '--nav-link-color',
        'Border Color': '--nav-link-border-color',
        'Hover Background Color': '--nav-link-hover-background-color',
        'Hover Font Color': '--nav-link-hover-text-color'
    },
    'File Editor Styles': {
        'Panel Color': '--grid-panel-color',
        'Header Column Color': '--grid-header-color',
        'Body Column Color': '--grid-body-color',
        'Font Color': '--grid-font-color',
        'Border Color': '--grid-border-color'
    }
};

/** @returns {string[]} All CSS variable names relating to styling */
function getAllStyleCSSVariables() {
    const styleVars = [];
    for(const set in styleSet) {
        for(const field in styleSet[set]) {
            styleVars.push(styleSet[set][field]);
        }
    }
    return styleVars;
}

class StyleCookieManager {
    /** Reads style cookies from 
     * @returns {object} Properties names are the CSS variable names, and values are the values that should be assigned to the CSS var
     */
    ReadCookies() {
        const cookies = document.cookie.split(';');
        const styleVarNames = getAllStyleCSSVariables();
        const styles = {};
        for(const cookie in cookies) {
            const cookieSet = cookies[cookie].split('=');
            const cssName = this.#CreateCSSNameFromCookieVar(cookieSet[0]);
            if(styleVarNames.includes(cssName)) {
                styles[cssName] = cookieSet[1];
            }
                
        }
        return styles;
    }

    CreateCookie(varName, value) {
        document.cookie = `${this.#CreateCookieNameFromCSSVar(varName)}=${value}; expires=${this.#CreateExpirationDate()};path=/`;
    }

    DeleteCookie(varName) {
        document.cookie = `${this.#CreateCookieNameFromCSSVar(varName)}=; expires=${this.#CreateExpiredDate()}`;
    }

    /** @param {string} cssVar */
    #CreateCookieNameFromCSSVar(cssVar) {
        return cssVar.substring(2).replaceAll('-', '_').replaceAll(' ', '');
    }
    /** @param {string} cookieVar  */
    #CreateCSSNameFromCookieVar(cookieVar) {
        return `--${cookieVar.replaceAll('_', '-').replaceAll(' ', '')}`;
    }

    #CreateExpirationDate() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date.toUTCString();
    }

    #CreateExpiredDate() {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toUTCString();
    }
    
    constructor() {}
}

export { StyleSettings, loadStyles };