/*globals flags,SCREEN:true,PC:true,items:true,ITEM,ENTITY,WORLD,plist,rlist,pickp,pickr,picks,races,profs*/
/*jshint unused:true,supernew:true */
SCREEN = new function(){

  var tiles=[],camera={},self=this,blankScreen,loadImages,writeText,helpText,drawTile,barDraws=0,gameVersion='Déjà vu Edition.',ctx;
  self.cty=0;
  self.mobsSee=[];


  loadImages=function(){
    $.getJSON("json/images.php")
    .fail(function(){
      var imgs = ["blank","cDoor","dStairs","fireTrap","floor1","grass","item","items","missing","oDoor","sand","shadow","sidebar","topbar","trap","tree","uStairs","wall","water","white","wizard"];
      for(var i=0;i<imgs.length;i++){
        tiles[imgs[i]]=new Image();
        tiles[imgs[i]].src='img/'+imgs[i]+'.png';
      }
    })
    .success(function(data){
      var imgs = data['imgs'];
      for(var i=0;i<imgs.length;i++){
        tiles[imgs[i]]=new Image();
        tiles[imgs[i]].src='img/'+imgs[i]+'.png';
        
      }
    });
  };
  loadImages();
  
  
  self.titleScreen=function(){
    ctx= $('#canvas')[0].getContext('2d');
    ctx.fillStyle='black';
    ctx.fillRect(0,0,1280,720);
    document.title='SivQuest '+gameVersion;
    writeText("SivQuest",250,220,0,224,'lhf_stratfordregular');
    writeText(gameVersion,270,294,0,32,'lhf_stratfordregular');
    helpText("Enter => Start Game. C => Changelog.");

  };
  


  self.infoScreen=function(m){
    var i,whichone,name;
    if(m=='h') {
      whichone='helptext';
      name='manual.doc';
    }
    else if(m=='c') {
      whichone='changelog';
      name='What have we changed?';
    }
    ctx.fillStyle='rgba(0,0,0,1)';
    ctx.fillRect(0,0,1280,720);
    writeText(name,600,32);
    $.get("txt/"+whichone+".txt").done(function(e){
      var moo=e.split("\n");
      self.clCount=moo.length;
      for(i=0;i<36;i++) if(typeof moo[i+curPos]!=='undefined')writeText(moo[i+curPos],180,86+16*i);
    });
    helpText("Up/Down => Scroll 1 line. Page up/Page down => Scroll 5 lines. 0-9 => Jump to section.",72);
  };
  
  self.colorOverlay=function(x,y,color,alpha){
    if(color=='rand') color=WORLD.colors[_.random(0,WORLD.colors.length-1)];
    ctx.fillStyle=color;
    ctx.globalAlpha=alpha||0.25;
    ctx.fillRect((x-1)*48,(y-1)*48,48,48);
    ctx.globalAlpha=1;
  };
  
  self.setupScreen=function(){
    var sex=['male','female'],text='',text2='',text3='',text4='',pInfo=SETUP.professions[SETUP.pList[pickp]],eArr=[];
    if(pInfo.fName=='Bard') eArr.push('Everything.');
    else for(var x in ITEM.desc) if(pInfo[x]) eArr.push(ITEM.desc[x]);
    ctx.fillStyle='black';
    ctx.fillRect(0,0,1280,720);
    helpText("Up/Down => Move Cursor. Left/Right => Change option. Enter => Finish.");
    writeText("Race:       "+SETUP.races[SETUP.rList[pickr]].fName,150,150);
    writeText("Profession: "+SETUP.professions[SETUP.pList[pickp]].fName,150,170);
    writeText("Sex:        "+sex[picks],150,190);
    writeText(">",135,150+20*curPos);
    if(curPos===0){
      text = SETUP.races[SETUP.rList[pickr]].desc;
      text2 = "   Stat changes for this race: HP:"+SETUP.races[SETUP.rList[pickr]].hp+" MP:"+SETUP.races[SETUP.rList[pickr]].mp+" STR:"+SETUP.races[SETUP.rList[pickr]].str+" DEF:"+SETUP.races[SETUP.rList[pickr]].def+" INT:"+SETUP.races[SETUP.rList[pickr]].ints+" SPD:"+SETUP.races[SETUP.rList[pickr]].spd;
    }
  
    else if(curPos==1) {
      text = SETUP.professions[SETUP.pList[pickp]][sex[picks]+'Desc'];
      text2 = "    Stat changes for this profession: HP:"+SETUP.professions[SETUP.pList[pickp]].hp+" MP:"+SETUP.professions[SETUP.pList[pickp]].mp+" STR:"+SETUP.professions[SETUP.pList[pickp]].str+" DEF:"+SETUP.professions[SETUP.pList[pickp]].def+" INT:"+SETUP.professions[SETUP.pList[pickp]].ints+" SPD:"+SETUP.professions[SETUP.pList[pickp]].spd;
      text3 = "Can equip: "+eArr.join(', ');
      
    }
    
    writeText(text,142,280);
    writeText(text2,142,300);
    writeText(text3,142,320);
    writeText(text4,142,340);
  };
  
  self.clearMessage=function(){
    ctx.fillStyle='black';
    ctx.fillRect(16,635,1200,72);
    txt=0;
  };
  
  self.gameMessage=function(msg){
    writeText(msg,20,652+(18*txt));
    txt++;
  };
  
  self.redrawBoard=function(){
    var square,i,x,y,see,mobs=WORLD.floors[WORLD.level].mobs;
    ctx.drawImage(tiles['ui/topbar'],0,13*48);
    ctx.drawImage(tiles['ui/sidebar'],1008,0);
    ENTITY.updateLOS();
    blankScreen();
    if(PC.X>=11&&PC.X<=WORLD.floors[WORLD.level].width-10) camera.x=PC.X;
    else if(PC.X<11) camera.x=11;
    else camera.x=WORLD.floors[WORLD.level].width-10;
    if(PC.Y>=7&&PC.Y<=WORLD.floors[WORLD.level].height-6) camera.y=PC.Y;
    else if(PC.Y<7) camera.y=7;
    else camera.y=WORLD.floors[WORLD.level].height-6;
    
    var tmpx=1,tmpy=1;
    for(x = camera.x-10;x<=camera.x+10;x++){
      for(y = camera.y-6;y<=camera.y+6;y++){
        square=WORLD.getTile(x,y);

        if(square.tile) drawTile('tiles/'+square.tile,tmpx,tmpy);
        
        if(square.color) self.colorOverlay(tmpx,tmpy,square.color);
        if(square.stairs) drawTile('tiles/'+square.stairs+'Stairs',tmpx,tmpy);
        if(ITEM.itemCount(x,y)>1) drawTile('items/items',tmpx,tmpy);
        if(ITEM.itemCount(x,y)==1) drawTile('items/item',tmpx,tmpy);
        if(square.trapSeen&&square.trap) drawTile('traps/'+square.trap,tmpx,tmpy);
        if(square.door) drawTile('tiles/'+square.door+'Door',tmpx,tmpy);
        if(PC.X==x&&PC.Y==y) {
          if("pc/"+tiles[PC.prof]) drawTile("pc/"+PC.prof,tmpx,tmpy);
          else drawTile('wizard',tmpx,tmpy);
        }
        for(i=0;i<self.mobsSee.length;i++){
          see=self.mobsSee[i];
          if(mobs[see].X==x&&mobs[see].Y==y&&!mobs[see].invis) drawTile('mobs/mob',tmpx,tmpy);
        }
        if(square.overlay) drawTile("overlays/"+square.overlay,tmpx,tmpy);
        if(square.seen!=1) self.colorOverlay(tmpx,tmpy,'#000',1-square.seen);
        
        tmpy++;
      }
      tmpx++;
      tmpy=1;
    }
    self.refreshStats();
   };
   
   drawTile=function(tile,x,y){
    if(!tiles[tile]) tile='misc/missing';
    ctx.drawImage(tiles[tile],(x-1)*48,(y-1)*48,48,48);
  };
  
  helpText=function(d,o){
    if(!o) o=0;
    writeText(d,80,604+o);
  };
  
  writeText=function(text,x,y,color,size,font){
    if(!color) color='white';
    if(!size) size=16;
    if(!font) font='consolas';
    ctx.font=size+'pt '+font;
    ctx.fillStyle=color;
    ctx.fillText(text,x,y);
  };
  
  self.refreshStats=function(){
    ctx.fillStyle='black';
    ctx.fillRect(1020,12,240,580);
    writeText(PC.name,1024,32);
    writeText("Lvl "+PC.LV+" "+SETUP.professions[PC.prof].fName,1024,148-96);
    writeText("HP:"+PC.HP+"/"+(PC.MaxHP+PC.tmpStats[0]),1024,168-96);
    writeText("MP:"+PC.MP+"/"+(PC.MaxMP+PC.tmpStats[1]),1024,188-96);
    writeText("STR:"+(PC.STR+PC.tmpStats[2]),1024,208-96);
    writeText("DEF:"+(PC.DEF+PC.tmpStats[3]),1024,228-96);
    writeText("SPD:"+(PC.SPD+PC.tmpStats[4]),1024,248-96);
    writeText("INT:"+(PC.INT+PC.tmpStats[5]),1024,268-96);
    writeText("Gold:"+PC.money,1024,288-96);
    writeText("Armor Rating:"+PC.armor,1024,308-96);
    writeText("EXP:"+PC.XP,1024,328-96);
    writeText("Next Lvl:"+(PC.XPtoNext-PC.XP),1024,348-96);
    if(PC.wet) writeText(" Wet",1024,348-56,'blue');
    if(PC.burning) writeText(" On fire!",1024,348-56,'red');
    if(PC.poison) writeText("          Poisoned!",1024,348-56,'purple');
    
  };
  
  blankScreen=function(){
    ctx.fillStyle='black';
    ctx.fillRect(0,0,1008,720-96);
  };

  self.fullBlank=function(){
    ctx.fillStyle='black';
    ctx.fillRect(0,0,1280,720);
  };
  
  self.showInventory=function (){
    self.clearMessage();
    if(flags.equip) self.gameMessage("Sorted items, how nasty.");
    else if(!flags.inventory) self.gameMessage('You open your inventory.');
    var iPos=0;
    blankScreen();
    helpText("Esc/I => Close. D => Drop Item. U => Use Item.");
    writeText('Inventory',480,32);
    for(var x =0;x<=24;x++){
      if(PC.items[x]>=0) {
        if(curPos<25) num=x;
        else num=x+(curPos-24);
        writeText(ITEM.itemName(PC.items[num]),96,104+iPos*18);
      }
      iPos++;
    }
    if(PC.items.length) {
      if(curPos<25) writeText("> ",78,104+curPos*18);
      else writeText("> ",78,104+24*18);
      if(items[PC.items[curPos]].desc && items[PC.items[curPos]].idd) self.gameMessage(items[PC.items[curPos]].desc);
    }
    else writeText("Inventory empty.",86,104);
  };
  
  
  
  self.equipMenu=function(){
    self.clearMessage();
    var iPos=0;
    if(flags.inventory) self.gameMessage("Unsorted items, now nasty.");
    else if(!flags.equip) self.gameMessage("You open your equipment.");
    blankScreen();
    writeText('Equipment Menu',460,32);
    if(!ITEM.sort){
      writeText('Head:           '+ITEM.itemName(PC.equip.head),80,104);
      writeText('Amulet:         '+ITEM.itemName(PC.equip.amulet),80,124);
      writeText('Cloak:          '+ITEM.itemName(PC.equip.cloak),80,144);
      writeText('Body:           '+ITEM.itemName(PC.equip.body),80,164);
      writeText('Weapon:         '+ITEM.itemName(PC.equip.weapon),80,184);
      writeText('Shield:         '+ITEM.itemName(PC.equip.shield),80,204);
      writeText('Bracers:        '+ITEM.itemName(PC.equip.bracers),80,224);
      writeText('Gauntlets:      '+ITEM.itemName(PC.equip.gauntlets),80,244);
      writeText('Boots:          '+ITEM.itemName(PC.equip.boots),80,264);
      writeText('Missile Weapon: '+ITEM.itemName(PC.equip.mWeapon),80,284);
      writeText('Missiles:       '+ITEM.itemName(PC.equip.missile),80,304);
      writeText('>',60,104+20*curPos);
      helpText("E/Esc => close. Enter/Space => select. I => Inventory. U => Unequip");
    }
    else{
      if(ITEM.sortArray.length){
        for(var x =0;x<=24;x++){
          if(ITEM.sortArray[x]) {
            if(curPos<25) num=x;
            else num=x+(curPos-24);
            writeText(ITEM.itemName(_.findKey(items,ITEM.sortArray[num])),96,104+iPos*18);
          }
          iPos++;
        }
        if(curPos<25) writeText("> ",78,104+curPos*18);
        else writeText("> ",78,104+24*18);
        helpText("Esc => Cancel. Enter/Space/E => Equip item.");
      }
    }
  };
  
  self.drawMPU=function(){
    var iPos=0,idList=ITEM.itemId(PC.X,PC.Y);
    blankScreen();
    writeText('Pick shit up.',480,32);
    for(var x =0;x<=24;x++){
      if(idList[x]) {
        if(curPos<25) num=x;
        else num=x+(curPos-24);
        writeText(ITEM.itemName(idList[num]),96,104+iPos*18);
      }
      else continue;
      iPos++;
    }
    if(ITEM.itemCount()){
      if(curPos<25) writeText("> ",78,104+curPos*18);
      else writeText("> ",78,104+24*18);
    }
    else writeText("Nothing else to pick up.",86,200);
  };
  
  self.useMenu=function(f){
    var header,help,msg;
    if(f=='p'){
      header="Drinking Menu";
      msg="What would you like to drink?";
      help="Drink Potion.";

    }
    else if(f=='r'){
      header='Reading Rainbow Menu';
      msg="What would you like to read?";
      help="Read Scroll.";
    }
    iPos=0;
    blankScreen();
    writeText(header,460,32);
    if(ITEM.sortArray.length){
      self.gameMessage(msg);
        for(var x =0;x<=24;x++){
          if(ITEM.sortArray[x]) {
            if(curPos<25) num=x;
            else num=x+(curPos-24);
            writeText(ITEM.itemName(_.findKey(items,ITEM.sortArray[num])),96,104+iPos*18);
          }
          iPos++;
        }

      if(curPos<25) writeText("> ",78,104+curPos*18);
      else writeText("> ",78,104+24*18);
    }
    else gameMessage('HAX');
    helpText("Esc => Cancel. Enter/Space => "+help);
    
  };
};