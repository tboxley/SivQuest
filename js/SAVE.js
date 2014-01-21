var SAVE=new function(){
  var self=this;
  self.saveList=[];
  self.init=function(){
    var initQuest = indexedDB.open("SivQuest",1);
    initQuest.onupgradeneeded = function(e) {
      var db = e.target.result;
      var table = db.createObjectStore("saves", { keyPath: "name" });
      table.createIndex("saveString", "saveString", { unique: false });


    };
    initQuest.onsuccess=function(e){
      var db = e.target.result,moo;
      db.transaction("saves").objectStore("saves").index("saveString").openKeyCursor().onsuccess=function(event){
        var cursor = event.target.result;
        if(cursor) {
          SAVE.saveList.push(cursor.key);

          cursor.continue();
        }

      };
        



    };
  };
  
  

  self.saveGame=function(){
    var save={},sexes=["male","female"];
    save.PC=PC;
    save.name=PC.name;
    save.items=items;
    save.floors=WORLD.floors;
    save.level=WORLD.level;
    save.saveString=PC.name+" - Level:"+PC.LV+" "+sexes[PC.sex]+" "+SETUP.professions[PC.prof].fName;
    var saveQuest = indexedDB.open("SivQuest",1);
    saveQuest.onerror=function(e){
      console.log('reboot');
    };
    saveQuest.onsuccess = function(e) {
      var db = e.target.result,trans;
      trans=db.transaction(["saves"],"readwrite");
      trans.objectStore("saves").put(save);

      trans.oncomplete=function(e){
        flags.gameSaved=1;
        SCREEN.saving(1);
      };

    };

  };

  self.loadGame=function(){
    var db,test,loadQuest=indexedDB.open("SivQuest"),theSave=SAVE.saveList[curPos].split(" - ")[0];
    loadQuest.onsuccess=function(e){
      db = e.target.result;
      test=db.transaction(["saves"],"readwrite").objectStore("saves");
      test.get(theSave).onsuccess=function(e){
        var theData=e.target.result;
        PC=theData.PC;
        WORLD.level=theData.level;
        items=theData.items;
        WORLD.floors=theData.floors;
        flags.loadMenu=0;
        SCREEN.redrawBoard();
        test.delete(theSave);
      };
      
    };
  };

};
