
// Autor: Dederick Pieterse

var folderCatsOrder = [];

async function getFolders(){
    const response = await fetch("/folders");
    const folders = await response.json();
    for(let key in folders){
        //remove any trailing slashes from the folder path
        folders[key] = folders[key].replace(/\/$/, "");
    }
    return folders;
}

async function getStaticUrls(){
    const response = await fetch("/staticUrls");
    const staticUrls = await response.json();
    return staticUrls;
}

async function setStaticUrls(staticUrls){
    const response = await fetch("/setStaticUrls", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(staticUrls)
    });
    const data = await response.json();
    console.log(data);
}

async function getInvalidFolders(){
    const response = await fetch("/invalidFolders");
    const invalidFolders = await response.json();
    for(let key in invalidFolders){
        //remove any trailing slashes from the folder path
        invalidFolders[key] = invalidFolders[key].replace(/\/$/, "");
    }
    return invalidFolders;
}

async function getFolderCats(){
    const response = await fetch("/folderCats");
    const folderCats = await response.json();
    
    return folderCats;
}

async function setFolderCats(folderCats){
    const response = await fetch("/setFolderCats", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(folderCats)
    });
    const data = await response.json();
    console.log(data);
}

async function setFolders(folders){
    const response = await fetch("/setFolders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(folders)
    });
    const data = await response.json();
    console.log(data);
}


async function submitCatIcons(){
    let inputs = document.querySelectorAll("input#iconfilecat");
    let files = [];
    for (let i = 0; i < inputs.length; i++){
        if(inputs[i].files[0] != undefined)
            files.push(inputs[i].files[0]);
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++){
        formData.append("files", files[i]);
    }
    const response = await fetch("/submitCatIcons", {
        method: "POST",
        body: formData
    });
    const data = await response.text();
    console.log(data);
}

function createIcon(iConName){
    let img = document.createElement("img");
    img.src = "/icons/" + iConName + ".png";
    img.style.width = "50px";
    img.style.height = "50px";
    return img;
}

function createInput(id, type, value){
    let input = document.createElement("input");
    input.id = id;
    input.type = type;
    input.value = value;
    return input;
}

function catUp(catKey) {
    const index = folderCatsOrder.indexOf(catKey);
    if (index > 0) {
        [folderCatsOrder[index], folderCatsOrder[index - 1]] = [folderCatsOrder[index - 1], folderCatsOrder[index]];
        renderOptions(); // Re-render categories
    }
}

function catDown(catKey) {
    const index = folderCatsOrder.indexOf(catKey);
    if (index !== -1 && index < folderCatsOrder.length - 1) {
        [folderCatsOrder[index], folderCatsOrder[index + 1]] = [folderCatsOrder[index + 1], folderCatsOrder[index]];
        renderOptions(); // Re-render categories
    }
}


async function renderOptions() {
    confOps.innerHTML = ''; // Clear existing content

    let folders = await getFolders();
    let staticUrls = await getStaticUrls();
    let folderCats = await getFolderCats();

    let staticUrlsCatless = {};
    let foldersCatless = {};
    let folderCated = {};

    for (let key in folderCats) {
        let wrapper = document.createElement("div");
        wrapper.classList.add("category-wrapper"); // For styling and potentially adding drag-and-drop functionality
        wrapper.id = key;
        wrapper.appendChild(createIcon(key));
        wrapper.appendChild(createInput("category", "text", key));
        //add a br element to wrapper
        let br = document.createElement("br");
        wrapper.appendChild(br);

        for (let fKey in folders) {
            if (folderCats[key].includes(fKey)) {
                folderCated[fKey] = folders[fKey];
                wrapper.appendChild(createInput("folder", "text", `${fKey},${folders[fKey]}`));
                wrapper.appendChild(createIcon(fKey));
            }
        }

        for (let fKey in staticUrls) {
            if (folderCats[key].includes(fKey)) {
                folderCated[fKey] = staticUrls[fKey];
                wrapper.appendChild(createInput("folder", "text", `${fKey},${staticUrls[fKey]}`));
                wrapper.appendChild(createIcon(fKey));
            }
        }
        confOps.appendChild(wrapper);
    }

    for (let key in folders) {
        if (!Object.values(folderCats).flat().includes(key) && folderCated[key] === undefined) {
            foldersCatless[key] = folders[key];
        }
    }

    for (let key in staticUrls) {
        if (!Object.values(folderCats).flat().includes(key) && folderCated[key] === undefined) {
            staticUrlsCatless[key] = staticUrls[key];
        }
    }

    // Appending catless items
    appendCatlessItems(foldersCatless, confOps);
    appendCatlessItems(staticUrlsCatless, confOps);
}

function appendCatlessItems(items, parent) {
    for (let key in items) {
        let wrapper = document.createElement("div");
        wrapper.classList.add("catless-wrapper");
        wrapper.id = key;
        wrapper.appendChild(createInput("folder", "text", `${key},${items[key]}`));
        wrapper.appendChild(createIcon(key));
        parent.appendChild(wrapper);
    }
}

window.onload = async function() {

    confOps = document.getElementById("configOptions");
    let folderCats = await getFolderCats(); // Example function that fetches categories
    folderCatsOrder = Object.keys(folderCats);
    await renderOptions();


    //create a new input element with the value of "Add Folder" and add it to the configOptions form
    confOps.appendChild(createInput("folder", "text", "Add Folder"));

    //add the submit button to the configOptions form
    let submit = document.createElement("button");
    submit.type = "submit";
    submit.innerText = "Submit";
    confOps.appendChild(submit);

    let br5 = document.createElement("br");
    confOps.appendChild(br5);

    confOps.appendChild(createInput("category", "text", "Add Category"));

    let submitCat = document.createElement("button");
    submitCat.type = "submit";
    submitCat.innerText = "Submit";
    confOps.appendChild(submitCat);

    let br6 = document.createElement("br");
    confOps.appendChild(br6);

    confOps.appendChild(createInput("folder", "text", "Add Static URL"));

    let br7 = document.createElement("br");
    confOps.appendChild(br7);

    let submitUrl = document.createElement("button");
    submitUrl.type = "submit";
    submitUrl.innerText = "Submit";
    confOps.appendChild(submitUrl);

    //add a onclick event listener for the submit button
    //It will send the updated folder list to the server, then refresh the page
    submit.onclick = function(){
        folders = [];
        let inputs = document.querySelectorAll("input#folder");
        for (let i = 0; i < inputs.length - 1; i++){
            folders.push(inputs[i].value);
        }
        folders.push(inputNew.value);

        setFolders(folders);

        location.reload();
    }

    submitCat.onclick = function(){
        folderCats = [];
        let inputs = document.querySelectorAll("input#category");
        for (let i = 0; i < inputs.length - 1; i++){
            //inputs[i].value needs to be in format: category,[folder1;folder2;folder3;...]
            //replace the , with a ; and then replace the : with a , to get the correct format
            inputs[i].value = inputs[i].value.replace(/,/g, ";");
            inputs[i].value = inputs[i].value.replace(/:/g, ",");
            folderCats.push(inputs[i].value);
        }
        inputNewCat.value = inputNewCat.value.replace(/,/g, ";");
        inputNewCat.value = inputNewCat.value.replace(/:/g, ",");
        folderCats.push(inputNewCat.value);

        setFolderCats(folderCats);

        location.reload();
    }

    submitUrl.onclick = function(){
        staticUrls = [];
        let inputs = document.querySelectorAll("input#folder");
        for (let i = 0; i < inputs.length - 1; i++){
            staticUrls.push(inputs[i].value);
        }
        staticUrls.push(inputNewUrl.value);
        setStaticUrls(staticUrls);

        location.reload();
    }
}