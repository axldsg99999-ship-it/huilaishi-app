// Original nonverbal sound designs. Educational speech is never pitch shifted.
// Each species has an authored voice/material pair; no random roster inflation.
export const CREATURE_SOUND_PROFILES = {
 umbrella: ['bird','cloth',360,3], orchid:['insect','silk',640,2], tide:['water','paper',95,2],
 fox:['small','paper',290,2], tortoise:['low','wood',100,2], clock:['bell','gear',185,3],
 'tuk-gecko':['gecko','wood',370,2], 'wok-crab':['click','metal',160,3],
 'ferry-otter':['small','water',480,2], 'laundry-frog':['frog','water',165,3],
 'alarm-rooster':['rooster','bell',520,3], 'market-elephant':['trumpet','basket',125,2],
 'bus-lizard':['gecko','gear',300,3], 'karaoke-myna':['bird','bell',690,4],
 'station-macaque':['small','wood',420,3], 'thunder-elephant':['trumpet','drum',90,3],
 'backpack-buffalo':['low','cloth',75,2], 'debate-hornbill':['bird','paper',390,4],
 'passport-fox':['small','paper',330,3], 'printer-squid':['water','gear',240,3],
 'traffic-crane':['bird','wood',440,2], 'monitor-rabbit':['small','cloth',560,2],
 'seal-panda':['low','wood',155,2], 'rumor-moth':['insect','paper',820,3],
 'logic-pangolin':['click','paper',220,3], 'ink-peacock':['bird','silk',590,3],
 'puppet-macaque':['small','wood',355,4], 'porcelain-lion':['roar','ceramic',108,2],
 'clock-bear':['low','gear',82,3], 'twin-bell':['bell','bell',210,2],
 'campus-civet':['small','wood',260,3], 'campus-kite-marten':['small','paper',405,2],
 'campus-takraw-bear':['low','basket',115,3], 'campus-paper-carp':['water','paper',200,3],
};
export const CREATURE_EVENTS=['greet','attack','hit'];
export function creatureClip(id,event='greet'){
 if(!Object.hasOwn(CREATURE_SOUND_PROFILES,id)||!CREATURE_EVENTS.includes(event))return null;
 return new URL('./'+id+'-'+event+'.wav',import.meta.url).href;
}
