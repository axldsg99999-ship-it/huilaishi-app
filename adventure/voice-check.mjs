// Separate diagnostics channel: a permission dialog never starts recording by itself.
let listener=null,token=null;
export const nativeDiagnosticsAvailable=()=>Boolean(globalThis.XulongVoiceDiagnostics?.postMessage);
export function diagnostics(action,{language='th-TH',allowNetwork=false,onEvent=()=>{}}={}){
 if(!nativeDiagnosticsAvailable()){onEvent({status:'unavailable',platform:globalThis.HuilaishiNative?'native':'web',secure:globalThis.isSecureContext===true});return false}
 if(listener!==onEvent){listener=onEvent;token='check-'+Date.now()+'-'+Math.floor(Math.random()*1e6)}
 XulongVoiceDiagnostics.onmessage=event=>{let data;try{data=JSON.parse(event.data)}catch{return}if(data.id===token)listener?.(data)};
 XulongVoiceDiagnostics.postMessage(JSON.stringify({id:token,action,lang:language,allowNetwork}));return true;
}
export function closeDiagnostics(){
 if(nativeDiagnosticsAvailable()&&token)XulongVoiceDiagnostics.postMessage(JSON.stringify({id:token,action:'close'}));
 if(globalThis.XulongVoiceDiagnostics)XulongVoiceDiagnostics.onmessage=null;
 listener=null;token=null;
}
