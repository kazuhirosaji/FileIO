describe("FileIO", function() {
  beforeEach(function() {
    file_io.init("test.txt");
/*waitsForは、渡した関数がtrueを返すか指定したタイムアウトまで待つ
runsに渡した関数は遅延評価される
waitsForの結果を待つ場合はrunsを使う
setUpとtearDownが無いので、runsを最初と最後に使う
waitsForを含むit以降のdescribe内のitは遅延評価される*/
    waitsFor(function() {
      return file_io.is_init;
    }, "file io can't init", 1000);
  });

  it("空文字でファイル上書きができる", function() {
    file_io.setText("");
    file_io.fileOperation(operate.SAVE);
    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs(function() {
     file_io.fileOperation(operate.LOAD);
    });

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs(function () {
  		expect(file_io.getText()).toEqual("");
  	});
  });

  it("保存した文字列を読み込める", function() {
    file_io.setText("saving text");
    file_io.fileOperation(operate.SAVE);
    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs(function() {
      file_io.setText("");
      expect(file_io.getText()).toEqual("");
      // load
      file_io.fileOperation(operate.LOAD);
    });

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs(function () {
      expect(file_io.getText()).toEqual("saving text");
    });
    
  });

  it("上書き後のファイル読み込み", function() {
    file_io.setText("saving text");
    file_io.fileOperation(operate.SAVE);
    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);
    // save second time
    runs(function () {
      file_io.setText("2nd time saving text!");
      file_io.fileOperation(operate.SAVE);
    });

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs(function () {
      file_io.setText("");
      expect(file_io.getText()).toEqual("");
      file_io.fileOperation(operate.LOAD);
    });
    // load
    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs(function () {
      expect(file_io.getText()).toEqual("2nd time saving text!");
    });
  });

  it("削除後のファイル読み書き", function() {
    // remove
    file_io.setText("saving text");
    file_io.fileOperation(operate.SAVE);

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs (function() {
      file_io.fileOperation(operate.REMOVE);
    });

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs (function() {
      file_io.fileOperation(operate.LOAD);
    });

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs (function() {
     expect(file_io.getText()).toEqual("text empty");
     // save and load after remove.
     file_io.setText("saving text after remove");
     file_io.fileOperation(operate.SAVE);
    });

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);
    
    runs (function() {
      file_io.fileOperation(operate.LOAD);
    });

    waitsFor(function() {
      if (file_io.state == STATE.STABLE) return true;
    }, "file operation can't done", 3000);

    runs(function() {
      expect(file_io.getText()).toEqual("saving text after remove");
    });
  });
});