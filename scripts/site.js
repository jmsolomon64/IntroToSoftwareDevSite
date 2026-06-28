const headerFile = './partials/header.html';
const homeId = 'homeLink';
const fileEditorId = 'fileEditorLink';
const textureId = 'textureCreatorLink';
const resourceId = 'resourcesLink';
const settingsId = 'settingsLink';

/*** Creates the Header for easy re-use*/
function renderHeader(activeId) {
    fetch(headerFile)
    .then((response) => response.text())
    .then((html) => document.body.insertAdjacentHTML('afterbegin', html))
    .then(() => {
        const activeElement = document.getElementById(activeId);
        activeElement.classList.add('active');
    });
}



export { homeId, fileEditorId, textureId, resourceId, settingsId, renderHeader };