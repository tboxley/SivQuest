var x,profs = {
  //wz:{fName:"Wizard"      ,hp:-4, str:-8,def:-7,ints:+5,spd:+1,staff:1,dagger:1,wand:1,sword:0,shield:0,magic:1,axe:0,light:1,medium:1,heavy:0,desc:"Really good at magic. Really not good at not dying."},
  kt:{fName:"Knight"      ,hp:+7,str:+4,def:+4,ints:-3,spd:-5,staff:0,dagger:1,wand:0,sword:1,shield:1,magic:0,axe:1,light:0,medium:0,heavy:1,desc:"A knight with armor and stuff. May sink like a stone."},
  //bd:{fName:"Bard"        ,hp:+6, str:+3,def:+3,ints:+3,spd:+3,staff:1,dagger:1,wand:1,sword:1,shield:1,magic:1,axe:1,light:1,medium:1,heavy:1,desc:"Jack of all trades, master of none. Plays crappy music."},
  //nj:{fName:"Ninja"       ,hp:+0, str:+0,def:-4,ints:+1,spd:+8,staff:0,dagger:1,wand:0,sword:1,shield:0,magic:0,axe:0,light:1,medium:0,heavy:0,desc:"Master of stealth and shadowiness. You won't see %h com- *snap*"},
  //jr:{fName:"Jester"      ,hp:+4, str:+1,def:+1,ints:-3,spd:+2,staff:0,dagger:1,wand:1,sword:0,shield:0,magic:1,axe:0,light:1,medium:1,heavy:0,desc:"Dances around like a fairy. A fairy with a funny hat and pie."},
  //fr:{fName:"Farmer"      ,hp:+6, str:+2,def:+2,ints:-2,spd:+1,staff:0,dagger:0,wand:0,sword:0,shield:0,magic:0,axe:1,light:0,medium:1,heavy:1,desc:"Grows plants and kicks ass. And %g's all out of seeds."},
  //ne:{fName:"Necromancer" ,hp:-3, str:-3,def:-3,ints:+2,spd:+3,staff:1,dagger:1,wand:1,sword:0,shield:0,magic:1,axe:0,light:1,medium:1,heavy:0,desc:"Brings back dead things."},
},

races = {
  hm:{fName:"Human"   ,hp:+1,str:+1,def:+1,ints:+1,spd:+1,desc:"Boring and standard."},
  he:{fName:"High Elf",hp:-4,str:-2,def:-2,ints:+4,spd:+3,desc:"Noble and quick. High Elven wizards get a bonus to dying."},
  dw:{fName:"Dwarf",hp:+2,str:+3,def:+2,ints:-4,spd:-3,desc:"Short and angry."},
},rlist=[],plist=[];

for(x in profs){
  plist.push(x);
}

for(x in races){
  rlist.push(x);
}