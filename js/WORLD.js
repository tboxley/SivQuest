/*globals flags,SCREEN,PC:true,items:true,ITEM,prompt,ENTITY:true,WORLD:true,plist,rlist,pickp,pickr,picks,races,profs,mobs:true,console*/
/*jshint unused:true,supernew:true*/
var WORLD=new function(){
  'use strict';
  var boardTiles,self=this,randColor=0,makeRooms,addDoors;
  self.traps=['fire','elec','water','acid','spike','snake'];
  self.level=1;
  self.fColor=0;
  self.wColor=0;
  self.width=0;
  self.height=0;
  self.rooms=[];
  self.setTile=function(x,y,ty,ti,color){
    
    if(!color) color=0;
    if(!ti) ti=ty;
    
    boardTiles[x+','+y]={};
    boardTiles[x+','+y].items=[];
    boardTiles[x+','+y].type=ty;
    boardTiles[x+','+y].tile=ti;
    boardTiles[x+','+y].trap=0;
    boardTiles[x+','+y].trapSeen=1;
    boardTiles[x+','+y].overlay=0;
    boardTiles[x+','+y].color=color;
    boardTiles[x+','+y].stairs=0;
    boardTiles[x+','+y].seen=0;
    boardTiles[x+','+y].door=0;
    if(ti=='grass'&&!_.random(0,25)) boardTiles[x+','+y].overlay='tree';
  };
  
  
   self.getTile=function(x,y){
    if(!boardTiles[x+','+y]||x>self.width||y>self.height) return {type: 'offScreen',items:[],tile:0,trap:0,trapSeen:0,stairs:0,seen:0};
    else return boardTiles[x+','+y];
  };
  


  self.generateBoard=function(){
    var x,y,rooms=self.rooms;
    boardTiles={};
    self.wColor=('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
    self.fColor=('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
    if(!self.level){
      self.width=31;
      self.height=13;
      for(x=1;x<=self.width;x++){
        for(y=1;y<=self.height;y++){
          self.setTile(x,y,'grass',0,0,1);
        }
      }
      self.makeRiver();
      rooms[0]={top:6,bottom:12,left:24,right:30};
      for(x=24;x<=30;x++){
        for(y=6;y<=12;y++){
          if(x==24||x==30||y==12||y==6) self.setTile(x,y,'wall','wall','gold');
          else self.setTile(x,y,'floor','floor2','gold');
        }
      }
      self.setTile(24,9,'floor','floor2','gold');
      self.getTile(24,9).door='c';
      self.getTile(27,9).stairs='d';
    }
    
    else{
      for(x=1;x<=self.width;x++){
        for(y=1;y<=self.height;y++){
          if(x==1||y==1||x==self.width||y==self.height) self.setTile(x,y,'wall');
          else self.setTile(x,y,'floor','floor1');

        }
      }
      makeRooms();
      ITEM.generateInitialItems();
      ENTITY.spawnStartingMobs();
      _.times(_.random(115,300), self.setTrap);
    }
    SCREEN.redrawBoard();
  };
  
  self.inRoom=function(x,y){
    var i;
    for(i=0;i<self.rooms.length;i++) if(x>=self.rooms[i].left && x<=self.rooms[i].right && y>=self.rooms[i].top && y<=self.rooms[i].bottom) return i+1;
  };

  makeRooms=function(){
    var roomCount=0,roomX,roomY,roomWidth,roomHeight,e=0,x,y,r,tries,c1,c2,newTop,newBottom,newLeft,newRight,stairRoom,stairx,stairy;
    self.rooms=[];
    if(!randColor){
      c1=self.fColor;
      c2=self.wColor;
    }
    for(tries=0;tries<3000;tries++){
      
      if(!roomCount){
        roomX=PC.X;
        roomY=PC.Y;
        roomWidth=2;
        roomHeight=2;
        e=0;
      }
      
      else {
        roomWidth=_.random(2,5);
        roomHeight=_.random(2,5);
        roomX=_.random(4+roomWidth,self.width-roomWidth-3);
        roomY=_.random(4+roomHeight,self.height-roomHeight-3);
        newTop=roomY-roomHeight-1;
        newBottom=roomY+roomHeight+1;
        newLeft=roomX-roomWidth-1;
        newRight=roomX+roomWidth+1;
        for(r=0;r<self.rooms.length;r++){
          if(newBottom < self.rooms[r].top-1 || newTop > self.rooms[r].bottom+1 || newLeft >self. rooms[r].right+1 || newRight < self.rooms.left-1){
            e=0;
          }
          else {
            e=1;
            break;
          }
        }
      }
      
      
      if(!e) {
        self.rooms.push({top:roomY-roomHeight-1,right:roomX+roomWidth+1,bottom:roomY+roomHeight+1,left:roomX-roomWidth-1,doors:0});
        for(x = roomX-roomWidth-1;x<=roomX+roomWidth+1;x++){
          for(y=roomY-roomHeight-1;y<=roomY+roomHeight+1;y++){
            if(y==roomY-roomHeight-1||y==roomY+roomHeight+1||x==roomX-roomWidth-1||x==roomX+roomWidth+1) self.setTile(x,y,'wall','wall',c2,1);
            else self.setTile(x,y,'floor','floor1',c1);
          }
        }
        roomCount++;
      }
    }
    
    stairRoom=self.rooms[_.random(1,self.rooms.length-1)];
    stairx=_.random(stairRoom.left+1,stairRoom.right-1);
    stairy=_.random(stairRoom.top+1,stairRoom.bottom-1);
    self.getTile(stairx,stairy).stairs='d';
    addDoors();
  };
  
  addDoors=function(){
    var r,DTA,i,side,rooms=self.rooms,e=0,x,y;
    var dirs=['top','left','bottom','right'];
    for(r=0;r<rooms.length;r++){
      DTA=_.random(1,2);
      while(rooms[r].doors<DTA){
        e=0;
        side=_.random(0,3);
        if(!side||side==2){
          y=rooms[r][dirs[side]];
          x=_.random(rooms[r].left+1,rooms[r].right-1);
          for(i=x-1;i<=x+1;i++){
            if(self.getTile(i,y).door) e=1;
          }
        }
        else{
          x=rooms[r][dirs[side]];
          y=_.random(rooms[r].top+1,rooms[r].bottom-1);
          for(i=y-1;i<=y+1;i++){
            if(self.getTile(x,i).door) e=1;
          }
        }
        



        if(!e){
          self.setTile(x,y,'floor','floor1');
          self.getTile(x,y).door='c';
          rooms[r].doors++;
        }
      }
    }
  };

  self.nextFloor=function(){
      self.width=_.random(40,80);
      self.height=_.random(30,60);
      PC.X=_.random(6,self.width-6);
      PC.Y=_.random(6,self.height-6);
      self.level++;
      self.generateBoard();
  };

  self.setTrap=function(x,y){
    var square;
    if(!x) x=_.random(1,WORLD.width);
    if(!y) y=_.random(1,WORLD.height);
    square=self.getTile(x,y);
    if(square.type=='floor'&&!square.overlay&&!square.trap){
      self.getTile(x,y).trap=_.sample(self.traps);
      console.log('success');
      
    }
  };
  
  self.makeRiver=function(){
    var start,ud,w,rnd=0,x,y;
    ud=1;//_.random(0,1)
    w=_.random(7,10);
    start=_.random(3+w,self.width-8-w);
    if(ud) for(y=1;y<=self.height;y++){
      rnd+=_.random(-1,1);
      for(x=start;x<=start+(w-1);x++){
        if(x>start+(w-1)-2||x<start+2) self.setTile(x+rnd,y,'sand',0,0,1);
        else self.setTile(x+rnd,y,'water',0,0,1);
      }
    }
  };
};