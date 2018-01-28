import * as util from './utils';
import { escape } from 'querystring';
import { Big } from 'big.js';
import { isFormula, castLiteral, isString, isValidName } from './utils';
import { evaluateExpr, parseFormula, evaluateStr } from './expr';
import { EnvError, CellError } from './errors';

export class Cell {
    id: string
    type: string
    value: string   // TODO: How to handle string, int, etc?
    depends_on: Cell[]
    used_by: Cell[]
    env: Environment
    name: string
    errors: Error[]
    
    parent_group = null
    class_name = "cell"
    is_group = false;

    // TODO: Need object wrappers around primitive types for int, string, etc.
    constructor(type: string, value: string, env: Environment, name?: string){
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

    rename(newName: string){
        console.log("Renaming " + this.name + " to " + newName);
        this.env.rename(this, newName)
        this.name = newName;
    }

    // @ts-ignore - return type any.
    evaluate() {
        window.evalDepth += 1;

        if(window.evalDepth > 2000) {
            // The app doesn't work after this, but atleast it doesn't kill the tab.
            console.log("Error: Self-referencing cells....");
            this.value = "";    // TODO: This is deleting data!
            let err: CellError = new CellError("Cycle detected");
            err.cells = [this];
            throw err
             
            return undefined;
        }

        if(this.value == undefined || this.value == null) {
            return undefined;
        }
        if(this.is_group){
            // TODO: Should this return the raw value or the evaluated value?
            return this.value
        }
        if(isFormula(this.value)) {
            // Evaluate formula. Value = jsep(expression). 
            // or value = String
            try{
                return evaluateExpr(parseFormula(this.value), this.env)
            } catch (err) {
                // TODO: Propagate this error to other dependent cells - 
                // Else their value could be messed up as well... 
                this.error = err;
                console.error("Caught evaluation error - " + err)
                return this.value;
            }
        }
        let literal = castLiteral(this.value);
        if(isString(literal)) {
            // Replace variable references.
            return evaluateStr(this.value, this.env)
        } else {
            return literal;
        }

        window.evalDepth -= 1;
    }
}

export class CellGroup extends Cell {
    class_name = "cellgroup"
    is_group = true;

    addChild(child: Cell){
        child.parent_group = this;
        let order = this.env.all_cells;
        // Add it right after group - for selection indexing to work out.
        order.move(order.indexOf(child), order.indexOf(this) + this.value.length + 1);
        this.value.push(child);
    }
} 

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
        let uname = name.toUpperCase()
        while(layer !== undefined){
            if(uname in layer.name_cell_map){
                return layer
            } else {
                layer = layer.outer;
            }
        }
        return undefined;
    }

    bind(name: string, value: Cell){
        // Add to list if exists.
        let uname = name.toUpperCase();
        if(isValidName(uname)) {
            if(uname in this.name_cell_map) {
                // todo - raise error
            } else {
                this.name_cell_map[uname] = value
            }
        } else {
            console.log("Invalid name")
            // TODO raise an error
        }
    }

    rename(cell: Cell, newName: string){
        // TODO; validate names at some stage.
        // todo support multiple things with same name.
        if(cell.name != ""){
            let uname = cell.name.toUpperCase()
            delete this.name_cell_map[uname]
        }
        if(newName != ""){
            let unewName = newName.toUpperCase()
            this.name_cell_map[unewName] = cell;
        }
    }

    // TODO: Should these operate on names or ids?
    lookup(name: string){
        let uname = name.toUpperCase()
        if(uname in this.name_cell_map){
            return this.name_cell_map[uname]
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

    // datatype: 'number', meta: {name: 'field1'}, data: {value: '999'}
    createCell(type: string, value: string, name?: string) {
        if(!util.isValidName(name)){
            name = "";
        }
        if(name == null){
            // Appease type checker. Should never happen
            throw Error("Unexpected invalid error")
        }
        // TODO: Validate type?
        let c = new Cell(type, value, this, name);
        if(name !== ""){
            this.bind(name, c);
        }
        this.id_cell_map[c.id] = c;
        this.all_cells.push(c)
        return c;
    }

    createGroup() {
        // TODO: We need to differentiate between all cells and cells that belong to a group
        // maybe cell should point to the group it belongs to and you can use that to distinguish
        let c = new CellGroup("group", [], this, "");
        this.id_cell_map[c.id] = c;
        // todo: NAME
        this.all_cells.push(c)
        console.log("created group ");
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

export class Engine { 
    rootEnv: Environment
    
    constructor() {
        this.rootEnv = new Environment()
        window.rootEnv = this.rootEnv;
    }
}