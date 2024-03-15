// Autor: Dederick Pieterse

var pubLocs = {};

//an asyncronous function to retreive the data from the server
async function getData(direction){
    const response = await fetch("/data/" + direction);
    const data = await response.json();
    return data;
  }

function loadIframe(fileName){
    //get the iframe element
    iFrame = document.getElementById('ireadid');
    iFrame.src = "" + fileName + "#zoom=scale,left,top&view=Fit&toolbar=0&navpanes=0&scrollbar=0";
    //set iFrame style to display block
    iFrame.style.display = "block";
    iFrame.style.position = "fixed";
    iFrame.style.left = "0";
    iFrame.style.top = "0";
    iFrame.style.width = "100%";
    iFrame.style.height = "100%";
    iFrame.style.border = "none";
    iFrame.style.margin = "0";
    iFrame.style.padding = "0";
    iFrame.style.overflow = "hidden";
    iFrame.style.zIndex = "999999";

    //hide the footer div
    let footer = document.getElementById("foot");
    footer.style.display = "none";
  }

function updateView(data) {
    //sort the fileNames array
    sortedFilenames = data.fileNames.sort(function(a, b){
        return a.split(";")[0] - b.split(";")[0]; //sort ascending
      });
    const dayst = data.fileNames[0].split(";")[0];
    fileNameValt = data.fileNames[0].replace(dayst + ";", "");
    loadIframe("/resources/" + data.direction + "/" + fileNameValt + data.fileType);
}


function showReader(direction){
    let loadingScreen = document.getElementById("loadingScreen");
    populatePubLocs(direction);
  //set data list to the correct direction
    updateView(pubLocs[direction]);
    loadingScreen.style.display = "none";
  //show the readContainer div
    let readContainer = document.getElementById("readerContainer");
    readContainer.style.display = "block";
  }

async function populatePubLocs(direction){
    pubLocs[direction] = await getData(direction);
  }

window.onload = async function() {
    const direction = location.pathname.split("/")[2];
    await populatePubLocs(direction);
    showReader(direction);
}