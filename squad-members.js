/* Permanent cultivation is separate from the run's hidden member level. */
(function(root){
 const rarities={C:{base:1,regularAt:48,plusAt:144},B:{base:1.3,regularAt:72,plusAt:216},A:{base:1.65,regularAt:96,plusAt:288},S:{base:2.05,regularAt:144,plusAt:432},SS:{base:2.5,regularAt:192,plusAt:576}};
 const grades=Object.keys(rarities),rules={rarities,rewards:{normal:6,boss:18},growth:{hp:.4,attack:.3,heal:.3,speed:.12},cultivation:{duplicateFragments:5,costs:[5,10,20,30]}};
 const step=member=>member.permanentStep??0;
 const cap=member=>member.rarity==='SS'?2:4;
 const currentRarity=member=>grades[grades.indexOf(member.rarity)+(step(member)>=3?1:0)];
 const startLevel=member=>[0,5,10,0,5][step(member)];
 const threshold=(r,lv)=>lv<=5?Math.ceil(r.regularAt*lv/5):r.regularAt+Math.ceil((r.plusAt-r.regularAt)*(lv-5)/5);
 const startTraining=member=>threshold(rarities[currentRarity(member)],startLevel(member));
 function validate(member){if(!member||typeof member.id!=='string'||!/^member-\d+$/.test(member.id)||!rarities[member.rarity]||!Number.isInteger(step(member))||step(member)<0||step(member)>cap(member)||!Number.isSafeInteger(member.training)||member.training<startTraining(member)||member.training>rarities[currentRarity(member)].plusAt)throw Error('隊員培養存檔無效');return member;}
 function create(id,type,rarity='C'){return validate({id,type,rarity,permanentStep:0,training:0});}
 function level(member){validate(member);const r=rarities[currentRarity(member)];let lv=0;for(let i=1;i<=10;i++)if(member.training>=threshold(r,i))lv=i;return lv;}
 function stage(member){validate(member);const r=rarities[currentRarity(member)];return member.training>=r.plusAt?2:member.training>=r.regularAt?1:0;}
 function grade(member){return currentRarity(member)+['−','','＋'][stage(member)];}
 function permanentGrade(member){return currentRarity(member)+['−','','＋'][[0,1,2,0,1][step(member)]];}
 function progress(member){const s=stage(member),r=rarities[currentRarity(member)],from=s===0?0:r.regularAt,to=s===0?r.regularAt:r.plusAt;return {grade:grade(member),next:s===2?null:currentRarity(member)+['','＋'][s],current:s===2?0:member.training-from,required:s===2?0:to-from,ratio:s===2?1:(member.training-from)/(to-from)};}
 function cultivation(member){validate(member);const n=step(member),max=cap(member),gradeNow=permanentGrade(member);return {step:n,max,grade:gradeNow,next:n<max?permanentGrade({...member,permanentStep:n+1}):null,fragmentGrade:currentRarity(member),cost:n<max?rules.cultivation.costs[n]:0,startLevel:startLevel(member)};}
 function reset(member){member.training=startTraining(member);return validate(member);}
 function cultivate(member){const info=cultivation(member);if(!info.next)throw Error('永久培養已達上限');member.permanentStep=step(member)+1;reset(member);return {...info,after:permanentGrade(member)};}
 const round=(value,scale=1)=>Math.round(value*scale+Number.EPSILON*Math.abs(value*scale)*2)/scale;
 function stats(member,base,skills=[]){validate(member);const r=rarities[currentRarity(member)],original=rarities[member.rarity],crossed=step(member)>=3,lv=level(member),p=lv/10,initial=startLevel(member)/10,g=rules.growth,apply=(key,b,permanent,increase)=>{const flat=skills.reduce((n,s)=>n+(s.modifiers?.[key]||0),0),gr=skills.reduce((n,s)=>n+(s.growthRates?.[key]||0),0),br=skills.filter(s=>s.baseOnly).reduce((n,s)=>n+(s.statRates?.[key]||0),0),tr=skills.filter(s=>!s.baseOnly).reduce((n,s)=>n+(s.statRates?.[key]||0),0);return (b*(1+br)+flat+permanent+increase*(1+gr))*(1+tr);};
  // Carry the completed prior tier forward; crossing a tier cannot reduce stats.
  const basis=key=>crossed?Math.max(r.base,original.base*(1+g[key])):r.base,rawSpeed=100/base.interval,speed=apply('agility',rawSpeed,rawSpeed*g.speed*(initial+(crossed?1:0)),rawSpeed*g.speed*(p-initial)),hpBase=base.hp*basis('hp'),attackBase=base.attack*basis('attack'),healBase=(base.heal||0)*basis('heal');
  return {speed,luck:apply('luck',base.luck||0,startLevel(member)*.2+(crossed?2:0),(lv-startLevel(member))*.2),hp:round(apply('hp',hpBase,base.hp*r.base*g.hp*initial,base.hp*r.base*g.hp*(p-initial))),attack:round(apply('attack',attackBase,base.attack*r.base*g.attack*initial,base.attack*r.base*g.attack*(p-initial)),10),heal:round(apply('healing',healBase,(base.heal||0)*r.base*g.heal*initial,(base.heal||0)*r.base*g.heal*(p-initial)),10),interval:100/speed};
 }
 function train(member,amount){validate(member);if(!Number.isSafeInteger(amount)||amount<0)throw Error('培養經驗無效');const before=grade(member),beforeLevel=level(member),old=member.training;member.training=Math.min(rarities[currentRarity(member)].plusAt,old+amount);return {gained:member.training-old,before,after:grade(member),beforeLevel,afterLevel:level(member)};}
 const api={rules,create,validate,level,stage,grade,permanentGrade,currentRarity,startLevel,startTraining,progress,stats,train,cultivation,cultivate,reset};if(typeof module!=='undefined')module.exports=api;else root.SquadMembers=api;
})(globalThis);
