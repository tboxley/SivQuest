/*globals ITEM:true*/
/*jshint unused:true,supernew:true*/
var ITEM = new function(){
  "use strict";
  var self = this;
  self.sort=0;
  self.sortArray=[];
  self.loadJSON=function(basedir){
    basedir=basedir||"";
    
    return $.when(
      $.getJSON(basedir+"json/materials.json",function(moo){self.materials=moo;}),
      $.getJSON(basedir+"json/artifacts.json").success(function(moo){self.artifacts=moo;}),
      $.getJSON(basedir+"json/cloaks.json",function(moo){self.cloaks=moo;}),
      $.getJSON(basedir+"json/weapons.json",function(moo){self.weapons=moo;}),
      $.getJSON(basedir+"json/armor.json",function(moo){self.armor=moo;}),
      $.getJSON(basedir+"json/amulets.json",function(moo){self.amulets=moo;}),
      $.getJSON(basedir+"json/potions.json",function(moo){self.potions=moo;}),
      $.getJSON(basedir+"json/prefixes.json").success(function(moo){self.prefixes=moo;}),
      $.getJSON(basedir+"json/suffixes.json").success(function(moo){self.suffixes=moo;})
    );
  };
  self.types=["weapon","potion","amulet","cloak","armor"];
  self.desc={dagger:"Daggers",sword:"Swords",shield:"Shields",staff:"Staves",wand:"Wands",heavy:"Heavy Armor",medium:"Medium Armor",light:"Light Armor",axe:"Axes",polearm:"Polearms"};
  
  self.resetBoardItems=function(x,y){
    var tmpArr=[],n=0;
    if(!x) x = PC.X;
    if(!y) y = PC.Y;
    tmpArr=WORLD.getTile(x,y).items;
    WORLD.getTile(x,y).items=[];
    for(n = 0;n<tmpArr.length;n++) if(typeof tmpArr[n]!=="undefined") WORLD.getTile(x,y).items.push(tmpArr[n]);
  };

  self.itemName=function(x,y){
    var aAn;
    if(!y){
      if(x<0) return("(Nothing)");
      else if(!items[x].idd) return items[x].uid;
      else return items[x].name;
    }
    else{
      var item=items[WORLD.getTile(x,y).items[0]];
      if(!item.idd){
        if(item.uid.match(/^[aeiou]/i)) aAn="an";
        else aAn="a";
        return("You see "+aAn+" "+item.uid+" on the ground.");
      }
      else if(item.artifact) return("The "+item.name+" is lying here.");
      else {
        if(item.name.match(/^[aeiou]/i)) aAn="an";
        else aAn="a";
        return ("There is "+aAn+" "+item.name+" lying on the ground.");
      }
    }
  };

  self.itemSorter=function(){
    var filterType=[
      null,
      ["head"],
      ["amulet"],
      ["cloak"],
      ["armor"],
      ["1hand","2hand"],
      ["shield"],
      ["bracers"],
      ["gauntlets"],
      ["boots"],
      ["potion"],
      ["scroll"]
    ][self.sort];

    //this will be hard to wrap your head around, but I'll comment it
    self.sortArray = _.filter(PC.items,                        //First we start with a list of ITEM IDs,
        function(itemID){                                      //we filter them:
          return _.any(items[itemID].type, function(type){     //if any of the types listed in the item
              return _.contains(filterType,type);              //is contained in our filterType search
            });                                                //it will be included in the final search result
        }); //returns the final result (a list of item IDs matching our search criteria)
  };
  
self.itemId=function(x,y){
  if(!x) x = PC.X;
  if(!y) y = PC.Y;
  return WORLD.getTile(x,y).items;
};

self.itemCount=function(x,y){
  if(!x) x = PC.X;
  if(!y) y = PC.Y;
  return WORLD.getTile(x,y).items.length;
};

self.dropItem=function(){
  var dropped,msg="You have nothing to drop.";
  if(PC.items.length){
    dropped = ITEM.itemName(PC.items[curPos]);
    items[PC.items[curPos]].owned=0;
    self.setItem(PC.X,PC.Y,PC.items[curPos]);
    
    PC.items.splice(curPos,1);
    if(curPos>PC.items.length-1) curPos=PC.items.length-1;
    
    msg="You drop the "+dropped;
  }
  SCREEN.showInventory();
  SCREEN.gameMessage(msg);
};

self.unequipItem=function(){
  var part,msg;
  switch(curPos){
    case 0:
      part="head";
      msg="You try to unequip your head. It's quite obvious that you're not using it.";
    break;
    case 1:
      part="amulet";
      msg="lol amu";
    break;
    case 2:
      part="cloak";
      msg="lol cloks";
    break;
    case 3:
      part="body";
      msg="body lol";
    break;
    case 4:
      part="weapon";
      msg="no weapon";
    break;
    case 5:
      part="shield";
      msg="pewpew shields";
    break;
    case 6:
      part="bracers";
      msg="armarmor lol";
    break;
    case 7:
      part="gauntlets";
      msg="gloves, bitch lol";
    break;
    case 8:
      part="boots";
      msg="footsies lol";
    break;
  }
  if(PC.equip[part]==-1) msg=msg;
    else{
      msg="You unequip the "+ITEM.itemName(PC.equip[part]);
      PC.items.push(PC.equip[part]);
      items[PC.equip[part]].owned=1;
      items[PC.equip[part]].equip=0;
      PC.equip[part]=-1;
      ENTITY.updateArmor();
    }
    SCREEN.equipMenu();
    SCREEN.gameMessage(msg);
  };



self.equipItem=function(){
  var artifact,type,PCInfo=profs[PC.prof],success=0,part,msg="You",i;
    type=items[self.sortArray[curPos]].type;
    artifact=items[self.sortArray[curPos]].artifact;
    switch(type[0]){
      default:
        msg+=" cannot equip that item.";
      break;
      
      case "head":
        part="head";
        if(PCInfo[type[1]]||type[1]=="*"||artifact) success=1;
        else msg+="r profession cannot equip "+self.desc[type[1]];
      break;
      
      case "amulet":
      case "cloak":
      case "bracers":
      case "boots":
      case "gauntlets":
        part=type[0];
        success=1;
      break;
      
      
      case "armor":
        part="body";
        if(PCInfo[type[1]]||type[1]=="*"||artifact) success=1;
        else msg+="r profession cannot equip "+self.desc[type[1]];
        
      break;
      
      case "1hand":
      case "2hand":
        part="weapon";
        if(PCInfo[type[1]]||artifact) success=1;
        else msg+="r profession cannot equip "+self.desc[type[1]];
      break;
      
      case "shield":
        part="shield";
        if(PC.equip.weapon!=-1&&items[PC.equip.weapon].type[0]=='2hand') msg+=" cannot equip a shiled whilst wielding a two-handed weapon.";
        else if(PCInfo.shield||artifact) success=1;
        else msg+="r profession cannot equip shields.";
      break;
      
    }
    if(success){
      if(PC.equip[part]>=0) {
        items[PC.equip[part]].equip=0;
        items[PC.equip[part]].owned=1;
        PC.items.push(PC.equip[part]);
        msg+=" unequip the "+ITEM.itemName(PC.equip[part])+" and";
      }
      PC.equip[part]=self.sortArray[curPos];
      items[self.sortArray[curPos]].equip=1;
      items[self.sortArray[curPos]].owned=0;
      items[self.sortArray[curPos]].idd=1;
      for(i=0;i<PC.items.length;i++) if(PC.items[i]==self.sortArray[curPos]) PC.items.splice(i,1);
      msg+=" equip the "+ITEM.itemName(PC.equip[part])+".";
      self.sort=0;
      curPos=lastPos;
      ENTITY.updateArmor();
    }
    SCREEN.equipMenu();
    SCREEN.gameMessage(msg);
  
};

self.mobPickUp=function(e){
  var square=WORLD.getTile(mobs[e].X,mobs[e].Y);
  mobs[e].items.push(square.items[0]);
  if(ITEM.itemCount(mobs[e].X,mobs[e].Y)==1) square.items=[];
  else{
    square.items[0]=undefined;
    self.resetBoardItems(mobs[e].X,mobs[e].Y);
  }
};

self.pickUpItem=function(x){
  var iName;
  SCREEN.clearMessage();
  if(!ITEM.itemCount(PC.X,PC.Y)) SCREEN.gameMessage("Nothing here to pick up.");
  else if(ITEM.itemCount(PC.X,PC.Y)==1){
    iName=ITEM.itemName(ITEM.itemId(PC.X,PC.Y));
    items[ITEM.itemId(PC.X,PC.Y)].owned=1;
    PC.items.push(ITEM.itemId(PC.X,PC.Y)[0]);
    WORLD.getTile(PC.X,PC.Y).items=[];
    SCREEN.redrawBoard();
    SCREEN.gameMessage("You pick up the "+iName);
    flags.pickup=0;
  }
  else{
    if(!x){
      flags.pickup=1;
      curPos=0;
      SCREEN.drawMPU();
    }
    else {
      var theid=self.itemId()[x-1];
      items[theid].owned=1;
      PC.items.push(theid);
      delete WORLD.getTile(PC.X,PC.Y).items[x-1];
      self.resetBoardItems();
      if(curPos>self.itemCount()-1) curPos=self.itemCount()-1;
      SCREEN.drawMPU();
      SCREEN.gameMessage("You pick up the "+self.itemName(theid));
    }
  }
};


self.generateInitialItems=function(){
  var randx,randy,x;
  for(x = 1;x<=Math.rand(30,50);x++){
    randx=Math.rand(1,WORLD.width);
    randy=Math.rand(1,WORLD.height);
    if(WORLD.inRoom(randx,randy)&&WORLD.getTile(randx,randy).type=="floor"&&!WORLD.getTile(randx,randy).door) self.generateItem(randx,randy);
  }
};

self.drinkPotion=function(){
  
};

self.generateItem=function(x,y,whatIsIt){
  var theMat,theItem,kind,tmpItem,suffix;

  whatIsIt=whatIsIt || self.types[Math.rand(0,self.types.length-1)];
  
    if(!Math.rand(0,1600-(WORLD.level*4))&&self.artifacts.length&&!whatIsIt){
      console.log("RELIC");

      //choose a random artifact
      theItem = _.sample(self.artifacts);
      
      //remove it from artifacts
      delete self.artifacts[_.findKey(self.artifacts,theItem)];

      //SIV FIX THIS
      //I don't know what properties relics should have. For now,
      //I just copy the entire artifact object
      tmpItem=theItem;

      
    }
    
    else switch(whatIsIt){
      case "weapon":
        //sets theMat to a random material with a level less than the current WORLD's level
        //coin flip for WORLD.level or WORLD.level-1
        theMat = _.sample(
          _.filter(self.materials,function(m){
              return m.level<=WORLD.level-_.random(1);
          })
        );
        //picks a random weapon object
        theItem = _.sample(self.weapons);

        tmpItem = {
          name:  theMat.fName+" "+theItem.fName,
          uid:   theItem.fName,
          mat:   _.findKey(self.materials,theMat), //finds the actual key name given our material object
          type:  theItem.type,
          toHit: theMat.toHit,
          toDmg: theMat.toDmg,
          armor: 0,
          die:     theItem.die,
          stats: _.clone(theMat.stats)
        };

        //weapon buffs, stupidly rare

        //prefix
        if(!Math.rand(0,750-(WORLD.level*4)-theMat.level)){
          tmpItem.name=_.sample(self.prefixes.wPrefixes).fName+" "+tmpItem.name;
        }
        
        //suffix
        if(!Math.rand(0,750-(WORLD.level*4)-theMat.level)){

          //returns a random suffix object
          //from a filtered collection of wSuffixes
          //that are capable of being applied to the selected weapon
          suffix=_.sample(
            _.filter(self.suffixes.wSuffixes,function(suf){
              return suf[theItem.type] || suf.all;
            })
          );
          tmpItem.name+=" of "+suffix.fName;
        }
        
      break;
     
      case "armor":
        //random material
        theMat = _.sample(
          _.filter(self.materials,function(m){
              return m.level<=WORLD.level-_.random(1);
          })
        );

        //choose random armor
        theItem = _.sample(self.armor);

        tmpItem = {
          name:  theMat.fName + " " + theItem.fName,
          uid:   theItem.fName,
          mat:   _.findKey(self.materials,theMat),
          type:  theItem.type,
          toHit: 0,
          toDmg: 0,
          armor: theMat.armor+theItem.armor,
          stats: _.clone(theMat.stats)
        };

        //prefix buff
        if(!Math.rand(0,750-(WORLD.level*4)-theMat.level)){
          tmpItem.name=_.sample(self.prefixes).fName+" "+tmpItem.name;
        }

        //suffix buff
        if(!Math.rand(0,750-(WORLD.level*4)-theMat.level)){

          //choose a random suffix that can be applied to this armor
          suffix=_.sample(
            _.filter(self.suffixes.aSuffixes,function(suf){
              return suf.all || _.has(suf,theItem.type[0]) || _.has(suf,theItem.type[1]);
            })
          );
          tmpItem.name+=" of "+self.suffixes.aSuffixes[suffix].fName;
        }
        
      break;
      
      case "potion":
        kind=_.sample(_.keys(self.potions));
        tmpItem={
          name: "Potion of "+self.potions[kind],
          uid:  "Potion",
          type: ["potion",kind]
        };
      break;
      
      case "amulet":
        theItem = _.sample(self.amulets);
        tmpItem={
          name:  "Amulet of "+theItem.name,
          uid:   "Amulet",
          type:  ["amulet",_.findKey(self.amulets,theItem)],
          armor: theItem.armor,
          stats: _.clone(theItem.stats),
          regen: theItem.regen
        };
      break;
      
       case "cloak":
        theItem=_.sample(self.cloaks);
        tmpItem={
          name:  "Cloak of "+theItem.name,
          uid:   "Cloak",
          type:  ["cloak",_.findKey(self.cloaks,theItem)],
          armor: theItem.armor,
          stats: _.clone(theItem.stats)
        };
      break;

      case "scroll":
        tmpItem={};
      break;
      
    }
    
    if(!x||!y){
      tmpItem.owned=1;
      tmpItem.idd=1;
    }
    else {
      tmpItem.owned=0;
      tmpItem.idd=1;
    }
      
    tmpItem.equip=0;
    items.push(tmpItem);
    self.setItem(x,y,items.length-1);
    return tmpItem;
};


  self.setItem=function(x,y,z){
    if(!x||!y) PC.items.unshift(z);
    else WORLD.getTile(x,y).items.unshift(z);
  };
};
