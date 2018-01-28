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

export function isString(value: string) {
    return typeof value === 'string' || value instanceof String;
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
    return isInstanceOf(value, "Big")
}

export function isInstanceOf(value, classname) {
    if(value !== undefined && value !== null && value.constructor !== undefined){
        return value.constructor.name == classname
    }
    return false
}

export function isCell(value) {
    return isInstanceOf(value, "Cell")
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


// https://stackoverflow.com/questions/5306680
Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

export function groupSelectionPolicy(selection: Boolean[], cells: Cell[]){
    // Enforce the following rule:
    // If a group item is selected, either 'all' or 'none' or it's children must be selected
    // else the group shouldn't be selected.
    // This enforces absolute click on group rather than bubbled clicks.

    for(let i = 0; i < selection.length; i++){
        if(selection[i] === true && cells[i].is_group === true){
            let group = cells[i];
            let firstChildValue = undefined;

            // Special case to not select group if the list only has a single item 
            // lest that item becomes uneditable.
            if(group.value.length == 1 && selection[i + 1] == true){
                selection[i] = false;
            }
            // Offset by one to account for next position in cells array.
            for(let childIndex = 1; childIndex < group.value.length + 1; childIndex++){
                if(childIndex == 1){
                    // Initialize to the first child's value to see if all else match (all true vs all false)
                    firstChildValue = selection[i + childIndex]
                } else {
                    if(selection[i + childIndex] !== firstChildValue){
                        selection[i] = false;
                    }
                }
            }
        }
    }
    return selection;
}

export function isEditMode(selected: Boolean[], index: number) {
    // Check if item at index is the only true value.
    // Not in edit mode when multiple items are selected.
    // TODO; Micro optimization - terminate early without all count.
    if(selected == undefined) {
        return false;
    }
    return selected[index] == true && selected.filter(t => t == true).length == 1
}

export function formatValue(value) {
    if(value !== undefined){
        // console.log("result is " + result);
        if(value.constructor.name == "Big"){
            return value.toString().replace('"', "")
        } else if(isBoolean(value)) {
            return value.toString().toUpperCase()
        }
    }
    return value;
}