/* Squad-only presentation: native SVG, no adventure UI or external assets. */
(function(root){
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths={
  sword:'<path d="m6 18 12-12 2-2v6L8 22M4 16l6 6M3 23l3-3"/>',
  shield:'<path d="m12 2 9 4v7c0 5-5 8-9 10-4-2-9-5-9-10V6z"/><path d="M12 6v12M7 11h10"/>',
  flame:'<path d="M13 2c2 6-3 6-2 10 2-1 4-3 4-5 5 4 7 9 3 13-3 3-9 3-12-1C2 14 6 9 9 6c-1 4 1 5 2 5-1-3 1-6 2-9Z"/>',
  bolt:'<path d="m14 2-10 12h7l-1 9 10-13h-7Z"/>',
  heart:'<path d="M12 21 3 12C-2 6 6 0 12 7c6-7 14-1 9 5Z"/>',
  star:'<path d="m12 2 3 7 8 3-8 3-3 8-3-8-8-3 8-3Z"/>',
  staff:'<path d="m6 23 9-15m-4-2 4-5 5 4-4 5Z"/>',
  party:'<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M3 10a3 3 0 0 0 0 6m18-6a3 3 0 0 1 0 6M1 22v-3m22 3v-3"/>',
  bag:'<path d="m8 7-2-4h12l-2 4c2 4 6 6 6 11 0 4-20 4-20 0 0-5 4-7 6-11ZM7 8h10"/><path d="M12 12v7m-2-5h4"/>',
  coin:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="7"/><path d="M10 8h4m-2 0v8m-2 0h4"/>',
  gear:'<path d="m9 2-1 4-4 1-2 4 3 3-1 4 4 3 4-1 4 1 4-3-1-4 3-3-2-4-4-1-1-4Z"/><circle cx="12" cy="12" r="4"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  route:'<circle cx="5" cy="19" r="3"/><circle cx="19" cy="5" r="3"/><path d="M8 19h7c7 0 7-9 0-9H9C2 10 2 5 8 5h8"/>',
  crown:'<path d="m2 7 5 4 5-7 5 7 5-4-3 13H5ZM6 23h12"/>',
  book:'<path d="M12 5c-3-2-7-2-10-1v17c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v17M5 8h3m-3 4h3m8-4h3m-3 4h3"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  pause:'<path d="M8 4v16M16 4v16"/>',
  play:'<path d="m8 3 12 9-12 9Z"/>',
  check:'<path d="m4 12 5 5L20 6"/>'
 };
 function icon(name){return `<svg class="ui-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.star}</svg>`;}
 function portrait(type,grade='C−'){
  const colors={guard:['#739baf','#bddbe0'],striker:['#a9815a','#efc587'],mender:['#659ca1','#b5dfd1'],captain:['#718aab','#d5c49e']},[base,light]=colors[type]||colors.captain;
  const hair=type==='mender'?'<path d="M27 37c-1-26 48-26 45 0l-7 17-2-24-23-4-8 25Z" fill="#b5c3c6"/>':'<path d="M28 32c1-22 43-26 45 3L54 21 32 42Z" fill="#2a3344"/>';
  const accessory=type==='guard'?`<path d="m18 48 29 8-4 33-24-13Z" fill="${light}" stroke="#354d67" stroke-width="3"/><path d="M31 58v16m-6-9h13" stroke="${base}" stroke-width="2"/>`:type==='mender'?'<path d="m77 87 1-52" stroke="#d0bb83" stroke-width="4"/><path d="m77 24 8 9-8 9-8-9Z" fill="#a1f0dc"/>':'<path d="m73 84 12-48 5-13 3 15-14 48Z" fill="#e2d6b1"/><path d="m68 73 19 5" stroke="#967141" stroke-width="4"/>';
  return `<svg class="member-portrait" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="16" fill="#132437"/><path d="m4 81 39-73 52 87" fill="${base}" opacity=".16"/><circle cx="52" cy="38" r="23" fill="${light}" opacity=".09"/><path d="M17 101 28 59l23-8 24 9 13 41" fill="${base}"/><path d="m37 58 14 32 17-31-16 7Z" fill="#1a2d3a"/><path d="M44 43h16v21l-8 6-8-5" fill="#c7a486"/><ellipse cx="51" cy="36" rx="18" ry="22" fill="#d4b297"/>${hair}<path d="m40 39 6-1m12 0 5 1" stroke="#38475a" stroke-width="2"/><path d="m48 51 8 0" stroke="#a37764" stroke-width="1.5"/>${accessory}<path d="M1 99h98" stroke="${light}" stroke-width="3"/></svg>`;
 }
 const landscape=()=>`<svg class="camp-landscape" viewBox="0 0 420 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="camp-sky" x2="0" y2="1"><stop stop-color="#263551"/><stop offset="1" stop-color="#102b36"/></linearGradient></defs><rect width="420" height="360" fill="url(#camp-sky)"/><circle cx="300" cy="82" r="40" fill="#a2c1ce" opacity=".1"/><circle cx="300" cy="82" r="26" fill="#b2d5df" opacity=".25"/><path d="M-20 235 80 117l80 77 85-56 129 117 66-95 30 200H0" fill="#17283a"/><path d="M0 286 117 201l142 72 90-63 90 47v103H0" fill="#112330"/><g fill="#0b1b26"><path d="m19 167-53 125h105Zm71 35-48 110h96Zm250-37-65 147h130Zm71 62-62 120h124Z"/></g><path d="M180 360c-45-54-24-84 43-116-16 45-24 65 21 116" fill="#7195a0" opacity=".12"/><g fill="#edce88" opacity=".65"><circle cx="167" cy="292" r="2"/><circle cx="234" cy="256" r="1.5"/><circle cx="286" cy="314" r="2"/><circle cx="77" cy="250" r="1"/></g></svg>`;
 const cost=move=>Object.entries(move.cost||{}).map(([k,v])=>`${v} ${k==='mana'?'MP':'SP'}`).join(' · ')||'無消耗';
 const effects=move=>(move.effects||[]).map(e=>e.type==='freeze'?`凍結：暫停行動 ${e.duration} 秒，Boss 減半；結束後 3 秒內不會再次凍結`:e.type==='drain'?`吸魂：回復實際傷害 ${e.ratio*100}% 的 HP`:e.type==='shield'?`護盾：吸收相當於最大 HP ${e.ratio*100}% 的傷害`:e.type==='cleanse'?'淨化：移除戰鬥中的負面狀態':e.type==='interrupt'?'中斷：命中時取消敵方目前讀條':e.type==='restore'?`恢復：回復 ${e.amount} ${e.resource==='stamina'?'SP':'MP'}`:e.type==='status'?`${e.status.name}：持續 ${e.status.duration} 秒（刷新時間，不重複疊加）`:e.type==='heal'?`治療：回復最大 HP ${e.ratio*100}%`:e.type).join('；')||'直接傷害：不會中斷敵方讀條';
 const api={escape,icon,portrait,landscape,cost,effects};if(typeof module!=='undefined')module.exports=api;else root.SquadPresentation=api;
})(globalThis);
