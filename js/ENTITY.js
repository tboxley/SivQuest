/*globals flags,SCREEN,PC:true,items:true,ITEM,prompt,ENTITY:true,WORLD,plist,rlist,pickp,pickr,picks,races,profs,mobs:true,console*/
/*jshint unused:true,supernew:true*/
var ENTITY = new function(){
  'use strict';
  var self=this;
  self.ka=0;
  self.loadJSON=function(){
    $.getJSON("json/monsters.json",function(moo){self.monsters=moo;});
    $.getJSON("json/powers.json",function(moo){self.powers=moo;});
  };

  self.diceRoll=function(d,x){
    //this function is useless
    var rolls=[],total=0;
    if(!d) d=1;
    if(!x) x=20;
    rolls = _.times(d, _.partial(_.random, 1, x,false));
    for(var i=0;i<_.size(rolls);i++) total+=rolls[i];
    return total;
  };

  self.grantPower=function(){
    var powers=ENTITY.powers[PC.prof],powList=[];
    for(var i in powers){
      if(powers[i].level==PC.LV) powList.push(i);
    }
    if(_.size(powList)) PC.powers.push(_.sample(powList));
  };
  
  self.activateTrap/*Card*/=function(e){
    var square,ent,msg,dmg=0;
    self.ka=0;
    if(e==-1) ent=PC;
    else ent=mobs[e];
    square=WORLD.getTile(ent.X,ent.Y);
    switch(square.trap){
      case 'fire':
        if(ent.wet){
          ent.wet=0;
          msg='Psssshhhh. You are dried off.';
        }
        
        else{
          dmg=ENTITY.diceRoll(2,4);
          msg='WHOOSH! You are burned.';
          if(ENTITY.diceRoll()==20){
            ent.burning+=ENTITY.diceRoll(1,8);
            msg+=' You are also on fire. Nice.';
          }
        }
      break;

      case 'elec':
        if(ent.wet){
          dmg=ENTITY.diceRoll(4,8);
          ent.wet=0;
          msg='KRACKOOOOOOOOOOOOOOM!';
          self.ka='elec2';
        }
        else{
          dmg=ENTITY.diceRoll(1,8);
          msg='You get the shit shocked out of you!';
        }
      break;

      case 'water':
        if(ent.burning){
          ent.burning=0;
          msg='That\'s nice.';
        }
        else{
          ent.wet+=ENTITY.diceRoll(2,8);
          msg='You are hit by a stream of water.';
        }
      break;

      case 'acid':
        msg='You are splashed by acid!';
        if(ent.wet){
          ent.wet=0;
          dmg=ENTITY.diceRoll(1,8);
          msg+=' The water dripping off you neutralized some of the acid.';
        }
        else dmg=ENTITY.diceRoll(4,6);
          
        
      break;

      case 'spike':
        dmg=ENTITY.diceRoll(1,16);
        msg='You step on some not so cleverly hidden spikes.';
        if(dmg<=3) msg+=' That hurt almost as bad as stepping on a lego.';
      break;

      case 'snake':
        var snakes=_.random(3,6),poisoned=0;
        msg='You fall into a pit of snakes!';
        for(var i=0;i<snakes;i++){
          dmg+=_.random(1,3);
          if(!_.random(0,15)) poisoned++;
        }
        if(poisoned) {
          for(i=0;i<poisoned;i++){
            ent.poison+=ENTITY.diceRoll(2,8);
          }
          msg+=' You have been poisoned!';
        }

      break;

    }
    ent.HP-=dmg;
    if(e==-1){
      SCREEN.gameMessage(msg);
      if(!self.ka) self.ka=square.trap;
    }
  };

  self.spawnMob=function(){
    var randx,randy,i,s,canSpawn=0,mobArr=[],mob,whichMob,theMob;
    randx=_.random(1,WORLD.width);
    randy=_.random(1,WORLD.height);
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
        if(self.monsters[i].level<=WORLD.level+PC.LV+_.random(-2,1)) mobArr.push(i);
      }
      
      if(!mobArr.length) return;
      else{
        whichMob=mobArr[_.random(0,mobArr.length-1)];
        theMob=self.monsters[whichMob];
        mob={HP:0,STR:0,DEF:0,SPD:0,INT:0,armor:0};
        for(s in mob) for(i=0;i<theMob[s][0];i++) mob[s]+=_.random(1,theMob[s][1])+WORLD.level+_.random(1,2);
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

    hit=_.random(1,20)+toHit;
    for(i=0;i<dice[0];i++){
      dmg+=_.random(1,dice[1])+(Math.floor((PC.STR-10)/2));
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
    //SCREEN.gameMessage('You kill the '+mobs[m].name);
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
      tmpx=mobs[m].X+_.random(-1,1);
      tmpy=mobs[m].Y+_.random(-1,1);
      check=self.checkTile(tmpx,tmpy);
      if(tmpx==PC.X&&tmpy==PC.Y) check[0]=0;
    
      if(ITEM.itemCount(mobs[m].X,mobs[m].Y)&&!_.random(0,25)) {
        console.log(m+'pickup');
        ITEM.mobPickUp(m);
      }
      else if(check[0]){
        mobs[m].X=tmpx;
        mobs[m].Y=tmpy;
        if(check[2]){
          self.activateTrap(m);
        }
        self.activateSquare(m);
      }
    }
    if(mobs[m].HP<1) self.killMob(m);
  };

  self.spawnStartingMobs=function(){
    mobs=[];
    _.times(25,self.spawnMob);
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
    var i,x,y,square,distanceFromPC,visibility;
    PC.LOS=3;
    if(!WORLD.level) PC.LOS=7;
    else if(WORLD.inRoom(PC.X,PC.Y)) PC.LOS=3;
    else PC.LOS=4;
    for(x=PC.X-PC.LOS;x<=PC.X+PC.LOS+1;x++) {
      for(y=PC.Y-PC.LOS;y<=PC.Y+PC.LOS;y++) {
        
        var distanceFromPC = Math.sqrt(Math.pow(PC.X-x,2)+Math.pow(PC.Y-y,2));

        //LOS is now a circle!
        if(distanceFromPC>=PC.LOS) continue;

        square=WORLD.getTile(x,y);

        if(distanceFromPC>PC.LOS-1) {
          visibility = Math.max(square.seen,1-Math.floor(PC.LOS/PC.LOS)/PC.LOS);
        } else {
          visibility = 1;
        }

        if(WORLD.getTile(PC.X,PC.Y).door) square.seen=visibility;
        else if(WORLD.inRoom(PC.X,PC.Y)==WORLD.inRoom(x,y)||((square.tile=='wall'||square.door)&&!WORLD.inRoom(PC.X,PC.Y))) square.seen=visibility;
        for(i=0;i<mobs.length;i++){
          if(mobs[i].X==x&&mobs[i].Y==y&&WORLD.inRoom(mobs[i].X,mobs[i].Y)==WORLD.inRoom(PC.X,PC.Y)) SCREEN.mobsSee.push(i);
        }
        
      }
    }
  };

  self.updateArmor=function(){
    var x,y;
    PC.armor=0;
    PC.tmpStats=[0,0,0,0,0,0];
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
      default:
        if(ent.wet) ent.wet--;
        else if(ent.wet<1) ent.wet=0;
      break;
      
      case 'water':
        ent.burning=0;
        if(!ent.wet) ent.wet=_.random(8,24);
        else ent.wet+=_.random(2,8);
      break;
    }
    
  };
  
  self.movePlayer=function(x,y,c){
    PC.X+=x;
    PC.Y+=y;
    self.activateSquare(-1);
    if(c[3]) SCREEN.gameMessage(c[3]);
    if(c[2]){
      self.activateTrap(-1);
      if(PC.HP<1) self.killPlayer('trap',self.ka);
    }
    if(PC.burning){

    }
    if(ITEM.itemCount(PC.X,PC.Y)) SCREEN.gameMessage(ITEM.itemName(PC.X,PC.Y));
    
    if(PC.prof=='pmmm'){
      PC.MP--;
      if(PC.MP<1) self.killPlayer('sayaka');
    }

  };

  self.killPlayer=function(h,a){
    var msg;
    SCREEN.redrawBoard();
    switch(h){
      default:
        msg=PC.name+' was killed by an unprogrammed death.\nShit happens.';
      break;
      
      case 'trap':
        msg=PC.name;
        switch(a){
          default:
            msg+='was killed by an unprogrammed trap.\nThat\'s impressive';
          break;
          
          case 'water':
            msg='This isn\'t even possible!';
          break;
          
          case 'fire':
            msg+=' was burnt to a fine crisp.';
          break;
          
          case 'elec':
            msg+=' was electrocuted.';
          break;

          case 'elec2':
            msg='Oh, snap.';
          break;
          
          case 'acid':
            msg+=' was dissolved by acid.';
          break;

          case 'spike':
            msg+=' was skewered by spikes';
            if(PC.burning) msg+=' and became a race shish kabob.';
            else msg+='.';
          break;

          case 'snake':
            msg+=' was nommed by snakes.';
          break;
        }
      break;
      
      case 'sayaka':
        msg=PC.name+' fell into despair and became a witch.';
      break;
    }
    alert(msg+"");
    document.location='';
  };

};