/* Expression evaluation module */
import { Big } from 'big.js';
import * as util from './utils';
import { castBoolean, isCell } from './utils';
import { Cell, Environment } from './engine';

var jsep = require("jsep")
Big.RM = 2 // ROUND_HALF_EVEN - banker's roll

// Create new cells as result, but don't bind or store in all cells list.
// TODO: What about names bound to this later?
function itemwiseApply(a, b, func, doFudge=false) {

    if(Array.isArray(a) && Array.isArray(b)){
        console.log("Both array")
        // ASSERT BOTH ARE SAME LENGTH
        let resultList = a.map(function(ai, i) {
            let aVal = ai.evaluate();
            let bVal = b[i].evaluate();
            let result = aVal[func](bVal)
            if(doFudge){
                result = util.fudge(result);
            }
            let resultCell = new Cell(ai.type, result, ai.env, ai.name);
            // resultCell.parent_group = aVal.parent_group;
            return resultCell
        });
        return resultList;
    }
    else if(Array.isArray(a)) {
        let resultList = a.map((ai) => {
            let aVal = ai.evaluate();   // TODO: What if this is wrong type?
            let result = aVal[func](b);
            if(doFudge){
                result = util.fudge(result);
            }
            let resultCell = new Cell(ai.type, result, ai.env, ai.name);
            // resultCell.parent_group = aVal.parent_group;
            return resultCell;
        })
        return resultList;

    } else if(Array.isArray(b)) {
        let resultList = b.map((bi) => {
            let bVal = bi.evaluate();   // TODO: What if this is wrong type?
            let result = a[func](bVal);
            if(doFudge){
                result = util.fudge(result);
            }
            let resultCell = new Cell(bi.type, result, bi.env, bi.name);
            // resultCell.parent_group = bVal.parent_group;
            return resultCell;
        })
        return resultList;        
        
    } else {    // both are scalar values
        let result = a[func](b);
        if(doFudge){
            result = util.fudge(result);
        }
        return result;
    }
}

// Evaluate expression
var BINARY_OPS = {
    // TODO: Should other operations be fudged?
    "+" : (a: Big, b: Big) => { return itemwiseApply(a, b, "plus") },    // a.plus(b)
    "-" : (a: Big, b: Big) => { return itemwiseApply(a, b, "minus"); },
    "*" : (a: Big, b: Big) => { return itemwiseApply(a, b, "times", true); },
    "/" : (a: Big, b: Big) => { return itemwiseApply(a, b, "div", true); },
    "%" : (a: Big, b: Big) => { return itemwiseApply(a, b, "mod"); },

    //  TODO: itemwise support?
    "=" : (a: Big, b: Big) => { return a.eq(b);},//
    ">" : (a: Big, b: Big) => { return a.gt(b); },
    ">=" : (a: Big, b: Big) => { return a.gte(b); },    // TODO
    "<" : (a: Big, b: Big) => { return a.lt(b); },
    "<=" : (a: Big, b: Big) => { return a.lte(b); },

    // "," : (a: Array, b: Array) => { 
    //     console.log("Concatenating");
    //     if(Array.isArray(a)){
    //         return a.concat(b);     // Works even if b isn't an array
    //     } else {
    //         return [a].concat(b);
    //     }
    // },
  
    // TODO: Case insensitive AND, OR, NOT
    "and" : (a: string, b: string) => { 
        if(util.isFalse(a) || util.isFalse(b)){
            // Return true regardless of type is one is known to be false.
            return false;
        } else if(util.isBoolean(a) && util.isBoolean(b)){
            // Else only evaluate in case of valid boolean values.
            return a && b; 
        } 
        return undefined;   // TODO: Undefined or null?
    },
    "or" : (a: string, b: string) => { 
        if(util.isTrue(a) || util.isTrue(b)){
            return true;
        } else if(util.isBoolean(a) && util.isBoolean(b)){
            return a || b; 
        }
        return undefined;
    },
};


jsep.addBinaryOp("=", 6);
jsep.addBinaryOp("or", 1);
jsep.addBinaryOp("and", 2);
jsep.addUnaryOp("not"); //  TODO - guess


var UNARY_OPS = {
    "-" : function(a: Big) { return a.times(-1); },
    "not" : function(a: boolean) { return !a; },    // Verify is boolean, else typos lead to true.
    // "+" : function(a: number) { return -a; }
};


// TODO: Test cases to verify operator precedence
// @ts-ignore
export function _do_eval(node, env: Environment) {
    if(node.type === "BinaryExpression") {
        // @ts-ignore
        return BINARY_OPS[node.operator](_do_eval(node.left, env), _do_eval(node.right, env));
    } else if(node.type === "UnaryExpression") {
        // @ts-ignore
        return UNARY_OPS[node.operator](_do_eval(node.argument, env));
    } else if(node.type === "Literal") {
        return util.castLiteral(node.value);
    } else if(node.type === "Identifier") {
        // Usually boolean's are literals if typed as 'true', but identifiers
        // if case is different.
        let bool = castBoolean(node.name);
        if(bool != undefined){
            return bool;
        }
        
        let idEnv = env.findEnv(node.name);
        // Found the name in an environment
        if(idEnv !== null && idEnv !== undefined){
            return idEnv.lookup(node.name).evaluate()
        }
        // TODO: Return as string literal in this case?
        // Probably not - should be lookup error
        return node.name
    } else if (node.type === "Compound") { // a, b
        console.log(node);
        let compound = [];
        node.body.forEach(subnode => {
            // compound.concat(subarray)
            let subresult = _do_eval(subnode, env);
            if(!Array.isArray(subresult) && !isCell(subresult)) {
                // Then wrap it in a cell
                subresult = new Cell("", subresult, env, "");
                console.log("Wrapping");
            }
            console.log("Sub result")
            console.log(subresult)
            compound = compound.concat(subresult);
            console.log("compound is " + compound);
        })
        console.log("result is " + compound);
        console.log(compound);
        return compound;
    }
     else {
        console.log("UNHANDLED eval CASE")
        console.log(node);

        // Node.type == Identifier
        // Name lookup
        // TODO: Handle name errors better.
        // TODO: Support [bracket name] syntax for spaces.
        return env.lookup(node.name).evaluate();
    }
};

// @ts-ignore
function getDependencies(node, env: Environment) : Cell[] {
    /* Parse through an expression tree and return list of dependencies */
    if(node.type === "BinaryExpression") {
        let left = getDependencies(node.left, env)
        let right = getDependencies(node.right, env);
        return left.concat(right);
    } else if(node.type === "UnaryExpression") {
        return getDependencies(node.argument, env);
    } else if(node.type === "Literal") {
        return []
    } else if(node.type === "Identifier") {
        let bool = castBoolean(node.name);
        if(bool != undefined){
            return [];
        }
        // todo LOOKUP NAME
        return [env.lookup(node.name)]
    } else {
        console.log("UNHANDLED eval CASE")
        console.log(node);

        // Node.type == Identifier
        // Name lookup
        // TODO: Handle name errors better.
        // TODO: Support [bracket name] syntax for spaces.
        return [env.lookup(node.name)];
    }
}

// @ts-ignore
export function evaluateExpr(parsed, env: Environment) {
    try {
        return _do_eval(parsed, env)
    } catch (err) {
        console.log("Evaluation failed for " + parsed);
        console.log(err)
        // TODO - propagate
    }
}

export function parseFormula(expr: string){
    // Assert is formula
    // Return jsep expression
    let parsed = jsep(expr.substring(1));
    return parsed;
}