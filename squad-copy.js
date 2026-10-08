/* Squad-only wording. Stable IDs, costs and combat values are retained. */
(function(root){
 const elements={metal:'金',wood:'木',water:'水',fire:'火',earth:'土',light:'光',dark:'闇'},syllables={metal:'真',wood:'艾',water:'雅',fire:'伯',earth:'卓',light:'麗',dark:'布'};
 const pct=n=>Math.round(n*10000)/100;
 const names={M077:'藤刺射擊',RANGER_MOVE_002:'疾風射擊',M087:'焰落',M090:'震地擊',M100:'衰弱之幕'};
 const magicNames={CLERIC_MOVE_001:'森・麗・法',CLERIC_MOVE_003:'森・麗・維爾',SPELLSWORD_MOVE_002:'莉亞・迪法',spark:'參倫・希卡',nova:'森・麗・尤倫',inferno:'阿・伯・烏',pure_mana_cannon:'森・莉亞・陸',bog_spore:'艾・諾亞',M074:'真・拉卡',M075:'參倫・希',M076:'真・莉森',M077:'艾・希迪',M078:'艾・阿諾',M079:'帕咔申・莉',M080:'艾・艾妮司',M082:'雅・諾姆',M083:'希・拉卡',M084:'雅・尤倫',M086:'伯・倫司',M087:'伯・羅尤',M091:'卓・維爾',M092:'卓・拉卡',M093:'麗・菲亞',M094:'麗・莉森',M095:'麗・希',M096:'森・艾妮司',M097:'布・諾德',M098:'布・莉',M099:'布・艾妮司',M100:'布・諾維亞',std_metal_orb:'參倫・烏',std_metal_strong_bullet:'阿・參倫・德',std_wood_orb:'艾・烏',std_wood_beam:'艾・陸',std_wood_strong_bullet:'阿・艾・德',std_water_bullet:'希・帕德',std_water_orb:'希・烏',std_water_beam:'希・陸',std_water_strong_bullet:'阿・希・德',std_fire_protection:'伯・維爾',std_earth_orb:'卓・森烏',std_earth_beam:'卓・陸',std_light_strong_bullet:'阿・麗・德',std_dark_strong_bullet:'阿・布・德',MAGE_MOVE_001:'莉亞・森陸',MAGE_MOVE_002:'莉亞・阿尤',MAGE_MOVE_003:'雅・伯・尤倫',CLERIC_MOVE_002:'麗・艾諾'};
 const text={vitality:'最大 HP 提高 15%。',endurance:'最大 SP 提高 15%；僅隊長適用。',mana_boost:'最大 MP 提高 15%；僅隊長適用。',swift:'基礎速度提高 12%。',fortunate:'基礎運氣提高 12%。',life_growth:'本局每次升級獲得的 HP 增量提高 35%。',training:'本局每次升級獲得的 SP 增量提高 35%；僅隊長適用。',mana_talent:'本局每次升級獲得的 MP 增量提高 35%；僅隊長適用。',speed_growth:'本局每次升級獲得的速度增量提高 30%。',destiny:'本局每次升級獲得的運氣增量提高 30%。',lucky:'運氣 +8，提高爆擊機率、爆擊傷害與閃避率。',diligence:'隊長獲得的戰鬥經驗提高 12%；不增加隊員經驗。',veteran:'依本局傷勢提高傷害；目前小隊遠征沒有傷勢系統，此技能尚無作用。'};
 function effect(e,m){
  if(e.type==='status'){const s=e.status,bits=[];for(const a of s.modifiers||[]){const n=a.op==='add'?Math.abs(a.value):pct(Math.abs(a.value-1));if(a.stage==='agility')bits.push('速度'+(a.value>=1?'提高':'降低')+' '+n+'%');else if(['critChance','dodgeChance'].includes(a.stage))bits.push((a.stage==='critChance'?'爆擊':'閃避')+'率提高 '+pct(a.value)+' 個百分點');else if(a.stage==='incoming')bits.push('受到傷害降低 '+n+'%');else if(a.stage==='accuracy')bits.push('命中率降低 '+n+'%');else if(a.stage==='damage'||a.stage==='healing')bits.push((a.stage==='damage'?'傷害':'治療量')+'提高 '+n+'%');}
   if(s.tick)bits.push('每 '+s.tick.interval+' 秒造成施放者'+(m.damageType==='physical'?'攻擊力':'魔法攻擊力')+' '+pct(s.tick.ratio)+'% 的持續傷害（隊員使用攻擊力）');
   return (s.target==='self'?'自身獲得':'使目前敵人陷入')+'「'+s.name+'」'+s.duration+' 秒'+(bits.length?'：'+bits.join('、'):'')+'；同狀態不疊加，重施刷新時間';}
  if(e.type==='heal')return '恢復施放者自身最大 HP 的 '+pct(e.ratio)+'%';
  if(e.type==='shield')return '施放者獲得自身最大 HP '+pct(e.ratio)+'% 的護盾；同招重施補至上限，不疊加，倒下或本場戰鬥結束時消失';
  if(e.type==='cleanse')return '移除施放者自身的負面狀態，不移除增益';
  if(e.type==='interrupt')return '嘗試取消目前敵人的讀條'+(e.chance<1?'，基礎成功率 '+pct(e.chance)+'%':'')+'（可受技能與防護影響）';
  if(e.type==='freeze')return '目前敵人凍結 '+e.duration+' 秒；Boss 時間減半，凍結結束後 3 秒內不會再次凍結';
  if(e.type==='drain')return '依本招實際傷害的 '+pct(e.ratio)+'% 恢復施放者自身 HP';
  if(e.type==='restore')return '恢復施放者自身 '+e.amount+' '+(e.resource==='mana'?'MP':'SP')+'；隊員沒有此資源';
  return '';
 }
 function apply(D){
  for(const [id,m]of Object.entries(D.moves)){
   if(names[id]){m.name=names[id];m.subtitle=names[id];m.localizedName=names[id];m.magicText='';}
   let local=m.localizedName||m.subtitle||m.name;
   if(id==='mana_bolt')local='魔力彈';if(id==='lesser_heal')local='初階治癒術';
   const magical=['magic','buff','defense','heal'].includes(m.damageType);
   if(magical){let magic=magicNames[id]||(m.magicText&&m.magicText!==local?m.magicText:m.name!==local?m.name:null);if(!magic){const stem=(m.elements||[]).map(x=>syllables[x]).filter(Boolean).join('・')||'莉亞';const form=m.squadSupport?null:(m.effects||[]).some(e=>e.type==='heal')?'艾妮司':(m.effects||[]).some(e=>e.type==='shield')?'倫司吧':(m.effects||[]).some(e=>e.type==='status'||e.type==='cleanse')?'法':/箭|射/.test(local)?'迪':/球/.test(local)?'烏':/束|砲/.test(local)?'陸':'德';magic=stem+'・'+(form||'法');}
    m.name=magic;m.magicText=magic;m.subtitle=local;m.localizedName=local;
   }else if(m.subtitle===m.name)m.subtitle='';
   if(m.squadSupport)continue;
   const descriptions=[];
   if(m.multiplier>0){descriptions.push('對目前一名敵人造成'+(m.elements||[]).map(x=>elements[x]).join('／')+(m.damageType==='physical'?'物理':'魔法')+'傷害，威力倍率 ×'+m.multiplier+(m.hits>1?'，分 '+m.hits+' 次命中':'，單次命中')+'。');}
   descriptions.push(...(m.effects||[]).map(e=>effect(e,m)).filter(Boolean).map(x=>x+'。'));
   if(descriptions.length)m.description=descriptions.join('');
  }
  for(const [id,s]of Object.entries(D.skills)){if(text[id])s.description=text[id];s.description=(s.description||'').replace(/敏捷/g,'速度').replace(/Debuff/g,'負面狀態').replace(/Buff/g,'增益');if(id.endsWith('_immunity'))s.name=elements[id.split('_')[1]]+'之強抗性';}
  return D;
 }
 apply.effect=effect;if(typeof module!=='undefined')module.exports=apply;else root.SquadCopy=apply;
})(globalThis);
