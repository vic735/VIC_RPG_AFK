/* Permanent member growth, independent of the captain's run and resource economy. */
(function(root){
 const rarities={
  C:{base:1,regularAt:48,plusAt:144},
  B:{base:1.3,regularAt:72,plusAt:216},
  A:{base:1.65,regularAt:96,plusAt:288},
  S:{base:2.05,regularAt:144,plusAt:432},
  SS:{base:2.5,regularAt:192,plusAt:576}
 };
 const rules={rarities,rewards:{normal:6,boss:18},growth:{hp:.4,attack:.3,heal:.3,speed:.12}};
 function validate(member){if(!member||typeof member.id!=='string'||!/^member-\d+$/.test(member.id)||!rarities[member.rarity]||!Number.isSafeInteger(member.training)||member.training<0||member.training>rarities[member.rarity].plusAt)throw Error('隊員培養存檔無效');return member;}
 function create(id,type,rarity='C'){return validate({id,type,rarity,training:0});}
 function stage(member){validate(member);const r=rarities[member.rarity];return member.training>=r.plusAt?2:member.training>=r.regularAt?1:0;}
 function grade(member){return member.rarity+['−','','＋'][stage(member)];}
 function progress(member){const s=stage(member),r=rarities[member.rarity],from=s===0?0:r.regularAt,to=s===0?r.regularAt:r.plusAt;return {grade:grade(member),next:s===2?null:member.rarity+['','＋'][s],current:s===2?0:member.training-from,required:s===2?0:to-from,ratio:s===2?1:(member.training-from)/(to-from)};}
 function stats(member,base){validate(member);const r=rarities[member.rarity],p=member.training/r.plusAt,g=rules.growth;return {hp:Math.round(base.hp*r.base*(1+g.hp*p)),attack:Math.round(base.attack*r.base*(1+g.attack*p)*10)/10,heal:Math.round((base.heal||0)*r.base*(1+g.heal*p)*10)/10,interval:base.interval/(1+g.speed*p)};}
 function train(member,amount){validate(member);if(!Number.isSafeInteger(amount)||amount<0)throw Error('培養經驗無效');const before=grade(member),old=member.training;member.training=Math.min(rarities[member.rarity].plusAt,old+amount);return {gained:member.training-old,before,after:grade(member)};}
 const api={rules,create,validate,stage,grade,progress,stats,train};if(typeof module!=='undefined')module.exports=api;else root.SquadMembers=api;
})(globalThis);
