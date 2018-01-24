import * as util from './utils';
import { escape } from 'querystring';
import { Big } from 'big.js';
import { isFormula, castLiteral } from './utils';
import { evaluateExpr, parseFormula } from './expr';
import { EnvError } from './errors';

export class Cell {
    id: string
    type: string
    value: string   // TODO: How to handle string, int, etc?
    depends_on: Cell[]
    used_by: Cell[]
    env: Environment
    name: string

    class_name = "cell"

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
        this.env.rename(this.name, newName)
        this.name = newName;
    }

    // @ts-ignore - return type any.
    evaluate() {
        if(isFormula(this.value)) {
            // Evaluate formula. Value = jsep(expression). 
            // or value = String
            return evaluateExpr(parseFormula(this.value), this.env)
        } 
        return castLiteral(this.value)
    }
}

export class CellGroup extends Cell {
    class_name = "cellgroup"
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
    }
}