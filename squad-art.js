/* Canvas presentation only. All movement and impact timing follow the paused simulation clock. */
(function(root){
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const troopY=[145,192,231],positions={player:[75,196],enemy:[397,195],'troop-0':[213,145],'troop-1':[237,192],'troop-2':[213,231]};
 class Renderer{
  constructor(canvas){this.ctx=canvas.getContext('2d');this.states=new Map();this.effects=[];this.battle=null;this.cursor=0;this.reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;}
  state(id){if(!this.states.has(id))this.states.set(id,{});return this.states.get(id);}
  reset(){this.states.clear();this.effects=[];this.battle=null;this.cursor=0;}
  consume(session){const battle=session?.battle;if(battle!==this.battle){this.battle=battle;this.cursor=0;this.effects=[];}if(!battle)return;
   for(const e of battle.events.slice(this.cursor)){
    const at=e.time,source=e.actorId||'player',target=e.targetId||'enemy';
    if(['cast','troop-attack','captain-attack','enemy-attack','cleave'].includes(e.type)){this.state(source).attackAt=at;if(e.type!=='cast')this.effects.push({kind:e.type==='cleave'?'sweep':'strike',at,source,target,targets:e.targetIds});}
    if(e.type==='damage'&&e.damage>0){this.state(target).hitAt=at;this.effects.push({kind:'number',at,target,text:'−'+Math.ceil(e.damage),color:target==='enemy'?'#ffe2a8':'#ffc0aa'});}
    if(['troop-attack','captain-attack'].includes(e.type)&&e.damage>0){this.state('enemy').hitAt=at;this.effects.push({kind:'number',at,target:'enemy',text:'−'+Math.ceil(e.damage),color:'#ffe2a8'});}
    if(e.type==='damage'&&source!=='enemy'&&!e.secondary){this.state(source).attackAt=at;this.effects.push({kind:'strike',at,source,target});}
    // Primary hits already have a damage event; secondary ticks do too. Troop-hit is reserved for engine observers.
    if(e.type==='troop-down'){this.state(target).downAt=at;this.effects.push({kind:'down',at,target});}
    if(e.type==='death'){this.state('player').downAt=at;this.effects.push({kind:'down',at,target:'player'});}
    if(e.type==='troop-return'){this.state(target).returnAt=at;this.effects.push({kind:'return',at,target});}
    if(['heal','troop-heal'].includes(e.type)&&(e.healing||e.heal)>0)this.effects.push({kind:'heal',at,source,target,text:'+'+Math.ceil(e.healing||e.heal),color:'#a9edb8'});
    if(e.type==='shield'&&e.shield>0)this.effects.push({kind:'shield',at,target,text:'護盾',color:'#a9e5ff'});
    if(e.type==='shield-hit')this.effects.push({kind:'shield',at,target,text:'抵擋 '+Math.ceil(e.absorbed),color:'#a9e5ff'});
    if(e.type==='cleanse')this.effects.push({kind:'cleanse',at,target,text:'淨化',color:'#d9f9ef'});
    if(e.type==='freeze')this.effects.push({kind:'freeze',at,target,text:'凍結',color:'#b8e4ff'});
    if(e.type==='interrupt')this.effects.push({kind:'number',at,target,text:'中斷',color:'#f6d68d'});
   }
   this.cursor=battle.events.length;
  }
  person(id,x,y,color,type,unit,clock,travel){const c=this.ctx,state=this.state(id),attackAge=clock-(state.attackAt??-100),hitAge=clock-(state.hitAt??-100),returnAge=clock-(state.returnAt??-100),downAge=clock-(state.downAt??-100),alive=unit.hp>0,frozen=Object.values(unit.statuses||{}).some(s=>s.blocksAction&&s.expiresAt>clock),pulse=alive&&!frozen&&!this.reduced&&attackAge<.4?Math.sin(clamp(attackAge/.4)*Math.PI):0,bob=travel&&!this.reduced?Math.sin(clock*12)*2:0;
   c.save();c.translate(x+pulse*12,y+bob);
   if(!alive){c.translate(-8,17);c.rotate(this.reduced||id==='player'?-Math.PI/2:-Math.PI/2*clamp(downAge/.45));c.globalAlpha=.45;}else if(returnAge<.6&&!this.reduced){c.globalAlpha=.45+.55*clamp(returnAge/.6);c.translate(0,10*(1-clamp(returnAge/.6)));}
   c.fillStyle='#07171b80';c.beginPath();c.ellipse(0,22,23,7,0,0,Math.PI*2);c.fill();
   c.fillStyle=frozen?'#7baecb':hitAge<.15?'#ffe9ce':color;c.beginPath();c.moveTo(-13,-19);c.lineTo(-23,20);c.lineTo(18,20);c.lineTo(12,-20);c.closePath();c.fill();
   c.fillStyle='#1c3036';c.fillRect(-8,14,6,17);c.fillRect(5,14,6,17);c.fillStyle='#d3bd99';c.beginPath();c.arc(0,-23,8,0,Math.PI*2);c.fill();c.fillStyle=color;c.beginPath();c.arc(0,-26,10,Math.PI,Math.PI*2);c.lineTo(10,-19);c.lineTo(-10,-19);c.fill();
   c.save();c.translate(12,-5);c.rotate(-pulse*.9);c.strokeStyle='#e3d8b2';c.lineWidth=3;c.beginPath();if(type==='guard'){c.fillStyle='#abbcb0';c.moveTo(-35,-3);c.lineTo(-23,2);c.lineTo(-26,19);c.lineTo(-38,12);c.closePath();c.fill();}else if(type==='mender'){c.moveTo(9,-22);c.lineTo(9,29);c.stroke();c.fillStyle='#a5ddd2';c.beginPath();c.arc(9,-23,5,0,Math.PI*2);c.fill();}else{c.moveTo(5,10);c.lineTo(17,-21);c.stroke();}c.restore();c.restore();
   if(alive&&unit.shield>0){c.strokeStyle='#a2e1efaa';c.lineWidth=2;c.beginPath();c.ellipse(x,y-3,26,40,0,0,Math.PI*2);c.stroke();}
   if(alive&&unit.cast){c.strokeStyle='#d0bdf080';c.lineWidth=2;c.beginPath();c.ellipse(x,y+24,20+(this.reduced?0:Math.sin(clock*4)*3),7,0,0,Math.PI*2);c.stroke();}
   if(frozen){c.strokeStyle='#b9e6ff';c.lineWidth=2;c.beginPath();c.moveTo(x-25,y+22);c.lineTo(x-17,y-44);c.lineTo(x+12,y-48);c.lineTo(x+26,y+21);c.closePath();c.stroke();}
   if(!alive&&Number.isFinite(unit.reviveAt)){c.strokeStyle='#ad9d7d66';c.beginPath();c.arc(x,y+10,17,0,Math.PI*2);c.stroke();c.fillStyle='#d9c498';c.font='bold 14px system-ui';c.textAlign='center';c.fillText(Math.ceil(Math.max(0,unit.reviveAt-clock))+'s',x,y+15);c.textAlign='left';}
  }
  monster(x,y,w,clock,unit){const c=this.ctx,state=this.state('enemy'),hit=clock-(state.hitAt??-100)<.15,age=clock-(state.attackAt??-100),lunge=!this.reduced&&age<.4?Math.sin(clamp(age/.4)*Math.PI)*13:0;c.save();c.translate(x-lunge,y);c.scale(w.boss?1.4:1,w.boss?1.4:1);
   c.fillStyle='#06121877';c.beginPath();c.ellipse(0,30,40,8,0,0,Math.PI*2);c.fill();c.fillStyle=hit?'#fff1d0':w.sprite==='slime'?'#99b37f':w.sprite==='golem'?(w.boss?'#a48e76':'#809787'):w.sprite==='wolf'?'#839ba0':'#b0ac7d';
   if(w.sprite==='slime'){c.beginPath();c.ellipse(0,5,32,25,0,Math.PI,Math.PI*2);c.lineTo(32,29);c.lineTo(-32,29);c.fill();}else if(w.sprite==='golem'){c.fillRect(-28,-35,56,58);c.fillRect(-43,-20,16,47);c.fillRect(27,-20,16,47);c.fillRect(-22,20,17,20);c.fillRect(6,20,17,20);c.beginPath();c.moveTo(-20,-35);c.lineTo(-9,-50);c.lineTo(20,-43);c.lineTo(28,-35);c.fill();}else{c.beginPath();c.moveTo(-30,25);c.lineTo(-20,-21);c.lineTo(-18,-42);c.lineTo(-3,-27);c.lineTo(20,-31);c.lineTo(31,3);c.lineTo(22,27);c.fill();}
   c.fillStyle=w.boss?'#ffc27e':'#e9deaa';c.fillRect(-16,-10,7,4);c.fillRect(5,-10,7,4);c.restore();
   if(unit?.cast?.move?.squadTarget==='allFront'){c.strokeStyle='#e8af7488';c.setLineDash([6,7]);c.beginPath();c.moveTo(285,115);c.lineTo(285,250);c.stroke();c.setLineDash([]);}
  }
  render(session,draft,config){this.consume(session);const c=this.ctx,clock=session?.time||0,travel=session?.phase==='travel'&&!session.paused,offset=travel?(clock*35)%160:0;c.clearRect(0,0,480,300);const g=c.createLinearGradient(0,0,0,300);g.addColorStop(0,'#14262d');g.addColorStop(.7,'#304c43');g.addColorStop(1,'#102927');c.fillStyle=g;c.fillRect(0,0,480,300);
   c.fillStyle='#102a2b';for(let i=-1;i<5;i++){const x=i*160-offset;c.beginPath();c.moveTo(x-55,140);c.lineTo(x+5,20);c.lineTo(x+95,140);c.fill();c.fillRect(x+8,100,11,85);}c.fillStyle='#70827427';c.fillRect(0,180,480,80);
   c.strokeStyle='#a4ac7633';for(let i=0;i<9;i++){c.beginPath();c.moveTo(i*70-offset%70,226);c.lineTo(i*70+24-offset%70,226);c.stroke();}c.fillStyle='#d0d59366';for(let i=0;i<14;i++)c.fillRect((i*97)%480,80+(i*23)%120+(this.reduced?0:Math.sin(clock/1.3+i)*4),1.5,1.5);
   const captain=session?.battle?.player||session?.captain||{hp:1};this.person('player',75,196,'#74939b','captain',captain,clock,travel);c.fillStyle='#c5d2c1';c.font='12px system-ui';c.fillText('隊長',62,246);
   const troops=session?session.troops:(draft.troops||[]).map((type,i)=>({id:'troop-'+i,hp:1,maxHp:1,type,row:'front',slot:i}));
   for(const [i,t]of troops.entries()){const d=config.troops[t.type],slot=t.slot??i,x=t.row==='back'?160:250,y=troopY[slot];positions[t.id]=[x,y];this.person(t.id,x,y,d.color,t.type,t,clock,travel);c.fillStyle='#081521cc';c.fillRect(x-23,y-54,46,4);c.fillStyle=t.hp>0?'#a5c1a3':'#987f69';c.fillRect(x-23,y-54,46*clamp(t.hp/(t.maxHp||1)),4);if(t.cast){c.fillStyle='#0a1520';c.fillRect(x-23,y-47,46,3);c.fillStyle='#ceb9e5';c.fillRect(x-23,y-47,46*clamp((clock-t.cast.startedAt)/t.cast.duration),3);}}
   const w=session?.encounter()||config.waves[0],approach=travel?Math.max(0,session.travelLeft/config.travelSeconds)*130:0;this.monster(397+approach,195,w,clock,session?.battle?.enemy);
   this.effects=this.effects.filter(e=>clock-e.at<1.1);
   for(const e of this.effects){const age=Math.max(0,clock-e.at),p=positions[e.target]||positions.enemy,from=positions[e.source]||positions.player;c.save();c.globalAlpha=clamp(1-age/1.1);
    if(e.kind==='strike'&&age<.3){c.strokeStyle=e.source==='enemy'?'#ecb299':'#ffe0a0';c.lineWidth=2.5;c.beginPath();c.moveTo(p[0]-16,p[1]+8);c.lineTo(p[0]+16,p[1]-22);c.stroke();}
    else if(e.kind==='sweep'&&age<.45){c.strokeStyle='#f0bd85';c.lineWidth=4;c.beginPath();c.ellipse(250,184,35,75,0,-Math.PI/2,Math.PI/2);c.stroke();}
    else if(['heal','shield','cleanse','return','freeze'].includes(e.kind)){c.strokeStyle=e.color||'#e8f4d3';c.lineWidth=2;c.beginPath();c.ellipse(p[0],p[1],24+(this.reduced?0:age*12),32+(this.reduced?0:age*8),0,0,Math.PI*2);c.stroke();if(e.kind==='heal'&&!this.reduced&&age<.3){c.strokeStyle='#a6e8b688';c.beginPath();c.moveTo(from[0],from[1]-20);c.lineTo(p[0],p[1]-20);c.stroke();}}
    if(e.text){c.fillStyle=e.color||'#e8e8cc';c.font='bold 16px system-ui';c.textAlign='center';c.fillText(e.text,p[0],p[1]-40-(this.reduced?0:age*20));}c.restore();
   }c.textAlign='left';
  }
 }
 root.SquadArt={Renderer};if(typeof module!=='undefined')module.exports=root.SquadArt;
})(globalThis);
