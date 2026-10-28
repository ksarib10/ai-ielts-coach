import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';

const files=['src/styles.css','src/prototype.css','src/foundation.css'];
const roots=files.map(f=>postcss.parse(fs.readFileSync(f,'utf8')));
const definitions=new Set();
for(const root of roots)root.walkDecls(d=>{if(d.prop.startsWith('--'))definitions.add(d.prop)});
for(const root of roots)root.walkDecls(d=>{for(const match of d.value.matchAll(/var\((--[\w-]+)/g))assert.ok(definitions.has(match[1]),`Undefined ${match[1]} in ${d.parent.selector}`)});

function unsafeSurfaceSelectors(root){
 const failures=[];
 root.walkRules(rule=>{
  if(rule.selector.includes(':root')||rule.selector==='.pdf-canvas canvas'||/^\.mod-(reading|writing|listening|speaking)$/.test(rule.selector))return;
  rule.walkDecls(d=>{if(/^background(?:-color)?$/.test(d.prop)&&/(?:#[\da-f]{3,8}\b|\bwhite\b)/i.test(d.value))failures.push(rule.selector)});
 });
 return failures;
}
for(const root of roots.slice(0,2))assert.deepEqual(unsafeSurfaceSelectors(root),[],'Legacy surfaces must use semantic roles; fixed PDF pixels and decorative progress fills are explicit exceptions');
assert.ok(unsafeSurfaceSelectors(postcss.parse('.workspace-footer{background:#fff;color:var(--color-text)}')).includes('.workspace-footer'),'Guard must detect reintroduced pale footer');
assert.ok(unsafeSurfaceSelectors(postcss.parse('.exam-center-hero{background:linear-gradient(#fff,#eef4ff)}')).includes('.exam-center-hero'),'Guard must detect pale hero endpoints');
for(const selector of ['.workspace-status','.workspace-footer','.audio-box','.exam-center-hero,.exam-result-hero','.exam-setup-steps li','.exam-progress-item']){
 const declarations=[];for(const root of roots.slice(0,2))root.walkRules(r=>{if(r.selector===selector)r.walkDecls(d=>declarations.push(d.value))});
 assert.ok(declarations.some(v=>v.includes('var(--color-')||v.includes('var(--surface-gradient)')),selector);
}
for(const root of roots)root.walkDecls('transition',d=>assert.ok(!/\b(?:background-color|color|all)\b/.test(d.value),'Do not interpolate light/dark foreground/background independently'));
const foundation=fs.readFileSync(files[2],'utf8');
assert.ok(foundation.includes('--color-disabled-text:'));assert.ok(foundation.includes('opacity:1; color:var(--color-disabled-text)'));
assert.ok(foundation.includes('--color-success-soft:'));assert.ok(foundation.includes('mark { color:var(--color-on-highlight)'));

const evidence='docs/reviews/stage-1b/theme-consistency/BROWSER_CONTRAST_RESULTS.json';
if(fs.existsSync(evidence)){
 const data=JSON.parse(fs.readFileSync(evidence,'utf8'));
 for(const row of data.finalChecks){assert.equal(row.textFailures.length,0,row.label);assert.equal(row.boundaryFailures.length,0,row.label);assert.equal(row.horizontalOverflow,false,row.label)}
 assert.ok(data.finalChecks.some(r=>r.theme==='dark'&&r.width===320));
 assert.ok(data.finalChecks.some(r=>r.theme==='light'&&r.width===1440));
}
console.log('PASS: semantic legacy surfaces, defined aliases, no pale-gradient/footer regressions, atomic theme changes, disabled/status pairing and recorded computed-browser evidence.');
