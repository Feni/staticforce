import { Cell, Environment } from "./engine";

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
