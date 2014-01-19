var operate = {
  LOAD : 0,
  SAVE : 1,
  REMOVE : 2,
  RESET : 3,
};

var STATE = {
  STABLE : 0,
  LOADING : 1,
  TRUNCATING : 2,
  SAVING : 3,
  REMOVING : 4,
}

var onError = function() {
  console.log ('Error : ', arguments);
  file_io.setState(operate.RESET);
}

var onLoadError = function() {
  console.log ('LoadError : ', arguments);
  file_io.setText("text empty");
  file_io.setState(operate.RESET);
}

var file_io = {
  grantedBytes : 0,
  is_init : false,
  file : "",
  state : STATE.STABLE,

  init : function(file) {
    this.grantedBytes = 0,
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
    console.log("fileOperation:"+ type);
    this.setState(type);
    window.webkitRequestFileSystem(window.PERSISTENT, this.grantedBytes, this.onInitFs, onError);
  },

  setState : function(type) {
    switch (type) {
      case operate.LOAD:
        this.state = STATE.LOADING;
        break;
      case operate.SAVE:
        if (this.state == STATE.TRUNCATING) {
          this.state = STATE.SAVING;
        } else {
          this.state = STATE.TRUNCATING;
        }
        break;
      case operate.REMOVE:
        this.state = STATE.REMOVING;
        break;
      case operate.RESET:
        this.state = STATE.STABLE;
        break;
      default:
        this.state = STATE.STABLE;
        console.log("Error: unexpected type="+ type);
        break;
    }
  },

  onInitFs : function(fs) {
    console.log("onInitFs: state="+ file_io.state);
    switch (file_io.state) {
      case STATE.SAVING:
        file_io.saveFile(fs);
        break;
      case STATE.LOADING:
        file_io.loadFile(fs);
        break;
      case STATE.REMOVING:
        file_io.removeFile(fs);
        break;
      case STATE.TRUNCATING:
        file_io.truncateFile(fs);
        break;
      default:
        file_io.setState(operate.RESET);
        break;
    }
  },

  truncateFile : function(fs) {
    console.log("trancateFile:"+ this.file);
    fs.root.getFile(this.file, {create: true}, function(fileEntry) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function(fileWriter) {

        fileWriter.onwriteend = function(e) {
          console.log('Truncate completed.');
          file_io.fileOperation(operate.SAVE);
        };

        fileWriter.onerror = function(e) {
          console.log('Truncate failed: ' + e.toString());
          file_io.setState(operate.RESET);
        };
        console.log(fileWriter);
        fileWriter.truncate(0);
      }, onError);
    }, onError);
  },

  saveFile : function(fs) {
    console.log("saveFile:"+ this.file);
    fs.root.getFile(this.file, {create: true}, function(fileEntry) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function(fileWriter) {

        fileWriter.onwriteend = function(e) {
          console.log('Write completed.');
          file_io.setState(operate.RESET);
        };

        fileWriter.onerror = function(e) {
          console.log('Write failed: ' + e.toString());
          file_io.setState(operate.RESET);
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
           file_io.setState(operate.RESET);
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
        file_io.setState(operate.RESET);
      }, onError);
    }, onError);
  },
}

