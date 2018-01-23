// src/utils.ts
import { Big } from 'big.js';

export function castNumber(value: string) {
    try {
        return Big(value)
    } catch(err){
        // Kinda expected error since we're doing trial-and-failure typing.
        return undefined;
        // Error: [big.js] Invalid number
    }
}

export function cleanBoolStr(value: string) {
    return value.toString().trim().toUpperCase()
}

export function castBoolean(value: string) {
    let cleaned = cleanBoolStr(value);
    if(cleaned === "TRUE") return true;
    else if(cleaned === "FALSE") return false;
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
    // @ts-ignore: Allow booleans
    if(u === true || u === false){
        return true;
    }

    let u = cleanBoolStr(value);
    if(u === 'TRUE' || u === 'FALSE'){
        return true;
    }
    return false;
}


export function isTrue(value: string) {
    // Checks is true or 
    // @ts-ignore: Allow booleans
    return value === true ||  cleanBoolStr(value) === "TRUE";
}

export function isFalse(value: string){
    // @ts-ignore: Allow booleans
    return value === false ||  cleanBoolStr(value) === "FALSE";
}

export function castLiteral(value: string){
    if(value != null && value != undefined){
        let bool = castBoolean(value);
        if(bool !== undefined){
            return bool
        }
        let num = castNumber(value);
        if(num !== undefined){
            return num;
        }
    }
    // Return raw string value
    return value;
}

export function isFormula(value: string){
    if(value !== null && value !== undefined){
        let valStr = value.toString();
        return valStr.length > 0 && valStr[0] == "=";
    }
    return false;
}

// @ts-ignore: Allow undefined type since we're detecting type
export function isBigNum(value) {
    if(value !== undefined && value !== null && value.constructor !== undefined){
        return value.constructor.name == "Big"
    }
    return false;
}


let ZERO = Big(0);
let ONE = Big(1);


export function fudge(result: Big) {
    // If the difference in decimal places and the max is less than the precision we care about, fudge it.
    // Fudge the result of a computation for rounding errors
    // i.e (1/3) * 3 = 1
    // 0.33333333333333333333 = 20 decimals
    let decimal = result.mod(ONE);
    let p = ".00000000000000000001"
    let precision = Big(p)   // 20 decimals

    let max = ONE.minus(precision);
    if(decimal.gt(ZERO)){
        // 0.99999999... - 0.99999 < 0.000001
        // 0.00000001 - 0.000001 < precision
        let upper = decimal.minus(max);
        let lower = decimal.minus(precision);
        if( (lower.gte(ZERO) && lower.lte(precision)) || (upper.gte(ZERO) && upper.lte(precision)) ){
            return result.round()            
        }            
    }
    return result;
}


export function isValidName(name?: string){
    // TODO: Valid character set
    return name !== null && name !== undefined && name != "" && name.length < 20
}