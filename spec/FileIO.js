var waitsReady = function() {
    waitsFor(function() {
      return file_io.isReady();
    }, "file operation can't done", 3000);
};

describe("FileIO", function() {
  beforeEach(function() {
    file_io.init("test.txt", 1024*1024);
/*waitsForは、渡した関数がtrueを返すか指定したタイムアウトまで待つ
runsに渡した関数は遅延評価される
waitsForの結果を待つ場合はrunsを使う
setUpとtearDownが無いので、runsを最初と最後に使う
waitsForを含むit以降のdescribe内のitは遅延評価される*/
    waitsReady();
  });

  it("初期化完了の確認", function() {
    runs(function() {
      expect(file_io.grantedBytes).toEqual(1024*1024)
    });
  });

  it("空文字でファイル上書きができる", function() {
    runs(function() {
      file_io.setText("");
      file_io.fileOperation(OPERATE.SAVE);
    });

    waitsReady();

    runs(function() {
     file_io.fileOperation(OPERATE.LOAD);
    });
    
    waitsReady();

    runs(function () {
  		expect(file_io.getText()).toEqual("");
  	});
  });

  it("保存した文字列を読み込める", function() {
    file_io.setText("saving text");
    file_io.fileOperation(OPERATE.SAVE);

    waitsReady();

    runs(function() {
      file_io.setText("");
      expect(file_io.getText()).toEqual("");
      // load
      file_io.fileOperation(OPERATE.LOAD);
    });

    waitsReady();

    runs(function () {
      expect(file_io.getText()).toEqual("saving text");
    });
    
  });

  it("上書き後のファイル読み込み", function() {
    file_io.setText("saving text");
    file_io.fileOperation(OPERATE.SAVE);

    waitsReady();

    // save second time
    runs(function () {
      file_io.setText("2nd time saving text!");
      file_io.fileOperation(OPERATE.SAVE);
    });

    waitsReady();

    runs(function () {
      file_io.setText("");
      expect(file_io.getText()).toEqual("");
      file_io.fileOperation(OPERATE.LOAD);
    });
    // load

    waitsReady();

    runs(function () {
      expect(file_io.getText()).toEqual("2nd time saving text!");
    });
  });

  it("削除後のファイル読み書き", function() {
    // remove
    file_io.setText("saving text");
    file_io.fileOperation(OPERATE.SAVE);

    waitsReady();

    runs (function() {
      file_io.fileOperation(OPERATE.REMOVE);
    });

    waitsReady();

    runs (function() {
      file_io.fileOperation(OPERATE.LOAD);
    });

    waitsReady();

    runs (function() {
     expect(file_io.getText()).toEqual("text empty");
     // save and load after remove.
     file_io.setText("saving text after remove");
     file_io.fileOperation(OPERATE.SAVE);
    });

    waitsReady();
    
    runs (function() {
      file_io.fileOperation(OPERATE.LOAD);
    });

    waitsReady();

    runs(function() {
      expect(file_io.getText()).toEqual("saving text after remove");
    });
  });
});