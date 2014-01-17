/*globals SETUP,flags,SCREEN,PC:true,ITEM,ENTITY:true,WORLD,plist,rlist,pickp,pickr,picks,$,curPos:true,pickr:true,pickp:true,picks:true,lastPos:true*/
/*jshint unused:true,supernew:true*/
$(window).keydown(function(e) {
  'use strict';
  //e.preventDefault();
  var kc = e.which,keys={8:'bksp', 13:'return',27:'esc',32:'space',33:'pgup',34:'pgdn',37:'left',38:'up',39:'right',40:'down'},i;
  for(i = 65;i<=90;i++) keys[i]=String.fromCharCode(i).toLowerCase();

  //prevent history back on backspace
  if(keys[kc]=='bksp') {
    e.preventDefault();
  }
  
  if(flags.changelog) switch(keys[kc]){
    case 'esc':
      SCREEN.titleScreen();
      flags.changelog=0;
      flags.title=1;
    break;
      
    case 'g':
      window.open('https://github.com/sivart0/SivQuest','_blank');
    break;

  }
  else if(flags.title) switch(keys[kc]){
    case 'return':
      SETUP.startGame();
    break;
    case 'c':
      curPos=0;
      SCREEN.changelog();
      flags.changelog=1;
      flags.title=0;
    break;
    }
  
  else if(flags.inventory){
    
    switch(keys[kc]){
      case 'esc':
      case 'i':
        flags.inventory=0;
        SCREEN.redrawBoard();
        SCREEN.clearMessage();
        SCREEN.gameMessage('Enough of that.');
      break;
      
      case 'pgdn':
        if(curPos<25) curPos=0;
        else curPos-=25;
        SCREEN.showInventory();
      break;
      
      case 'pgup':
        if(curPos+25>PC.items.length-1) curPos=PC.items.length-1;
        else curPos+=25;
        SCREEN.showInventory();
      break;
      
      case 'up':
        if(curPos) curPos--;
        SCREEN.showInventory();
      break;
      
      case 'down':
        if(curPos<PC.items.length-1) curPos++;
        SCREEN.showInventory();
      break;
      
      case 'd':
        ITEM.dropItem();
      break;
      
      case 'e':
        curPos=0;
        ITEM.sort=0;
        SCREEN.equipMenu();
        flags.inventory=0;
        flags.equip=1;
      break;
      
    }
  }
  else if(flags.pickup){
    switch(keys[kc]){
      case 'esc':
        flags.pickup=0;
        SCREEN.redrawBoard();
        SCREEN.gameMessage('Enough of that.');
      break;
      
      case 'pgup':
        if(curPos<25) curPos=0;
        else curPos-=25;
        SCREEN.drawMPU();
      break;
      
      case 'pgdn':
        if(curPos+25>ITEM.itemCount()+1) curPos=ITEM.itemCount()-1;
        else curPos+=25;
        SCREEN.drawMPU();
      break;
      
      case 'up':
        if(curPos) curPos--;
        SCREEN.drawMPU();
      break;
      
      case 'down':
        if(curPos<ITEM.itemCount()-1) curPos++;
        SCREEN.drawMPU();
      break;
      case 'p':
      case 'return':
      case 'space':
        ITEM.pickUpItem(curPos+1);
      break;
      

    }
  }
  else if(flags.setup){
    switch(keys[kc]){
      case 'return':
        SETUP.namePlayer();
      break;
      case 'left':
        if(!curPos){
          if(pickr>0) pickr--;
          else pickr = SETUP.rList.length-1;
        }
      
        else if(curPos==1){
          if(pickp>0) pickp--;
          else pickp = SETUP.pList.length-1;
        }
      
        else if(curPos==2){
          picks=Math.abs(picks-1);
        }
      break;
      case 'up':
        if(curPos) curPos--;
        else curPos = 2;
      break;
      case 'right':
        if(!curPos){
          if(pickr<SETUP.rList.length-1) pickr++;
          else pickr = 0;
        }
      
        else if(curPos==1){
          if(pickp<SETUP.pList.length-1) pickp++;
          else pickp = 0;
        }
      
        else if(curPos==2){
          picks=Math.abs(picks-1);
        }
      break;
      case 'down':
        if(curPos!=2) curPos++;
        else curPos = 0;
      break;

    }
    var pcheck=SETUP.professions[SETUP.pList[pickp]].sex;
    if(pcheck=='m') picks=0;
    else if(pcheck=='f') picks=1;
    if(flags.setup) SCREEN.setupScreen();
  }
  else if(flags.equip){
    if(!ITEM.sort) switch(keys[kc]){
      case 'return':
      case 'space':
        ITEM.sort=curPos+1;
        ITEM.itemSorter();
        if(ITEM.sortArray.length){
          lastPos=curPos;
          curPos=0;
        }
        else ITEM.sort=0;
        
        
        SCREEN.equipMenu();
        if(!ITEM.sort) SCREEN.gameMessage('You have nothing to equip.');
        
      break;
      
      case 'up':
        if(curPos) curPos--;
        SCREEN.equipMenu();
      break;
      
      case 'down':
        if(curPos<10) curPos++;
        SCREEN.equipMenu();
      break;
      case 'esc':
      case 'e':
        flags.equip=0;
          SCREEN.redrawBoard();
          SCREEN.clearMessage();
          SCREEN.gameMessage('Enough of that.');
      break;

      case 'i':
        
        curPos=0;
        SCREEN.showInventory();
        flags.inventory=1;
        flags.equip=0;
      break;
      
      case 'u':
        ITEM.unequipItem();
      break;
    }
    else switch(keys[kc]){
      case 'return':
      case 'space':
      case 'e':
        ITEM.equipItem();
      break;
      case 'esc':
        ITEM.sort=0;
        curPos=lastPos;
        SCREEN.equipMenu();
      break;
      case 'up':
        if(curPos) curPos--;
        SCREEN.equipMenu();
      break;
      
      case 'down':
        if(curPos<ITEM.sortArray.length-1) curPos++;
        SCREEN.equipMenu();
      break;
      

    }
    
  }
  
  else if(flags.use){
    SCREEN.clearMessage();
    switch(keys[kc]){
      case 'esc':
        flags.use=0;
        SCREEN.redrawBoard();
      break;
      case 'up':
        if(curPos) curPos--;
        SCREEN.useMenu(flags.use);
      break;

      case 'down':
        if(curPos<ITEM.sortArray.length-1) curPos++;
        SCREEN.useMenu(flags.use);
      break;

      case 'return':
      case 'space':
        if(flags.use=='r') ITEM.readItem();
        else if(flags.use=='p') ITEM.drinkPotion();
      break;
    }
  }
  else{
    switch(keys[kc]){
      case 'left':
      case 'a':
        ENTITY.moveEntities(-1,0);
      break;

      case 'up':
      case 'w':
        ENTITY.moveEntities(0,-1);
      break;

      case 'd':
      case 'right':
        ENTITY.moveEntities(1,0);
      break;

      case 'down':
      case 's':
        ENTITY.moveEntities(0,1);
      break;
      
      case 'c':

      break;

      case 'e':
        curPos=0;
        ITEM.sort=0;
        SCREEN.equipMenu();
        flags.equip=1;
      break;
      
      case 'f':
        
      break;

      case 'h':
        SCREEN.helpMenu();
        flags.help=1;
      break;
      
      case 'i':
        curPos=0;
        SCREEN.showInventory();
        flags.inventory=1;
      break;
      
      
      case 'p':
        ITEM.pickUpItem(0);
      break;
      
      case 'q':
        SCREEN.clearMessage();
        ITEM.sort=12;
        ITEM.itemSorter();
        curPos=0;
        if(ITEM.sortArray.length){
          SCREEN.useMenu('p');
          flags.use='p';
        }
        else SCREEN.gameMessage('You have nothing to drink.');
      break;

      case 'r':
        SCREEN.clearMessage();
        ITEM.sort=13;
        ITEM.itemSorter();
        curPos=0;
        if(ITEM.sortArray.length){
          SCREEN.useMenu('r');
          flags.use='r';
        }
        else SCREEN.gameMessage('You have nothing to read.');
      break;
      

      case 'space':
      case 'return':
        if(WORLD.getTile(PC.X,PC.Y).stairs) WORLD.nextFloor();
        ENTITY.moveEntities(0,0);
      break;

    }
  }
});