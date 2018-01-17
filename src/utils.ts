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
    let cleaned = value.trim().toUpperCase();
    if(value === 'TRUE') return true;
    else if(value === 'FALSE') return false;
    return undefined;   // TODO
}

export function generate_random_id(){
    // Source: S/O 105034 - Broofa
    // TODO: Replace with a more rigorous UID
    return 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function isBoolean(value: string){
    // Raw boolean values
    if(u === true || u === false){
        return true;
    }

    let u = value.toString().toUpperCase();
    if(u === 'TRUE' || u === 'FALSE'){
        return true;
    }
    return false;
}

export function isTrue(value: string) {
    // Checks is true or 
    return value === true ||  value.toString().trim().toUpperCase() === "TRUE";
}

export function isFalse(value: string){
    return value === false ||  value.toString().trim().toUpperCase() === "FALSE";
}

export function castLiteral(value: string){
    if(value != null && value != undefined){
        let cleaned = value.toString().trim().toUpperCase();
        console.log("cleaned is " + cleaned + 'version fo ' + value);
        if(cleaned == "TRUE"){
            console.log("is true")
            return true;
        } else if(cleaned == "FALSE"){
            console.log("is false")
            return false;
        } else {
            return castNumber(value);
        }
    }
    return value;
}