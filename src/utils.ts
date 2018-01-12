// src/utils.ts
import { Big } from 'big.js';

export function castNumber(value: string) {
    // TODO: Make this more strict for cases like "20 ducks"
    // isNaN(+a) ? a : +a;
    // var num = Number(value);
    // if(num === NaN) {return value}
    // return num;
    try {
        return Big(value)
    } catch(err){
        console.log("Cast error");
        console.log(err);
        // Error: [big.js] Invalid number
    }
}

export function castBoolean(value: string) {
    // TODO: Case sensitivity?
    if(value === 'true') return true;
    return false;
}

export function generate_random_id(){
    // Source: S/O 105034 - Broofa
    // TODO: Replace with a more rigorous UID
    return 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}