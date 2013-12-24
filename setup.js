/*globals flags,SCREEN,PC:true,items:true,ITEM,prompt,ENTITY,WORLD,plist,rlist,pickp,pickr,picks,races,profs*/
/*jshint unused:true,supernew:true*/
var SETUP = new function(){
  "use strict";
  var self=this;
  self.startGame=function(){
    flags.title=0;
    flags.setup=1;
    SCREEN.setupScreen();
  };
  
  self.startingItems=function(){
    switch(PC.prof){
      case "wz":
        items.push({name:"Wizard Hat",idd:1,type:["head","light"],armor:2,toHit:0,toDmg:0,mat:"cloth",owned:0,equip:1,stats:[0,0,0,0,0]});
        items.push({name:"Wizard Robe",idd:1,type:["armor","light"],armor:3,toHit:0,toDmg:0,mat:"cloth",owned:0,equip:1,stats:[0,0,0,0,0]});
        items.push({name:"Oak Staff",idd:1,type:["2hand","staff"],armor:0,toHit:0,toDmg:0,die:[1,10],mat:"wood",owned:0,equip:1,stats:[0,0,0,0,0]});
        items.push({name:"Soft Sandles",idd:1,type:["boots"],armor:1,toHit:0,toDmg:0,mat:"soft :3",owned:0,equip:1,stats:[0,0,0,0,0]});
        PC.equip.head=0;
        PC.equip.body=1;
        PC.equip.weapon=2;
        PC.equip.boots=3;
        for(var x=1;x<=Math.rand(2,4);x++) ITEM.generateItem(0,0,"potion");
      break;

      case "kt":
        items.push({name:"Large Steel Helmet",idd:1,type:["head","heavy"],armor:4,toHit:0,toDmg:0,mat:"steel",owned:0,equip:1,stats:[0,0,0,0,0]});
        items.push({name:"Steel Platemail",idd:1,type:["armor","heavy"],armor:7,toHit:0,toDmg:0,mat:"steel",owned:0,equip:1,stats:[0,0,0,0,0]});
        if(PC.race=="dw") items.push({name:"Steel Battleaxe",idd:1,type:["2hand","sword"],armor:0,toHit:1,toDmg:4,die:[1,8],mat:"steel",owned:0,equip:1,stats:[0,0,0,0,0]});
        else items.push({name:"Steel Longsword",idd:1,type:["1hand","sword"],armor:0,toHit:3,toDmg:1,die:[1,8],mat:"steel",owned:0,equip:1,stats:[0,0,0,0,0]});
        items.push({name:"Steel Boots",idd:1,type:["boots"],armor:3,toHit:0,toDmg:0,mat:"steel",owned:0,equip:1,stats:[0,0,0,0,0]});
        items.push({name:"Steel Gauntlets",idd:1,type:["gauntlets"],armor:3,toHit:0,toDmg:0,mat:"steel",owned:0,equip:1,stats:[0,0,0,0,0]});
        PC.equip.head=0;
        PC.equip.body=1;
        PC.equip.weapon=2;
        PC.equip.boots=3;
        PC.equip.gauntlets=4;
      break;

      case "bd":
        items.push({name:"Bard Hat",idd:1,type:["head","light"],armor:2,toHit:0,toDmg:0,mat:"cloth",owned:0,equip:1,stats:[0,0,0,0,0]});
      break;
    }
  };

  self.namePlayer=function(){
    var name=prompt("What is your name?");
    self.setupPlayer(name);
  };

  self.setupPlayer=function(name){
    if(name!==null&&name!==""&&name.length<21) {
      items=[];
      PC={
        name:name,
        prof:plist[pickp],
        race:rlist[pickr],
        items:[],
        sex:picks,
        wet:0,
        poison:0,
        armor:0,
        money:Math.rand(80,200)+Math.rand(20,50),
        STR:Math.rand(15,20)+races[rlist[pickr]].str+profs[plist[pickp]].str,
        DEF:Math.rand(15,20)+races[rlist[pickr]].def+profs[plist[pickp]].def,
        INT:Math.rand(15,20)+races[rlist[pickr]].ints+profs[plist[pickp]].ints,
        SPD:Math.rand(15,20)+races[rlist[pickr]].spd+profs[plist[pickp]].spd,
        MaxHP:Math.rand(20,25)+races[rlist[pickr]].hp+profs[plist[pickp]].hp,
        X:6,
        Y:9,
        tmpStats:[0,0,0,0,0],
        LV:1,
        XP:0,
        equip:{head:-1,amulet:-1,cloak:-1,body:-1,weapon:-1,shield:-1,bracers:-1,gauntlets:-1,boots:-1,missile:-1,mWeapon:-1},
        LOS:6,
        Moves:0
      };
      PC.MaxHP+=PC.DEF-10;
      PC.HP=PC.MaxHP;
      self.startingItems();
      ENTITY.updateArmor();
      flags.setup=0;
      WORLD.level=0;
      WORLD.generateBoard();
      
    }
    
    
  };
};