import {creatureClip} from './catalog.mjs';
let current=null,serial=0,muted=false;
export function stopCreatureAudio(){
 serial++;
 if(current){current.pause();current.removeAttribute('src');current.load();current=null;}
}
export function muteCreatureAudio(value){muted=!!value;if(muted)stopCreatureAudio();}
export async function playCreatureAudio(id,event='greet'){
 const src=creatureClip(id,event);
 if(!src||muted||typeof Audio==='undefined'||document.hidden)return false;
 stopCreatureAudio();const token=serial;
 const audio=new Audio(src);current=audio;audio.volume=event==='attack'?.3:.24;
 const release=()=>{if(token===serial&&current===audio){current=null;audio.removeAttribute('src');audio.load();}};
 audio.onended=release;audio.onerror=release;
 try{await audio.play();return token===serial;}catch{release();return false;}
}
