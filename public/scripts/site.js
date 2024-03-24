// Author: Dederick Pieterse

var pubLocs = {};
let folderCated = {};
let foldersCatless = {};
let urlCatless = {};
let urlCated = {};
var visitors;

var visitHeadings = "";

//an asyncronous function to retreive the data from the server
async function getData(direction){
  const response = await fetch("/data/" + direction);
  const data = await response.json();
  return data;
}

async function countShe(){
  const response = await fetch("/countShe");
  const data = await response.json();
  return data;
}

async function getVisitors() {
  const response = await fetch("/visitData");
  const data = await response.json();
  return data;
}

function updateVisitView(data) {
  setBanner(false, getBannerStatus());
  let container = document.getElementById("visitList");
  if(container !== null){
    var linkToAdd = "";
    var innerText = "";
    data.forEach(function(visitor){
      const dateStart = new Date(visitor['Start Visit']);
      const dateEnd = new Date(visitor['End Visit']);
      const dStartShow = dateStart.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
      const dEndShow = dateEnd.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
      const now = new Date();
      const status = visitor['Status'];
        linkToAdd = "<tr>";
        linkToAdd += "<td>"+ visitor['Visiting Company'] +"</td>";
        linkToAdd += "<td>"+ visitor['Reference'] +"</td>";
        linkToAdd += "<td>"+ visitor['Purpose / Activity of Visit'] +"</td>";
        linkToAdd += "<td>"+ visitor['Visitor Count'] +"</td>";
        linkToAdd += "<td>"+ visitor['Visitor(s)'] +"</td>";
        linkToAdd += "<td>"+ visitor['Requestor'] +"</td>";
        linkToAdd += "<td>"+ visitor['Escort(s)'] +"</td>";
        linkToAdd += "<td>"+ visitor['Department'] +"</td>";
        if(dateStart <= now){
          linkToAdd += "<td style=\"background-color: green; color: white;\">"+ dStartShow +"</td>";
        }else{
          linkToAdd += "<td style=\"background-color: red; color: white;\">"+ dStartShow +"</td>";
        }
        if(dateEnd >= now){
          linkToAdd += "<td style=\"background-color: green; color: white;\">"+ dEndShow +"</td>";
        }else{
          linkToAdd += "<td style=\"background-color: red; color: white;\">"+ dEndShow +"</td>";
        }
        if(status === "Approved"){
          linkToAdd += "<td style=\"background-color: green; color: white;\">"+ visitor['Status'] +"</td>";
        }else{
          linkToAdd += "<td style=\"background-color: red; color: white;\">"+ visitor['Status'] +"</td>";
        }
        linkToAdd += "</tr>";
        innerText += linkToAdd + "\n";
    });
    container.innerHTML = visitHeadings + innerText;
  }
}

function updateView(data) {
  setBanner(false, getBannerStatus());
  let container = document.getElementById("sideList");
  if(container !== null){
    var linkToAdd = "";
    var innerText = "";
    //sort the fileNames array
    sortedFilenames = data.fileNames.sort(function(a, b){
      return a.split(";")[0] - b.split(";")[0]; //sort ascending
    });
    sortedFilenames.forEach(function(fileNameVal){
      //get days from fileNameVal which will be the number before the first ; in the string
      const days = fileNameVal.split(";")[0];
      //remove the days from the fileNameVal and also remove the ; from the string
      fileNameVal = fileNameVal.replace(days + ";", "");
      linkToAdd =  "<a class=" + "\"" + "itemlink" + "\"" + " onclick=" + "\"" + "loadIframe('/resources/" + data.direction + "/" + fileNameVal + data.fileType + "')" + "\"" + ">" + fileNameVal + "</a>";
      innerText += linkToAdd + "\n";
    });
    container.innerHTML = innerText;
    const dayst = data.fileNames[0].split(";")[0];
    fileNameValt = data.fileNames[0].replace(dayst + ";", "");
    loadIframe("/resources/" + data.direction + "/" + fileNameValt + data.fileType);
  }
}

function showError(err) {
  console.error(err);
  //alert("Something went wrong");
}

function loadIframe(fileName){
  document.getElementById('ireadid').src = "" + fileName;
  setBanner(false, getBannerStatus());
}

async function showReader(direction){
  hide01SSHR_Inspection_Report();
  hide02All_other_TARPS();
  hide07RSHQ_Safety_Alerts();
  if(direction === "shebriefs"){
    countShe();
  }
//set data list to the correct direction
  updateView(pubLocs[direction]);
//hide the MenuItems container div
  let menuItems = document.getElementById("menuItems");
  menuItems.style.display = "none";
//show the readContainer div
  let readContainer = document.getElementById("readerContainer");
  readContainer.style.display = "block";
  setBanner(false, getBannerStatus());
//show the MenuAndBack container div
  let menuAndBack = document.getElementById("menuAndBack");
  menuAndBack.style.display = "flex";
}

async function showVisit(){
  updateVisitView(visitors);
  //hide the MenuItems container div
  let menuItems = document.getElementById("menuItems");
  menuItems.style.display = "none";
  //show the visitorsList container div
  let visitorsList = document.getElementById("visitList");
  visitorsList.style.display = "block";
  setBanner(false, getBannerStatus());
  //show the MenuAndBack container div
  let menuAndBack = document.getElementById("menuAndBack");
  menuAndBack.style.display = "flex";
  //get an updated list from the server
  visitors = await getVisitors();
}

//function showGHR(){
//  let menuAndBack = document.getElementById("menuAndBack");
//  menuAndBack.style.display = "flex";
//  let menuItems = document.getElementById("menuItems");
//  menuItems.style.display = "none";
// let GHRContainer = document.getElementById("GHRContainer");
//  GHRContainer.style.display = "block";
//
//  let container = document.getElementById("ireadidGHR");
//  // \\lsaucap001\wrkgroup\Technical Services\Monthly Geotechnical Hazard Reports\Dashboards\GHR Report\slides.html
//  container.src = "../slides.html";
//}

function showHazReg(){
  let menuAndBack = document.getElementById("menuAndBack");
  menuAndBack.style.display = "flex";
  let menuItems = document.getElementById("menuItems");
  menuItems.style.display = "none";
  let GHRContainer = document.getElementById("HazardRegContainer");
  GHRContainer.style.display = "block";
  setBanner(false, getBannerStatus());

  let container = document.getElementById("ireadidHazardReg");
  //container.src = "https://app.powerbi.com/reportEmbed?reportId=b9c720c0-f37b-41de-8740-48300ab4ba40&autoAuth=true&ctid=2864f69d-77c3-4fbe-bbc0-97502052391a";
}

function showMenu(){
  hide01SSHR_Inspection_Report();
  hide02All_other_TARPS();
  hide07RSHQ_Safety_Alerts();
  let loadingScreen = document.getElementById("loadingScreen");
  //hide the readContainer div
  let readContainer = document.getElementById("readerContainer");
  readContainer.style.display = "none";
  //hide the visitorsList container div
  let visitorsList = document.getElementById("visitList");
  visitorsList.style.display = "none";
  //hide the MenuAndBack container div
  let menuAndBack = document.getElementById("menuAndBack");
  menuAndBack.style.display = "none";
  let GHRContainer = document.getElementById("GHRContainer");
  GHRContainer.style.display = "none";
  let HazardRegContainer = document.getElementById("HazardRegContainer");
  HazardRegContainer.style.display = "none";

  setBanner(true, getBannerStatus());
  loadingScreen.style.display = "block";
  populatePubLocs();
  //show the MenuItems container div
  let menuItems = document.getElementById("menuItems");
  menuItems.style.display = "block";

  
  loadingScreen.style.display = "none";
}

function setBanner(on, statusMessage){
  let banner = document.getElementById("banner");
  if(on){
    banner.style.display = "block";
    banner.innerHTML = statusMessage;
  } else {
    banner.style.display = "none";
  }
}

function getBannerStatus(){
  return document.getElementById("banner").innerHTML;
}

async function getFolders(){
  const response = await fetch("/folders");
  const folders = await response.json();
  for(let key in folders){
      //remove any trailing slashes from the folder path
      folders[key] = folders[key].replace(/\/$/, "");
  }
  return folders;
}

async function getFolderCats(){
  const response = await fetch("/folderCats");
  const folderCats = await response.json();
  
  return folderCats;
}

async function getStaticUrls(){
  const response = await fetch("/staticUrls");
  const staticUrls = await response.json();
  return staticUrls;
}

async function populatePubLocs(){
  let folders = await getFolders();
  let folderCats = await getFolderCats();
  let staticUrls = await getStaticUrls();

  for(let key in folders){
    pubLocs[key] = await getData(key);
  }
  generateMenu(folders, folderCats, staticUrls);
}

function generateMenu(folders, folderCats, staticUrls){
  //there can be 5 cards per row
  const cardsPerRow = 5;
  //get the menuItems container
  //if counter is not yet == cardsPerRow, add a new row
  let menuItems = document.getElementById("menuItems");
  let rowCounter = 0;
  let rowDiv = document.createElement("div");
  let folderKeys = [];
  rowDiv.classList.add("row");
  menuItems.innerHTML = "";
  menuItems.appendChild(rowDiv);
  for(let fkey in folderCats){
      for(let bkey in folders){
        if(folderCats[fkey].includes(bkey)){
          folderCated[bkey] = folders[bkey];
        }
      }
      for(let urlKey in staticUrls){
        if(urlCated[fkey] == undefined){
          if(folderCats[fkey].includes(urlKey)){
            urlCated[urlKey] = staticUrls[urlKey];
          }
        }
      }
  }

  for(let key in folders){
    for(let fKey in folderCats){
        if(!folderCats[fKey].includes(key)){
            if(folderCated[key] == undefined){
                foldersCatless[key] = folders[key];
            }
        }
    }
  }

  for(let urlKey2 in staticUrls){
    for(let fKey in folderCats){
      if(urlCated[urlKey2] == undefined){
        if(!folderCats[fKey].includes(urlKey2)){
            if(folderCated[urlKey2] == undefined){
                urlCatless[urlKey2] = staticUrls[urlKey2];
            }
        }
      }
    }
  }

  for(let key in urlCatless){
    rowDiv.classList.add(key);
    rowDiv.appendChild(generateCard(key, "url", folders, folderKeys, folderCats));
  }

  for(let key in folderCats){
    rowDiv.classList.add(key);
    rowDiv.appendChild(generateCard(key, "subMenu", folders, folderKeys, folderCats));
  }

  for(let key in foldersCatless){
    rowDiv.classList.add(key);
    rowDiv.appendChild(generateCard(key, "showReader", folders, folderKeys, folderCats));
  }

}

function subMenu(key, folders, folderKeys, folderCats){
  let menuItems = document.getElementById("menuItems");
  let rowDiv = document.createElement("div");
  rowDiv.classList.add(key);
  rowDiv.classList.add("row");
  menuItems.innerHTML = "";
  menuItems.appendChild(rowDiv);
  for(let fkey in folderCats){
    if(fkey === key){
      rowDiv.classList.add(fkey);
      rowDiv.appendChild(generateCard(fkey, "subMenu", folders, folderKeys, folderCats));
      for(let bkey in folders){
        if(folderCats[fkey].includes(bkey)){
          rowDiv.classList.add(bkey);
          rowDiv.appendChild(generateCard(bkey, "showReader", folders, folderKeys, folderCats));
        }
      }
      for(let urlKey in urlCated){
        if(folderCats[fkey].includes(urlKey)){
          rowDiv.classList.add(urlKey);
          rowDiv.appendChild(generateCard(urlKey, "url", folders, folderKeys, folderCats));
        }
      }
    }
  }
  //show menu and back button
  let menuAndBack = document.getElementById("menuAndBack");
  menuAndBack.style.display = "flex";
}

function generateCard(key, functionFlag, folders, folderKeys, folderCats) {
  let column = document.createElement("div");
  column.classList.add("column");

      let row = document.getElementsByClassName(key);
      if (row.length > 0) { // Ensure row is found
          row.item(0).appendChild(column);
      }
      let card = document.createElement("div");
      card.classList.add("card");
      card.id = key;
      let cardText = key.substring(2).replace(/_/g, " "); // Clean up card text
      card.innerHTML = `<img src='/icons/${key}.png' width='80' height='80'><h3>${cardText}</h3>`;

      // Setting onclick behavior based on functionFlag
      card.onclick = function () {
          switch (functionFlag) {
              case "showReader":
                  if (key !== "02Feedback") {
                      showReader(key);
                  }
                  break;
              case "subMenu":
                  subMenu(key, folders, folderKeys, folderCats);
                  break;
              case "url":
                  // Optimized logic to handle URL redirection
                  if (urlCatless.hasOwnProperty(key)) {
                      location.href = urlCatless[key].replace('/r', '');
                  } else if (urlCated.hasOwnProperty(key)) {
                      location.href = urlCated[key].replace('/r', '');
                  }
                  break;
              default:
                  showReader(key);
          }
      };

      column.appendChild(card);


  return column;
}


function show02All_other_TARPS(){
  document.getElementById("02All_other_TARPS").style.display = "block";
}

function show01SSHR_Inspection_Report(){
  document.getElementById("01SSHR_Inspection_Report").style.display = "block";
}

function show07RSHQ_Safety_Alerts(){
  document.getElementById("07RSHQ_Safety_Alerts").style.display = "block";
}

function hide07RSHQ_Safety_Alerts(){
  document.getElementById("07RSHQ_Safety_Alerts").style.display = "none";
}

function hide02All_other_TARPS(){
  document.getElementById("02All_other_TARPS").style.display = "none";
}

function hide01SSHR_Inspection_Report(){
  document.getElementById("01SSHR_Inspection_Report").style.display = "none";
}

//setInterval(updateFileMenu, 5000);
window.onload = async function() {
  hide01SSHR_Inspection_Report();
  hide02All_other_TARPS();
  hide07RSHQ_Safety_Alerts();
  let container = document.getElementById("visitList");
  if(container !== null){
    visitHeadings = container.innerHTML;
  }
  let menuItems = document.getElementById("menuItems");

  await populatePubLocs();
  let loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.style.display = "none";
  showMenu();
};
