import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,PRESETS,applyPreset,matchesPreset,sheet} from '../assets/state.mjs';
test('preset identity follows task content, order and completion across modes/scales',()=>{
  for(const scale of ['clock','days'])for(const p of PRESETS){
    const state=initialState();state.scale=scale;
    assert.equal(matchesPreset(state,p),false);applyPreset(state,p);
    assert.equal(matchesPreset(state,p),true);
    const t=sheet(state).tasks[0];t.id='other-id';assert.equal(matchesPreset(state,p),true);
    t.name+='変更';assert.equal(matchesPreset(state,p),false);t.name=p[scale][0][0];
    t.minutes++;assert.equal(matchesPreset(state,p),false);t.minutes--;
    t.done=true;assert.equal(matchesPreset(state,p),false);t.done=false;
    sheet(state).tasks.reverse();assert.equal(matchesPreset(state,p),false);
  }
});
