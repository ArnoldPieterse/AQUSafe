
// Autor: Dederick Pieterse

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

window.onload = async function() {
    confOps = document.getElementById("configOptions");
    let folders = await getFolders();
    let staticUrls = await getStaticUrls();
    let folderCats = await getFolderCats();
    
    let staticUrlsCatless = {};
    let foldersCatless = {};
    let folderCated = {};
    

    for(let key in folderCats){
        let category = document.createElement("input");
        category.id = "category";
        category.type = "text";
        category.value = key + ":[" + folderCats[key] + "]";
        category.innerText = key;
        confOps.appendChild(category);


        let icoimg = document.createElement("img");
        icoimg.src = "/icons/" + key + ".png";
        icoimg.style.width = "50px";
        icoimg.style.height = "50px";
        confOps.appendChild(icoimg);

        let br11 = document.createElement("br");
        confOps.appendChild(br11);
        for(let fKey in folders){
            //if the value of folderCats[key] contains the folders[fKey]
            if(folderCats[key].includes(fKey)){
                folderCated[fKey] = folders[fKey];
                let input = document.createElement("input");
                input.id = "folder";
                input.type = "text";
                let folderName = fKey;
                let folderPath = folders[fKey];
                input.value = "" + folderName + "," + folderPath;
                confOps.appendChild(input);

                let icoimgfol = document.createElement("img");
                icoimgfol.src = "/icons/" + fKey + ".png";
                icoimgfol.style.width = "50px";
                icoimgfol.style.height = "50px";
                confOps.appendChild(icoimgfol);
            }
        }
        for(let fkey in staticUrls){
            if(folderCats[key].includes(fkey)){
                folderCated[fkey] = staticUrls[fkey];
                let input = document.createElement("input");
                input.id = "folder";
                input.type = "text";
                let folderName = fkey;
                let folderPath = staticUrls[fkey];
                input.value = "" + folderName + "," + folderPath;
                confOps.appendChild(input);

                let icoimgfol = document.createElement("img");
                icoimgfol.src = "/icons/" + fkey + ".png";
                icoimgfol.style.width = "50px";
                icoimgfol.style.height = "50px";
                confOps.appendChild(icoimgfol);
            }
        }
        let br1 = document.createElement("br");
        let br2 = document.createElement("br");
        let br3 = document.createElement("br");
        confOps.appendChild(br1);
        confOps.appendChild(br2);
        confOps.appendChild(br3);
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

    for(let key in staticUrls){
        for(let fKey in folderCats){
            if(!folderCats[fKey].includes(key)){
                if(folderCated[key] == undefined){
                    staticUrlsCatless[key] = staticUrls[key];
                }
            }
        }
    }

    //for each folder in the folders array create a new input element with the value of the folder and add it to the configOptions form
    for (let key in foldersCatless){
        let input = document.createElement("input");
        input.id = "folder";
        input.type = "text";
        //convert JSON object folders[i] to string
        input.type = "text";
        let folderName = key;
        let folderPath = foldersCatless[key];
        input.value = "" + folderName + "," + folderPath;
        confOps.appendChild(input);
        

        let icoimgfol = document.createElement("img");
        icoimgfol.src = "/icons/" + key + ".png";
        icoimgfol.style.width = "50px";
        icoimgfol.style.height = "50px";
        confOps.appendChild(icoimgfol);

        //create a new line break element and add it to the configOptions form
        let br = document.createElement("br");
        confOps.appendChild(br);
    }
    for (let key in staticUrlsCatless){
        let input = document.createElement("input");
        input.id = "folder";
        input.type = "text";
        //convert JSON object folders[i] to string
        input.type = "text";
        let folderName = key;
        let folderPath = staticUrlsCatless[key];
        input.value = "" + folderName + "," + folderPath;
        confOps.appendChild(input);
        

        let icoimgfol = document.createElement("img");
        icoimgfol.src = "/icons/" + key + ".png";
        icoimgfol.style.width = "50px";
        icoimgfol.style.height = "50px";
        confOps.appendChild(icoimgfol);

        //create a new line break element and add it to the configOptions form
        let br = document.createElement("br");
        confOps.appendChild(br);
    }
    //create a new input element with the value of "Add Folder" and add it to the configOptions form
    let inputNew = document.createElement("input");
    inputNew.id = "folder";
    inputNew.type = "text";
    inputNew.value = "Add Folder";
    confOps.appendChild(inputNew);

    //add the submit button to the configOptions form
    let submit = document.createElement("button");
    submit.type = "submit";
    submit.innerText = "Submit";
    confOps.appendChild(submit);

    let br5 = document.createElement("br");
    confOps.appendChild(br5);

    let inputNewCat = document.createElement("input");
    inputNewCat.id = "category";
    inputNewCat.type = "text";
    inputNewCat.value = "Add Category";
    confOps.appendChild(inputNewCat);

    let submitCat = document.createElement("button");
    submitCat.type = "submit";
    submitCat.innerText = "Submit";
    confOps.appendChild(submitCat);

    let br6 = document.createElement("br");
    confOps.appendChild(br6);

    let inputNewUrl = document.createElement("input");
    inputNewUrl.id = "folder";
    inputNewUrl.type = "text";
    inputNewUrl.value = "Add Static URL";
    confOps.appendChild(inputNewUrl);

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