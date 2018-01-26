/* Expression evaluation module */
import { Big } from 'big.js';
import * as util from './utils';
import { castBoolean } from './utils';
import { Cell, Environment } from './engine';

var jsep = require("jsep")
Big.RM = 2 // ROUND_HALF_EVEN - banker's roll


// Evaluate expression
var BINARY_OPS = {
    // TODO: Should other operations be fudged?
    "+" : (a: Big, b: Big) => { return a.plus(b); },
    "-" : (a: Big, b: Big) => { return a.minus(b); },
    "*" : (a: Big, b: Big) => { return util.fudge(a.times(b)); },
    "/" : (a: Big, b: Big) => { return util.fudge(a.div(b)); },
    "%" : (a: Big, b: Big) => { return a.mod(b); },

    "=" : (a: Big, b: Big) => { return a.eq(b);},//
    ">" : (a: Big, b: Big) => { return a.gt(b); },
    ">=" : (a: Big, b: Big) => { return a.gte(b); },    // TODO
    "<" : (a: Big, b: Big) => { return a.lt(b); },
    "<=" : (a: Big, b: Big) => { return a.lte(b); },
  
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
            console.log("looking up " + node.name);
            return idEnv.lookup(node.name).evaluate()
        }
        // TODO: Return as string literal in this case?
        // Probably not - should be lookup error
        return node.name

    } else {
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