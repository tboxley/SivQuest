/*globals flags,SCREEN,PC:true,items:true,ITEM,prompt,ENTITY:true,WORLD,plist,rlist,pickp,pickr,picks,races,profs,mobs:true,console*/
/*jshint unused:true,supernew:true*/
var ENTITY = new function(){
  'use strict';
  var self=this;
  
  
  self.loadJSON=function(){
    $.getJSON("json/monsters.json",function(moo){self.monsters=moo;});
  };


  self.activateTrap/*Card*/=function(e){
    var square,ent;
    if(!ent) ent=PC;
    else ent=mobs[e];
    square=WORLD.getTile(ent.X,ent.Y);
    switch(square.trap){
      case 'fire':
        
      break;

      case 'elec':
      break;

      case 'water':
      break;

      case 'acid':
      break;

      case 'spike':
      break;

      case 'snake':
        //Snake!? SNAAAAAAAAAAAKE!
      break;

      case 'pit':
      break;

    }
  };

  self.spawnMob=function(){
    var randx,randy,i,s,canSpawn=0,mobArr=[],mob,whichMob,theMob;
    randx=Math.rand(1,WORLD.width);
    randy=Math.rand(1,WORLD.height);
    if(!mobs.length) canSpawn=1;
    else for(i=0;i<mobs.length;i++){
      if((mobs[i].X==randx&&mobs[i].Y==randy)||(PC.X==randx&&PC.Y==randy)) {
        canSpawn=0;
        break;
      }
      else if(randx==PC.X&&randy==PC.Y) canSpawn=0;
      else canSpawn=1;
    }
    if(canSpawn){
      for(i in self.monsters){
        if(self.monsters[i].level<=WORLD.level+PC.LV+Math.rand(-2,1)) mobArr.push(i);
      }
      
      if(!mobArr.length) return;
      else{
        whichMob=mobArr[Math.rand(0,mobArr.length-1)];
        theMob=self.monsters[whichMob];
        mob={HP:0,STR:0,DEF:0,SPD:0,INT:0,armor:0};
        for(s in mob) for(i=0;i<theMob[s][0];i++) mob[s]+=Math.rand(1,theMob[s][1])+WORLD.level+Math.rand(1,2);
        mob.name=theMob.name;
        mob.X=randx;
        mob.Y=randy;
        mob.items=[];
        mobs.push(mob);
      }
    }
    else console.log('no');
    
  };
  
  self.attackMob=function(m){
    var dice,toHit,hit,dmg=0,toDmg,i,weapon;
    if(PC.equip.weapon==-1){
      if(PC.prof=='nj') dice=[2,6];
      else dice=[1,4];
      toHit=0;
      toDmg=0;
    }
    else{
      weapon=items[PC.equip.weapon];
      dice=weapon.die;
      toHit=weapon.toHit;
      toDmg=weapon.toDmg;
    }

    if(!mobs[m].hostile) mobs[m].hostile=1;

    hit=Math.rand(1,20)+toHit;
    for(i=0;i<dice[0];i++){
      dmg+=Math.rand(1,dice[1])+(Math.floor((PC.STR-10)/2));
    }
    dmg-=mobs[m].DEF;
    if(dmg<1) SCREEN.gameMessage('You attack the '+mobs[m].name+' but do no damage.');
    else{
      SCREEN.gameMessage('You attack the '+mobs[m].name+' for '+dmg+ ' damage!');
      mobs[m].HP-=dmg;
      if(mobs[m].HP<1) self.killMob(m);
    }
  };

  self.killMob=function(m){
    SCREEN.gameMessage('You kill the '+mobs[m].name);
    mobs.splice(m,1);
  };
  
  self.mobLOS=function(m){

  };

  self.moveEntities=function(x,y){
    var i,waitMobs=[],check;
    SCREEN.clearMessage();
    check=self.checkTile(PC.X+x,PC.Y+y);
    if(check[5]) self.attackMob(check[5]-1);
    if(check[1]){
      for(i=0;i<mobs.length;i++){
        if(mobs[i].SPD>PC.SPD) self.moveMob(i);
        else waitMobs.push(i);
      }
      if(check[0]) self.movePlayer(x,y,check);
      if(waitMobs.length) for(i=0;i<waitMobs.length;i++) self.moveMob(i);
    }
    else SCREEN.gameMessage(check[3]);
    SCREEN.redrawBoard();
  };

  self.moveMob=function(m){
    var tmpx,tmpy,check,i,x,y,attack=0;
    if(mobs[m].hostile){
      for(x=mobs[m].X-1;x<=mobs[m].X+1;x++){
        for(y=mobs[m].Y-1;y<=mobs[m].Y+1;y++){
          if(x==PC.X&&y==PC.Y){
            attack=1;
            break;
          }
        }
      }
    }
    if(attack){
      console.log('att');
    }
   
    else{
      tmpx=mobs[m].X+Math.rand(-1,1);
      tmpy=mobs[m].Y+Math.rand(-1,1);
      check=self.checkTile(tmpx,tmpy);
      if(tmpx==PC.X&&tmpy==PC.Y) check[0]=0;
    
      if(ITEM.itemCount(mobs[m].X,mobs[m].Y)&&!Math.rand(0,25)) {
        console.log(m+'pickup');
        ITEM.mobPickUp(m);
      }
      else if(check[0]){
        mobs[m].X=tmpx;
        mobs[m].Y=tmpy;
        if(mobs[m].wet&&check[4]!='water') mobs[m].wet--;
        if(check[2]){
          self.activateTrap(m);
        }
        self.activateSquare(m);
      }
    }
  };

  self.spawnStartingMobs=function(){
    var i;
    mobs=[];
    for(i=0;i<21;i++) self.spawnMob();
  };
  
  self.checkTile=function(x,y){
    var r=[],square=WORLD.getTile(x,y),doMove,cam,msg=0,mob=0,i;
    for(i=0;i<mobs.length;i++){
      if(x==mobs[i].X&&y==mobs[i].Y){
        mob=i+1;
        break;
      }
    }
    

    if(mob){
      doMove=0;
      cam=1;
    }
    else if(square.door=='c'){
      square.door='o';
      doMove=0;
      cam=1;
      if(mob>=1) SCREEN.gameMessage("You open the door.");
      SCREEN.redrawBoard();
    }
    else switch(square.type){
      default:
        cam=doMove=1;
      break;

      case 'offScreen':
        cam=doMove=0;
        msg='You cannot leave...';
      break;

      case 'wall':
        cam=doMove=0;
        msg='You run into the wall like a fuck.';
      break;

      case 'water':
        cam=doMove=1;
        msg='Splish!';
      break;
    }

    switch(square.overlay){
      case 'tree':
        if(PC.prof=='nj') msg='POOF! You stealthily hide behind the tree.';
        else msg='TREEEEEE';
      break;
    }
    r=[doMove,cam,square.trap,msg,square.type,mob];
    return r;
  };


  self.updateLOS=function(){
    SCREEN.mobsSee=[];
    var i,x,y,square;
    PC.LOS=3;
    if(!WORLD.level) PC.LOS=7;
    else if(WORLD.inRoom(PC.X,PC.Y)) PC.LOS=3;
    else PC.LOS=4;
    for(x=PC.X-PC.LOS;x<=PC.X+PC.LOS;x++) {
      for(y=PC.Y-PC.LOS;y<=PC.Y+PC.LOS;y++) {
        square=WORLD.getTile(x,y);
        if(WORLD.getTile(PC.X,PC.Y).door) square.seen=1;
        else if(WORLD.inRoom(PC.X,PC.Y)==WORLD.inRoom(x,y)||((square.tile=='wall'||square.door)&&!WORLD.inRoom(PC.X,PC.Y))) square.seen=1;
        for(i=0;i<mobs.length;i++){
          if(mobs[i].X==x&&mobs[i].Y==y&&WORLD.inRoom(mobs[i].X,mobs[i].Y)==WORLD.inRoom(PC.X,PC.Y)) SCREEN.mobsSee.push(i);
        }
        
      }
    }
  };

  self.updateArmor=function(){
    var x,y;
    PC.armor=0;
    PC.tmpStats=[0,0,0,0,0];
    PC.regen=0;
    for(x in PC.equip){
      if(PC.equip[x]>=0){
        PC.armor+=items[PC.equip[x]].armor;
        for(y=0;y<5;y++){
          PC.tmpStats[y]+=items[PC.equip[x]].stats[y];
        }
        if(items[PC.equip[x]].regen) PC.regen++;
      }
      
    }
    SCREEN.refreshStats();
  };

  self.activateSquare=function(e){
    var ent,square;
    if(e==-1) ent=PC;
    else ent=mobs[e];
    square=WORLD.getTile(ent.X,ent.Y);
    switch(square.type){
      case 'water':
        if(!ent.wet) ent.wet=Math.rand(8,24);
        else ent.wet+=Math.rand(2,8);
      break;
    }
    
  };
  
  self.movePlayer=function(x,y,c){
    PC.X+=x;
    PC.Y+=y;
    self.activateSquare(-1);
    if(c[3]) SCREEN.gameMessage(c[3]);
    if(c[2]){
      self.activateTrap(PC.X,PC.Y);
    }
    if(PC.wet&&c[4]!='water') PC.wet--;
    if(ITEM.itemCount(PC.X,PC.Y)) SCREEN.gameMessage(ITEM.itemName(PC.X,PC.Y));
  };
};