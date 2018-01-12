import {castNumber, castBoolean, generate_random_id} from './utils'
import { escape } from 'querystring';
import { Big } from 'big.js';
var jsep = require("jsep")
// var Big = require('big.js');

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

// Evaluate expression
var BINARY_OPS = {
    "+" : (a: Big, b: Big) => { return a.plus(b); },
    "-" : (a: Big, b: Big) => { return a.minus(b); },
    "*" : (a: Big, b: Big) => { return a.times(b); },
    "/" : (a: Big, b: Big) => { return a.div(b); },
    "%" : (a: Big, b: Big) => { return a.mod(b); }
    // TODO: And, or, etc
};

var UNARY_OPS = {
    "-" : function(a: Big) { return a.times(-1); },
    // "+" : function(a: number) { return -a; }
};

// TODO: Test cases to verify operator precedence
var _do_eval = function(node, env: Environment) {
    if(node.type === "BinaryExpression") {
        return BINARY_OPS[node.operator](_do_eval(node.left, env), _do_eval(node.right, env));
    } else if(node.type === "UnaryExpression") {
        return UNARY_OPS[node.operator](_do_eval(node.argument, env));
    } else if(node.type === "Literal") {
        return castNumber(node.value);
    } else {
        // Node.type == Identifier
        // Name lookup
        // TODO: Handle name errors better.
        // TODO: Support [bracket name] syntax for spaces.
        return env.lookup(node.name).evaluate();
    }
};

var _get_dependencies = function(node) {
    let dependencies = [];
    if(node.type === "BinaryExpression") {
        return BINARY_OPS[node.operator](_do_eval(node.left, env), _do_eval(node.right, env));
    } else if(node.type === "UnaryExpression") {
        return UNARY_OPS[node.operator](_do_eval(node.argument, env));
    } else if(node.type === "Literal") {
        return castNumber(node.value);
    } else {
        // Node.type == Identifier
        // Name lookup
        // TODO: Handle name errors better.
        // TODO: Support [bracket name] syntax for spaces.
        return env.lookup(node.name).evaluate();
    }

}

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
        this.id = generate_random_id()
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
            if(this.value[0] == "="){
                let result = _do_eval(jsep(this.value.substring(1)), this.env);
                return result
            }
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