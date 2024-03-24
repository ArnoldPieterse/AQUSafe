let queuedImagesArray = [],
    savedForm = document.querySelector("#saved-form"),
    queuedForm = document.querySelector("#queued-form"),
    savedDiv = document.querySelector('.saved-div'),
    queuedDiv = document.querySelector('.queued-div'),
    inputDiv = document.querySelector('.input-div'),
    input = document.querySelector('.input-div input'),
    serverMessage = document.querySelector('.server-message'),
    savedImages = [],
    deleteImages = [];

    // SAVED IMAGES
    if(savedImages) displaySavedImages()

    async function displaySavedImages(){
        let folders = await getFolders();
        let folderCats = await getFolderCats();
        for(let key in folders){
            savedImages.push(key + ".png");
        }
        for(let key in folderCats){
            savedImages.push(key + ".png");
        }
        let images = "";
        savedImages.forEach((image, index) => {
          images += `<div class="image">
                      <img src="http://localhost:40000/icons/${image}" alt="image">
                      <span onclick="deleteSavedImage(${index})">&times;</span>
                    </div>`;
        })
        savedDiv.innerHTML = images;
    }

    function deleteSavedImage(index) {
        //test if savedImages[index] is a valid image
        let img = new Image();
        img.src = "http://localhost:30000/icons/" + savedImages[index];

        if(img.width !== 0 && img.height !== 0){
            deleteImages.push(savedImages[index])
        }
        
      savedImages.splice(index, 1);
      displaySavedImages();
      //reload the page
        location.reload();
    }

    savedForm.addEventListener("submit", (e) => {
      e.preventDefault()
      deleteImagesFromServer()
    });

    function deleteImagesFromServer() {

      fetch("delete", {
        method: "PUT",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Content-type": "application/json"
        },
        body: JSON.stringify({deleteImages})
      })

      .then(response => {
        if (response.status !== 200) throw Error(response.statusText)
        deleteImages = []
        serverMessage.innerHTML = response.statusText
        serverMessage.style.cssText = "background-color: #d4edda; color:#1b5e20"
      })

      .catch(error => {
        serverMessage.innerHTML = error
        serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c"
      });

    }

    // QUEUED IMAGES

    function displayQueuedImages() {
      let images = "";
      queuedImagesArray.forEach((image, index) => {
        images += `<div class="image">
                    <img src="${URL.createObjectURL(image)}" alt="image">
                    <span onclick="deleteQueuedImage(${index})">&times;</span>
                  </div>`;
      })
      queuedDiv.innerHTML = images;
    }

    function deleteQueuedImage(index) {
      queuedImagesArray.splice(index, 1);
      displayQueuedImages();
    }

    input.addEventListener("change", () => {
      const files = input.files;
      for (let i = 0; i < files.length; i++) {
        queuedImagesArray.push(files[i])
      }
      queuedForm.reset();
      displayQueuedImages()
    })

    inputDiv.addEventListener("drop", (e) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.match("image")) continue; // only photos
        
        if (queuedImagesArray.every(image => image.name !== files[i].name))
          queuedImagesArray.push(files[i])
      }
      displayQueuedImages()
    })

    queuedForm.addEventListener("submit", (e) => {
      e.preventDefault()
      sendQueuedImagesToServer()
    });

    function sendQueuedImagesToServer() {
      const formData = new FormData(queuedForm);

      queuedImagesArray.forEach((image, index) => {
        formData.append(`file[${index}]`, image)
      })

      fetch("upload", {
        method: "POST",
        body: formData
      })
        
      .then(response => {
        if(response.status !== 200) throw Error(response.statusText)
        location.reload() 
      })

      .catch( error => { 
        serverMessage.innerHTML = error
        serverMessage.style.cssText = "background-color: #f8d7da; color:#b71c1c"
      });

    }