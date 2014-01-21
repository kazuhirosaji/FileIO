var file_io_ctrl = {
  timer : 0,
  elm : 0,

  initFileIO : function() {
    file_io.init("log.txt", 1024*1024);
  },

  loadToElement : function(elm) {
    this.elm = elm;
    file_io.setCallBack(file_io_ctrl.loadEnd);
    file_io.fileOperation(OPERATE.LOAD);
  },

  saveFromElement : function(elm) {
    var text = document.getElementById(elm).value
    file_io.setText(text);
    file_io.fileOperation(OPERATE.SAVE);
  },

  loadEnd : function(elm) {
    document.getElementById(file_io_ctrl.elm).value = file_io.getText();
  }
};


