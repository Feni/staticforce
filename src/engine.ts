import {castNumber, castBoolean, generate_random_id} from './utils'

class Environment {
    // Name -> Cell map
    variables: object
    outer: Environment

    constructor(outer?: Environment) {
        if(outer){
            this.outer = outer;
        }
    }

    // TODO: Test cases for this
    // Test getting a variable in direct environment
    // Test getting in parent environment
    // Testing getting in several layers deep
    // Test variable not found. 
    // Test variable found in multiple environments & proper one returned.
    find(name: string) {        
        var layer: Environment = this;
        while(layer !== undefined){
            if(name in layer.variables){
                return layer
            } else {
                layer = layer.outer;
            }
        }
        return undefined;
    }

}

// Cell ID -> Cell Map
let CELL_STORE:{
    [index: string]: Cell
} = {};

// Evaluate expression
var BINARY_OPS = {
    "+" : (a: number, b: number) => { return a + b; },
    "-" : (a: number, b: number) => { return a - b; },
    "*" : (a: number, b: number) => { return a * b; },
    "/" : (a: number, b: number) => { return a / b; },
    "%" : (a: number, b: number) => { return a % b; }
};

var UNARY_OPS = {
    "-" : function(a: number) { return -a; },
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
        return env.find(node.name)[node.name].evaluate();
    }
};


function getEvalOrder(cells: Cell[]){
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
    console.log('unmet deps ' + unmet_dependencies)
    if(unmet_dependencies != []){
        console.error("Cycle detected");
    }
    console.log("Eval order " + eval_order);
    return eval_order;
}



class Cell {
    id: string
    type: string
    value: object   // TODO: How to handle string, int, etc?
    depends_on: Cell[]
    used_by: Cell[]
    env: Environment

    constructor(value: object, type: string, env: Environment){
        this.value = value;
        this.type = type;
        this.env = env;
        this.depends_on = []
        this.used_by = []
        this.id = generate_random_id()
        CELL_STORE[this.id] = this;
    }

    addDependency(other: Cell){
        this.depends_on.push(other)
        other.used_by.push(this)
    }

    evaluate() {
        if(this.type == "formula") {
            // Evaluate formula. Value = jsep(expression). 
            // or value = String
            return _do_eval(jsep(this.value), env);
        } else if(this.type == "call") {
            // Call function. Reset cache? 
            // TODO: There's gotta be a better way to do this.
            let func: FunctionCell = this.value["function"]
            let args = this.value["args"]
            return function.invoke(args)
        }
        return this.value;
    }
}

class FunctionCell extends Cell {
    args: string[]
    body: Cell[]
    constructor(args: string[], body: Cell[], env: Environment) { 
        super({}, "function", env);
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
            func.env.variables[arg] = parameters[i];
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