const rootSelector = ':root';
const root = document.querySelector(rootSelector);
const backgroundColor = '--background-color';
//Nav variables
const navBackgroundColor = '--nav-background-color';
const navLinkColor = '--nav-link-color';
const navLinkBorderColor = '--nav-link-border-color';
const navLinkHoverBackgroundColor = '--nav-link-hover-background-color';
const navLinkHoverTextColor = '--nav-link-hover-text-color';

//TODO: add variables for every css variable used in styling

function loadStyles() {
    //root.style.setProperty(backgroundColor, 'blue');
}

//TODO: create logic to read all cookies
//TODO: create logic to update cookies when user changes preferences

export { loadStyles };