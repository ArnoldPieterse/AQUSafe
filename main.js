//Created by: Dederick Pieterse

//Imports
var fs = require('fs');
var path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var chokidar = require('chokidar');
const nReadlines = require('n-readlines');
const multer = require('multer');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/icons/")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

function checkFileType(file, cb){
  const filetypes = /jpeg|png|jpg|gif/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if(mimetype && extname){
    return cb(null,true)
  } else {
    cb("Please upload images only")
  }
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100000000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).any()

//Global Variables
var folderLocs = {};
var staticUrls = {};
var invalidFolderLocs = {};
var folderCats = {};
var folderDayLimits = {}; //Key value pairs where the key is the folder location and the value is the number of days the file should be kept for
var pubLocs = {};
var locs = {};
var watcher = {};
const port = 40000;
//const port = 49156;
var analyticsT = ['ServerConfig/analytics.txt'];
var folderLocsT = 'ServerConfig/folderLocs.txt';
var folderDaysT = 'ServerConfig/folderDays.txt';
var folderCatsT = 'ServerConfig/folderCats.txt';
var staticUrlsT = 'ServerConfig/staticUrls.txt';


//Initial function calls
//update the GHR every 5 mins
//setInterval(updateGHR, 300000);
readFolderLocs();
readStaticUrls();
readFolderCats();
readFolderDayLimits();
initialFileCopy();
startWatchers();


const app = express();

//Configure Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

//Setup initial route
app.get('/', (req, res) => res.render('./index'));

//Start the server
app.listen(port, () => console.log(`Server started on port: ${port}`));

//Setup the routes
app.get('/data/:direction', (req, res) => {
    var entries = getMostRecentEntry(req.params.direction);
    try {
        if(entries != null){
            res.json(entries);
        } else {
            res.send("No data found");
        }
    } catch (err) {
        console.log(err);
    }
});

app.get('/folders', (req, res) => {
    readFolderLocs();
    res.json(folderLocs);
});

app.get('/staticUrls', (req, res) => {
    readStaticUrls();
    res.json(staticUrls);
});

app.post('/setStaticUrls', (req, res) => {
    res.send(setStaticUrls(req.body));
});

app.get('/invalidFolders', (req, res) => {
    readFolderLocs();
    res.json(invalidFolderLocs);
});

app.get('/folderCats', (req, res) => {
    readFolderCats();
    res.json(folderCats);
});

/* app.post('/setFolders', (req, res) => {
  
  res.send(setFolders(req.body));
  console.log(req.body);
}); */

//restart this server
app.get('/reboot/:password', (req, res) => {
  if (req.params.password == "12345678"){
    //run a batch file to restart the server
    var spawn = require("child_process").spawn,child;
    child = spawn("powershell.exe",["./reboot.ps1"]);
    console.log(" :::  REBOOTED  ::: ");
    res.send("Server rebooted");
  } else {
    res.send("Incorrect password");
  }
});

app.post('/setFolderCats', (req, res) => {
    res.send(setFolderCats(req.body));
});


app.post("/admin/upload", (req, res) => {
  upload(req, res, (err) => {
    if(!err && req.files != "") { 
      res.status(200).send()
    } else if (!err && req.files == ""){
      res.statusMessage = "Please select an image to upload";
      res.status(400).end()
    } else {
      res.statusMessage = (err === "Please upload images only" ? err : "Photo exceeds limit of 1MB") ;
      res.status(400).end()
    }
  })  
})

app.put("/admin/delete", (req, res) => {
  const deleteImages = req.body.deleteImages

  if(deleteImages == ""){
    res.statusMessage = "Please select an image to delete";
    res.status(400).end()
  } else {
    deleteImages.forEach( image => {
      if(image != undefined && image != ""){
        unlinkFile("./public/icons/" + image);
      }
    })
    res.statusMessage = "Succesfully deleted";
    res.status(200).end()
  }
})

app.post("/clearErrors", (req, res) => {
  readFolderLocs();
  res.status(200).end();
})

app.post('/submitCatIcons', (req, res) => {
    //get the formData from the request and use the copyToCatIcons function to copy the files to the public folder
    //const files = req.files;
    //copyToCatIcons(files);
    upload(req, res, (err) => {
        if (err) {
          if(!err && req.files != ""){
            res.status(200).send()
          } else if(!err && req.files == ""){
            res.status(400).send("No files were uploaded.")
          } else {
            res.statusMessage = (err === "Error: Images Only!") ? err : "Photo size is too large. Please upload a photo that is less than 1MB.";
            res.status(400).end();
          }
        }
      });  
    res.send("Icons submitted");
});

app.get('/visitData', async (req, res) => {
  setImmediate(async () => {
    res.json( await getJson("https://cc-atw-api.azurewebsites.net/api/Visitors?code=JNEfyoLWwf54WNwGxtcoiwKNkW0GlPeJu_duuMCIL0F-AzFuKbquaA=="));
  });
});

app.get('/countShe', (req, res) => {
    res.send(addLineToAnalytics("she"));
});

app.get('/once/:direction', (req, res) => {
  res.sendFile('./once.html', {root: __dirname + '/public'});
});

app.get('/admin/:password', (req, res) => {
  if (req.params.password == "12345678"){
    res.sendFile('./admin.html', {root: __dirname + '/public'});
  } else {
    res.send("Incorrect password");
  }
});

app.get('/url/:direction', (req, res) => {
  res.status(301).redirect(req.params.direction);
});

//FUNCTIONS

//analytics
//add a line to the analytics file with the current date and time
function addLineToAnalytics(identifier){
    var d = new Date();
    var n = d.toLocaleString();
    var s = identifier + "";
    fs.appendFileSync(analyticsT[0], "" + s + "," + n + "\n");
  }

//Read the folder locations from the file and save them to key and value pairs where each line is split with a comma
//run this function asyncronysly but don't start the watchers until the folder locations are read
function readFolderLocs() {
    const folderLocLines = new nReadlines(folderLocsT);
  
    let line;
    while (line = folderLocLines.next()) {
      console.log(line.toString());
      const lineArr = line.toString().split(",");
      if (lineArr[0] != ""){
        //replace back slashes with forward slashes and add a forward slash to the end of the folder location
        lineArr[1] = lineArr[1].replace(/\\/g, "/");
        //remove back slash r and back slash n from the end of lineArr[1]
        lineArr[1] = lineArr[1].replace(/(\r\n|\n|\r)/gm, "");
        folderLocs[lineArr[0]] = lineArr[1].toString() + "/";
        //test if the folder location exists
        if (!fs.existsSync(folderLocs[lineArr[0]])){
          //if it doesn't exist, add to invalid folder locations
          invalidFolderLocs[lineArr[0]] = folderLocs[lineArr[0]];
          //delete folderLocs[lineArr[0]];
        }
        //for each folder location, create a folder: public\resources\folderLocs[lineArr[0]]
        if (!fs.existsSync(path.join(__dirname, '/public/resources/', `${lineArr[0]}`))){
          fs.mkdirSync(path.join(__dirname, '/public/resources/', `${lineArr[0]}`));
        }
      }
    }
    invalidFolderLocs = {};
    //setFoldersAvail(folderLocs);
    return;
}

function readStaticUrls() {
    staticUrls = {};
    const staticUrlLines = new nReadlines(staticUrlsT);
    let line;
    while (line = staticUrlLines.next()) {
      const lineArr = line.toString().split("<DAP>");
      staticUrls[lineArr[0]] = lineArr[1];
    }
    return;
}

function setStaticUrls(urls){
    fs.writeFileSync(staticUrlsT, "");
    for (let i = 0; i < urls.length; i++){
      fs.appendFileSync(staticUrlsT, urls[i] + "\n");
    }
    return "Static URLs updated";
}

function readFolderCats() {
    const folderCatLines = new nReadlines(folderCatsT);
    let line;
    while (line = folderCatLines.next()) {
      const lineArr = line.toString().split(",");
      folderCats[lineArr[0]] = lineArr[1];
      //convert lineArr[1], which looks like this sample: "[one;two;dee]", to an array of values
      folderCats[lineArr[0]] = folderCats[lineArr[0]].replace("[", "");
      folderCats[lineArr[0]] = folderCats[lineArr[0]].replace("]", "");
      //one of the lines needs \r removed. sample: ['she', 'ble\r'
      folderCats[lineArr[0]] = folderCats[lineArr[0]].replace(/(\r\n|\n|\r)/gm, "");
      folderCats[lineArr[0]] = folderCats[lineArr[0]].split(";");
    }
    return;
}

function setFolderCats(cats){
    fs.writeFileSync(folderCatsT, "");
    for (let i = 0; i < cats.length; i++){
      fs.appendFileSync(folderCatsT, cats[i] + "\n");
    }
    return "Categories updated";
}

//Write the folder locations to the file
function setFolders(folders){
    fs.writeFileSync(folderLocsT, "");
    for (let i = 0; i < folders.length; i++){
      fs.appendFileSync(folderLocsT, folders[i] + "\n");
    }
    return "Folders updated";
}

function setFoldersAvail(folders){
  fs.writeFileSync(folderLocsT, "");
    for (let files in folders){
      //remove the last forward slash from the folder location if there is one
      if (folders[files].charAt(folders[files].length - 1) == "/"){
        folders[files] = folders[files].slice(0, -1);
      }
      fs.appendFileSync(folderLocsT, files + "," + folders[files] + "\n");
    }
    return "Folders updated";
}
  
//Read the folder day limits from the file and save them to key and value pairs where each line is split with a comma
  //run this function in sync so that the folder day limits are read before the watchers are started
function readFolderDayLimits() {
    const folderDayLines = new nReadlines(folderDaysT);
    let line;
    while (line = folderDayLines.next()) {
      const lineArr = line.toString().split(",");
      if (lineArr[0] != ""){
        //remove back slash r and back slash n from the end of lineArr[1]
        lineArr[1] = lineArr[1].replace(/(\r\n|\n|\r)/gm, "");
        folderDayLimits[lineArr[0]] = lineArr[1];
      }
    }
    return;
  }

function roundNumbers(numbers){
    numbers = (Math.round(numbers * 10)/10).toFixed(0);
    return numbers
  }

//Replace all matching values to backslash in ppath with forward slash. Return the calcualted number of days between the current date and the file modification date.
function getFileDays(ppath){
    var path = ppath.replace(/\\/g, "/");
    var stats = fs.statSync(path);
    var mtime = new Date(stats.mtime);
    var now = new Date();
    var diff = now.getTime() - mtime.getTime();
    var days = diff / (1000 * 60 * 60 * 24);
    days = roundNumbers(days);
    return days;
  }

//Delete all the collected files from the public directory
function deleteAllFiles(from){
    try {
      from = path.join(__dirname, '/public/resources/', `${from}`);
      let files = fs.readdirSync(from);
      files.forEach(file => {
        fs.unlinkSync(path.join(from, file));
        console.log(path.join(from, file) + " :::  DELETED");
      });
    } catch (err) {
      console.error(err);
    }
    return;
  }

//Copy the file from the from location to the public location
function copyFile(from, to, fileName){
  to = path.join(__dirname, '/public/resources/', `${to}/`, `${fileName}`);
  // Check if the file extension is .pdf
  if (path.extname(fileName) === '.pdf') {
    fs.copyFileSync(from, to);
    console.log(" :::  COPIED  ::: " + to);
  } else {
    //console log the error in red
    console.error("\x1b[31mInvalid file extension. Only .pdf files can be copied.\x1b[0m");
  }
}

//remove ".pdf" from the end of the fromName string
//Create a string variable which will be the public file location for the file to be accessible from the web server
//add this string to the array of strings located at pubLocs[direction]
function addPubLoc(direction, fromName, days){
    //if fromName includes .pdf,
    if (fromName.includes(".pdf")){
      fromName = fromName.replace(".pdf", "");
      var pubLoc = path.join(`${fromName}`);
      pubLoc = pubLoc.replace(/\\/g, "/");
      pubLocs[direction].push(days + ";" + pubLoc);
    }
  }

//Delete all files from direction public folder
//Use direction to clear the pubLocs array using clearLocArr
//place the last word after the last forwardslash into fromName for each fromLocation in fromLoc
//Use fromName to copy the file from the fromLoc[direction].[fromLocationIndex] to filesLoc[direction].[fromLocationIndex]
//Then use addPubLoc to add the public location using the direction and fromName 
async function refreshFileList(filesLoc, fromLoc, fromPub, direction){
    deleteAllFiles(direction);
    pubLocs[direction] = [];
    //for each file in fromloc, get the file name and copy it to the public folder using the copyFile function
    locs[direction].forEach(file => {
      //get the days from the file string
      var days = file.split(";")[0];
      //remove the days from the file string
      file = file.split(";")[1];
      //get the file name from the file path
      var fileName = file.replace(/\\/g,'/');
      n = fileName.lastIndexOf('/');
      fileName = fileName.substring(n + 1);
      //remove ' from the file name
      fileName = fileName.replace(/'/g, "");
      copyFile(file, direction, fileName);
      addPubLoc(direction, fileName, days);
    });
  }

//for each key in Locs, use the copyFile function to copy each file from the folder location to the public location
//if the file is older than the day limit, then do not copy the file
//or if the day limit is 0, then copy the file
//first delete all files in the public folder
async function initialFileCopy() {
  for (let key in folderLocs) {
    // Initially clear all files and reset publication locations for the directory
    deleteAllFiles(key);
    pubLocs[key] = [];

    // Immediately process the current state of the directory as if it had changed
    await processFileChange(key);
  }
}

//Start the watchers for each folder location retreived from each folderLocs value
// using chokidar, and then call refreshFileList when a file was added or unlinked from the folder location.
// getFileDays is called to check if the file was modified for each folder's day limit to determine if refreshFileList should be called.
// each folder's day limit is saved in key value pairs folderDayLimits.
// Use the roundNumbers function to round the number of days to the nearest whole number.
// Push the path of the file to locs using the direction as the key, and remove from locs it when when the file got unlinked (One key can have multiple paths)
async function startWatchers() {
  for (let key in folderLocs) {
    watcher[key] = chokidar.watch(folderLocs[key], {
      persistent: true,
      awaitWriteFinish: true,
      ignoreInitial: true,
    });

    watcher[key].on('add', async (addedPath) => {
      console.log(`${key} ::: ADDED ::: ${addedPath}`);
      // Process the added file
      await processFileChange(key);
    });

    watcher[key].on('unlink', async (removedPath) => {
      console.log(`${removedPath} ::: DELETED`);
      // Process the file list again to reflect the deletion
      await processFileChange(key);
    });
  }
}

async function processFileChange(key) {
  let files = fs.readdirSync(folderLocs[key])
                .map(file => path.join(folderLocs[key], file))
                .filter(file => fs.statSync(file).isFile())
                .map(file => {
                  return {
                    path: file,
                    days: getFileDays(file),
                  };
                });

  // Apply folderDayLimits logic
  files.sort((a, b) => a.days - b.days); // Sort files by days in ascending order

  if (folderDayLimits[key] === 0) {
    files = [files[files.length - 1]]; // Keep only the latest file if limit is 0
  } else if (folderDayLimits[key] > 0 && folderDayLimits[key] <= 5) {
    files = files.slice(-folderDayLimits[key]); // Keep the latest N files
  } else {
    // If folderDayLimits[key] > 5, potentially filter by days, though your current logic doesn't require it
  }

  // Update locs for the direction
  locs[key] = files.map(file => `${file.days};${file.path}`);

  // Refresh file list based on the updated locs
  await refreshFileList(null, null, null, key); // Assuming refreshFileList does not need the first three arguments based on your logic
}

//get the public locations as file names from the pubLocs array using the direction as the key
//return JSON object with the fileNames as the key for filenames, direction, and fileType as the key for the fileType of .pdf
function getMostRecentEntry(direction){
    var fileNames = pubLocs[direction];
    var fileType = '.pdf';
    if (fileNames.length < 1){
      fileNames = ["INFO"];
      direction = "help";
    }
    return {fileNames, direction, fileType};
  }
  
//a function to retreive JSON data from a url "https://cc-atw-api.azurewebsites.net/api/Visitors?code=JNEfyoLWwf54WNwGxtcoiwKNkW0GlPeJu_duuMCIL0F-AzFuKbquaA==" and return the data
async function getJson(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

function updateGHR(){
   try {
    var spawn = require("child_process").spawn,child;
    var to = "..\\";
  //delete the GHR folder
    deleteAllFiles(to + "GHR");
    child = spawn("powershell.exe",["./copyGHR.ps1"]);
    console.log(" :::  COPIED  ::: " + to);
} catch (err) {
   console.error(err);
    child.stderr.on("data",function(data){
       console.log("Powershell Errors: " + data);
     });
   }
    return;
  }