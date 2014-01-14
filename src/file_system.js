var grantedBytes = 0;
var LOADING = 0;
var SAVING = 1;
var REMOVING = 2;

var state = LOADING;

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

function onError () { console.log ('Error : ', arguments); }

navigator.webkitPersistentStorage.requestQuota (1024*1024*1024, function(bytes) {
  console.log ('requestQuota: ', arguments);
  grantedBytes = bytes;
}, onError);

function fileOperation(type) {
  state = type;
  requestFS(grantedBytes);
}

function requestFS(grantedBytes) {
    window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, onError);
}

function onInitFs(fs) {
  if (state == SAVING) {
    console.log("saveFile");
    saveFile(fs);
  } else if (state == LOADING) {
    console.log("loadFile");
    loadFile(fs);
  } else if (state == REMOVING) {
    console.log("removeFile");
    removeFile(fs);
  }
}

function saveFile(fs) {
  fs.root.getFile('log.txt', {create: true}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        console.log('Write completed.');
      };

      fileWriter.onerror = function(e) {
        console.log('Write failed: ' + e.toString());
      };
      value = document.getElementById("text").value;

      // Create a new Blob and write it to log.txt.
      var bb = new Blob([value]);
      fileWriter.write(bb);

    }, onError);

  }, onError);
}

function loadFile(fs) {
  fs.root.getFile('log.txt', {}, function(fileEntry) {

    // Get a File object representing the file,
    // then use FileReader to read its contents.
    fileEntry.file(function(file) {
       var reader = new FileReader();

       reader.onloadend = function(e) {
         document.getElementById("text").value = this.result;
       };
       reader.readAsText(file);
    }, onError);

  }, onError);
}

function removeFile(fs) {
  fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

    fileEntry.remove(function() {
      console.log('File removed.');
    }, onError);
  }, onError);
}

