import * as util from './utils';
import { escape } from 'querystring';
import { Big } from 'big.js';

var jsep = require("jsep")
// var Big = require('big.js');

// Rounding mode
Big.RM = 2 // ROUND_HALF_EVEN - banker's roll

export class Environment {

    outer: Environment

    // Name -> Cell map
    name_cell_map: {
        [index: string]: Cell
    } = {};

    // Cell ID -> Cell Map
    id_cell_map:{
        [index: string]: Cell
    } = {};

    // List of all cells in environment (even without names). 
    // Maintains order of appearance in view.
    all_cells: Cell[] = []

    constructor(outer?: Environment) {
        if(outer){
            this.outer = outer;
        }
    }

    findEnv(name: string) {
        var layer: Environment = this;
        while(layer !== undefined){
            if(name in layer.name_cell_map){
                return layer
            } else {
                layer = layer.outer;
            }
        }
        return undefined;
    }

    bind(name: string, value: Cell){
        this.name_cell_map[name] = value
    }

    rename(name: string, newName: string){
        let cell = this.name_cell_map[name];
        delete this.name_cell_map[name]
        this.name_cell_map[newName] = cell;
    }

    // TODO: Should these operate on names or ids?
    lookup(name: string){
        if(name in this.name_cell_map){
            return this.name_cell_map[name]
        } else {
            let err: EnvError = new EnvError("Name lookup failure " + escape(name));
            err.env = this;
            throw err
        }
    }

    findValue(name: string){
        // Find + get
        let env = this.findEnv(name);
        if(env != undefined){
            return env.lookup(name)
        }
        return undefined;
    }

    getAllCells(){
        return this.all_cells;
    }

    isValidName(name?: string){
        return name !== null && name !== undefined && name != "" && name.length < 20
        // TODO: Valid character set
    }

    // datatype: 'number', meta: {name: 'field1'}, data: {value: '999'}
    createCell(type: string, value: object, name?: string) {
        if(!this.isValidName(name)){
            name = this.generateName();
        }
        if(name == null){
            // Appease type checker. Should never happen
            throw Error("Unexpected invalid error")
        }
        // TODO: Validate type?
        let c = new Cell(type, value, this, name);
        this.bind(name, c);
        this.id_cell_map[c.id] = c;
        this.all_cells.push(c)
        return c;
        
    }

    generateName(){
        let length: number = this.all_cells.length;
        for(let i = length + 1; i < (length * 2) + 2; i++){
            let name = "field" + i;
            if(!(name in this.name_cell_map)){
                return name;
            }
        }
        return ""
    }

    createChildEnv() {
        return new Environment(this);
    }
}

let ZERO = Big(0);
let ONE = Big(1);

function fudge(result: Big) {
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

// Evaluate expression
var BINARY_OPS = {
    // TODO: Should other operations be fudged?
    "+" : (a: Big, b: Big) => { return a.plus(b); },
    "-" : (a: Big, b: Big) => { return a.minus(b); },
    "*" : (a: Big, b: Big) => { return fudge(a.times(b)); },
    "/" : (a: Big, b: Big) => { return fudge(a.div(b)); },
    "%" : (a: Big, b: Big) => { return a.mod(b); },

    "=" : (a: Big, b: Big) => { return a.eq(b);},//
    ">" : (a: Big, b: Big) => { return a.gt(b); },
    ">=" : (a: Big, b: Big) => { return a.gte(b); },    // TODO
    "<" : (a: Big, b: Big) => { return a.lt(b); },
    "<=" : (a: Big, b: Big) => { return a.lte(b); },
  
    // TODO: Case insensitive AND, OR, NOT
    "and" : (a: boolean, b: boolean) => { 
        if(util.isFalse(a) || util.isFalse(b)){
            // Return true regardless of type is one is known to be false.
            return false;
        } else if(util.isBoolean(a) && util.isBoolean(b)){
            // Else only evaluate in case of valid boolean values.
            return a && b; 
        } 
        return undefined;   // TODO: Undefined or null?
    },
    "or" : (a: boolean, b: boolean) => { 
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
export var _do_eval = function(node, env: Environment) {
    if(node.type === "BinaryExpression") {
        return BINARY_OPS[node.operator](_do_eval(node.left, env), _do_eval(node.right, env));
    } else if(node.type === "UnaryExpression") {
        return UNARY_OPS[node.operator](_do_eval(node.argument, env));
    } else if(node.type === "Literal") {
        return util.castLiteral(node.value);
    } else if(node.type === "Identifier") {
        // return castBoolean(node.value);
        // return node.value // boolean
        let upperName = node.name.toUpperCase();
        // Usually boolean's are literals if typed as 'true', but identifiers
        // if case is different.
        if(upperName == "TRUE"){
            return true;
        } else if(upperName == "FALSE"){
            return false;
        }

        let idEnv = env.findEnv(node.name);
        // Found the name in an environment
        if(idEnv !== null && idEnv !== undefined){
            return idEnv.lookup(node.name).evaluate()
        }
        // TODO: Return as string literal in this case?
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

// TODO!!!
// var _get_dependencies = function(node) {
//     let dependencies = [];
//     if(node.type === "BinaryExpression") {
//         return BINARY_OPS[node.operator](_do_eval(node.left, env), _do_eval(node.right, env));
//     } else if(node.type === "UnaryExpression") {
//         return UNARY_OPS[node.operator](_do_eval(node.argument, env));
//     } else if(node.type === "Literal") {
//         return castNumber(node.value);
//     } else {
//         // Node.type == Identifier
//         // Name lookup
//         // TODO: Handle name errors better.
//         // TODO: Support [bracket name] syntax for spaces.
//         return env.lookup(node.name).evaluate();
//     }

// }

export class CellError extends Error {
    message: string
    cells: Cell[]
    
    constructor(message: string){
        super(message);
        this.name = "CellError"
    }

    toString(){
        return this.message + "[" + this.cells.length + "]"
    }
}

export class EnvError extends Error {
    message: string
    env: Environment

    constructor(message: string){
        super(message)
        this.name = "EnvError"
    }

    toString() {
        return this.message + "@Env[" + this.env + "]"
    }
}

export function getEvalOrder(cells: Cell[]){
    /*
    Perform a topological sort of the node dependencies to get the evaluation order.
    */

    let eval_order: Cell[] = [];
    let leafs: Cell[] = [];
    // Cell -> # of nodes that depend on it.
    let depend_count: {
        [index: string]: number
    } = {};
    
    cells.forEach(cell => {
        if(cell.depends_on.length === 0){
            leafs.push(cell);
        } else {
            depend_count[cell.id] = cell.depends_on.length;
        }
    });

    while(leafs.length > 0) {
        let cell = leafs.shift();   // Pop first element
        if(cell != undefined){  // Unnecessary check to appeaes typescript.
            eval_order.push(cell);
            cell.used_by.forEach(cell_user => {
                if(cell_user.id in depend_count){
                    depend_count[cell_user.id] -= 1
                    if(depend_count[cell_user.id] <= 0){
                        // Remove nodes without any dependencies
                        delete depend_count[cell_user.id]
                    }
                }
                // This should not be turned into an else.
                // The item may have been removed in previous branch.
                if(!(cell_user.id in depend_count)){
                    // Add nodes whose dependencies are now met.
                    leafs.push(cell_user)
                }
            })
        }
    }
    let unmet_dependencies = Object.keys(depend_count)
    if(unmet_dependencies.length > 0){
        let cell_id_map: {
            [index: string]: Cell
        } = {};

        cells.forEach((cell) => {
            cell_id_map[cell.id] = cell;
        });
        
        let unmet_cells: Cell[] = unmet_dependencies.map((cell_id) => cell_id_map[cell_id]);
        let err: CellError = new CellError("Cycle detected");
        err.cells = unmet_cells;
        throw err
    } else {
        return eval_order;
    }
}

export class Cell {
    id: string
    type: string
    value: object   // TODO: How to handle string, int, etc?
    depends_on: Cell[]
    used_by: Cell[]
    env: Environment
    name: string

    // TODO: Need object wrappers around primitive types for int, string, etc.
    constructor(type: string, value: object, env: Environment, name?: string){
        this.value = value;
        this.type = type;
        this.env = env;
        this.depends_on = []
        this.used_by = []
        this.id = util.generate_random_id()
        this.name = name ? name : "";
    }

    addDependency(other: Cell){
        this.depends_on.push(other)
        other.used_by.push(this)
    }

    recomputeDependencies(){
        
    }

    parse() {
        // Return a parsed version of the current expression.
    }

    rename(newName: string){
        console.log("Renaming " + this.name + " to " + newName);
        this.env.rename(this.name, newName)
        this.name = newName;
    }

    isFormula(){
        if(this.value !== null && this.value !== undefined){
            if(this.value[0] == "="){
                return true;
            }
        }
    }

    evaluate() {
        if(this.type == "formula") {
            // Evaluate formula. Value = jsep(expression). 
            // or value = String
            return _do_eval(jsep(this.value), this.env);
        } else if(this.type == "call") {
            // Call function. Reset cache? 
            // TODO: There's gotta be a better way to do this.
            let func: FunctionCell = this.value["function"]
            let args = this.value["args"]
            return function.invoke(args)
        }

        if(this.value !== null && this.value !== undefined){
            //if(this.value[0] == "="){
                try {
                    let result = _do_eval(jsep(this.value), this.env);
                    return result
                } catch (err) {
                    console.log("Evaluation failed for " + this.value);
                    console.log(err)
                }
            //}
        }
        
        /* if(this.value && this.value[0] == "="){
            return _do_eval(jsep(this.value.substring(1)), this.env);
        } */
        return this.value;
    }
}

class FunctionCell extends Cell {
    args: string[]
    body: Cell[]

    constructor(args: string[], body: Cell[], env: Environment) { 
        super("function", {},  env);
        this.args = args;
        this.body = body;
        // TODO: This is hacky. Fix this. Re-bind env for all children.
        body.forEach(statement => {
            statement.env = env;
        });
    }
    invoke(parameters: Cell[]){
        let func = this;
        // Bind parameter values in function environment
        // TODO: Should it be a different environment per invocation?
        this.args.map(function(arg: string, i) {
            func.env.bind(arg, parameters[i]);
        });
        let eval_order: Cell[] = getEvalOrder(this.body)
        let result = null;
        eval_order.forEach(c => {
            // What if one of it's a function cell>?
            result = c.evaluate();
        });
        // Return the last line as result. 
        // TODO: Seems hacky. 
        return result;
    }
}

export class Engine { 
    rootEnv: Environment
    
    constructor() {
        this.rootEnv = new Environment()
    }
}