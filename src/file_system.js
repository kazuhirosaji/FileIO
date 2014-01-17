var config = {
  LOAD : 0,
  SAVE : 1,
  REMOVE : 2,
};

var onError = function() {
  console.log ('Error : ', arguments);
  file_io.op_done = true;
}

var onLoadError = function() {
  console.log ('LoadError : ', arguments);
  file_io.setText("text empty");
  file_io.op_done = true;
}

var file_io = {
  grantedBytes : 0,
  is_init : false,
  op_done : false,
  file : "",
  state : config.LOAD,

  init : function(file) {
    this.grantedBytes = 0,
    this.state = config.LOAD;
    this.is_init = false;
    this.file = file;
    console.log(this);
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    navigator.webkitPersistentStorage.requestQuota (1024*1024*1024, function(bytes) {
      file_io.initDone(bytes);
    }, onError);
  },

  initDone : function(bytes) {
    console.log ('requestQuota: ', arguments);
    this.grantedBytes = bytes;
    this.is_init = true;
  },

  setText : function(text) {
    this.text = text;
    console.log("setText:"+ this.text);
  },

  getText : function() {
    return this.text;
  },

  fileOperation : function(type) {
    this.state = type;
    console.log("fileOperation:"+ type);
    file_io.op_done = false;
    window.webkitRequestFileSystem(window.PERSISTENT, this.grantedBytes, this.onInitFs, onError);
  },

  onInitFs : function(fs) {
    console.log("onInitFs: state="+ file_io.state);
    if (file_io.state == config.SAVE) {
      console.log("doSaveFile");
      file_io.fs = fs;
      file_io.saveFile(fs);
    } else if (file_io.state == config.LOAD) {
      file_io.loadFile(fs);
    } else if (file_io.state == config.REMOVE) {
      file_io.removeFile(fs);
    } else {
      file_io.op_done = true;
    }
  },



  saveFile : function(fs) {
    console.log("trancateFile:"+ this.file);
    fs.root.getFile(this.file, {create: true}, function(fileEntry) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function(fileWriter) {

        fileWriter.onwriteend = function(e) {
          console.log('Truncate completed.');
          file_io.saveFile2(file_io.fs);
        };

        fileWriter.onerror = function(e) {
          console.log('Truncate failed: ' + e.toString());
          file_io.op_done = true;
        };
        console.log(fileWriter);
        fileWriter.truncate(0);
      }, onError);
    }, onError);
  },

  saveFile2 : function(fs) {
    console.log("saveFile:"+ this.file);
    fs.root.getFile(this.file, {create: true}, function(fileEntry) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function(fileWriter) {

        fileWriter.onwriteend = function(e) {
          console.log('Write completed.');
          file_io.op_done = true;
        };

        fileWriter.onerror = function(e) {
          console.log('Write failed: ' + e.toString());
          file_io.op_done = true;
        };
        var value = file_io.text;
        console.log("save:text="+ file_io.text);

        // Create a new Blob and write it to log.txt.
        var bb = new Blob([value]);
        console.log(fileWriter);
        fileWriter.write(bb);
      }, onError);
    }, onError);
  },

  loadFile : function(fs) {
    console.log("loadFile");
    fs.root.getFile(this.file, {}, function(fileEntry) {

      // Get a File object representing the file,
      // then use FileReader to read its contents.
      fileEntry.file(function(file) {
         var reader = new FileReader();

         reader.onloadend = function(e) {
           file_io.text = this.result;
           console.log("loaddone:"+file_io.text);
           console.log(file_io);
           file_io.op_done = true;
         };
         reader.readAsText(file);
      }, onLoadError);
    }, onLoadError);
  },

  removeFile : function(fs) {
    console.log("removeFile");
    fs.root.getFile(this.file , {create: false}, function(fileEntry) {

      fileEntry.remove(function() {
        console.log('File removed.');
        file_io.op_done = true;
      }, onError);
    }, onError);
  },
}

