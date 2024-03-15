let invalidFolders = await getInvalidFolders();

if(await getInvalidFolders() != {}){
        let warning = document.createElement("p");
        warning.innerText = "Warning: The following folders are invalid and will not be displayed on the website";
        confOps.appendChild(warning);
        let br4 = document.createElement("br");
        confOps.appendChild(br4);
        for(let key in invalidFolders){
            let input = document.createElement("input");
            input.id = "invalidFolder";
            input.type = "text";
            let folderName = key;
            let folderPath = invalidFolders[key];
            input.value = "" + folderName + "," + folderPath;
            confOps.appendChild(input);

            let icoimgfol = document.createElement("img");
            icoimgfol.src = "/icons/" + folderName + ".png";
            icoimgfol.style.width = "50px";
            icoimgfol.style.height = "50px";
            confOps.appendChild(icoimgfol);

            let br = document.createElement("br");
            confOps.appendChild(br);
        }
        //add a line break element to the configOptions form
        let br0 = document.createElement("br");
        confOps.appendChild(br0);
        //add a clear errors button to the configOptions form
        let clearErrors = document.createElement("button");
        clearErrors.type = "submit";
        clearErrors.innerText = "Clear Errors";
        //add a onclick event listener for the clear errors button
        //It will send the updated folder list to the server, then refresh the page
        clearErrors.onclick = async function(){
            const response = await fetch("/clearErrors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(invalidFolders)
            });
            const data = response.status;
            console.log(data);
            location.reload();
        }

        confOps.appendChild(clearErrors);
    }