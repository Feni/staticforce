// src/index.ts

import Vue from "vue";
import Vuex from 'vuex'
import { mapState } from 'vuex'
import {castNumber, castBoolean} from './utils'
import {Engine} from './engine'

var Gun = require('gun');

var gun = Gun();

// function evaluateEquation(state object, getters: object, expression: string){
//     var namespace = getters.namespace;
//     // Evaluate expression
//     var binary_ops = {
//         "+" : (a: number, b: number) => { return a + b; },
//         "-" : (a: number, b: number) => { return a - b; },
//         "*" : (a: number, b: number) => { return a * b; },
//         "/" : (a: number, b: number) => { return a / b; },
//         "%" : (a: number, b: number) => { return a % b; }
//     };

//     var unary_ops = {
//         "-" : function(a: number) { return -a; },
//         // "+" : function(a: number) { return -a; }
//     };

//     var do_eval = function(node) {
//         if(node.type === "BinaryExpression") {
//             return binary_ops[node.operator](do_eval(node.left), do_eval(node.right));
//         } else if(node.type === "UnaryExpression") {
//             return unary_ops[node.operator](do_eval(node.argument));
//         } else if(node.type === "Literal") {
//             // console.log("literal ")
//             // console.log(node)
//             return castNumber(node.value);
//         } else {
//             // Node.type == Identifier
//             // Name lookup
//             if(node.name in namespace){
//                 console.log("name found " + node.name)
//                 console.log(namespace)
//                 // TODO: Cycle detection and termination
//                 return getters.getValue(namespace[node.name].id)
//             } else {
//                 console.log("unknown token ")
//                 console.log(node.name)
//             }
//             console.log("else ")
//             console.log(node)
//         }
//     };
//     return do_eval(jsep(expression.substring(1)));
// }

// class StatementType {
//     id: number;
//     datatype: string;
//     meta: object;
//     data: object;
// }

let long_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

let ENGINE = new Engine();
ENGINE.rootEnv.createCell("expression", "2 + 2", "Hello")
ENGINE.rootEnv.createCell("text", long_text, "Exposition")
ENGINE.rootEnv.createCell("expression", "true or false", "three")

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        // statements: [
        //     {id: 0, datatype: 'number', meta: {name: 'field1'}, data: {value: '999'}},
        //     {id: 1, datatype: 'number', meta: {name: 'field2'}, data: {value: '50'}},
        //     {id: 2, datatype: 'equation', meta:{name: 'Average'}, data: {value: '= field1 + field2 + 3'}},
            
        //     {id: 3, datatype: 'boolean', meta:{name: 'field4'}, data: {value: 'true'}},
        //     {id: 4, datatype: 'boolean', meta:{name: 'field5'}, data: {value: 'false'}},
            
        //     {id: 5, datatype: 'text', meta:{name: 'Short Text'}, data: {value: 'Hello World'}},
            
        //     {id: 6, datatype: 'text', meta:{name: 'Long Text'}, data: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}},
        //     {id: 10, datatype: 'number', meta: {name: 'random number'}, data: {value: '4654685'}},
        // ],
        engine: ENGINE,
        selected: []
    },
    getters: {
        namespace: (state) => {
            // TODO: Remove method?
            return state.engine.rootEnv.name_cell_map;
        },
        engine: (state) => {
            return state.engine;
        },
        nextName: (state, getters) => {
            return state.engine.rootEnv.generateName()
        },
        // nextId: (state, getters) => {
        //     return state.statements.length;
        // },
        getById: (state, getters) => (id: string) => {
            // Return a function to evaluate a particular statement. 
            return state.engine.rootEnv.id_cell_map[id]
        },
        getValue: (state, getters) => (id: string) => {
            var cell = getters.getById(id);
            var result = cell.evaluate();
            if(result !== undefined && result.constructor.name == "Big"){
                return result.toString().replace('"', "")
            }
            return result

            // if(statement.datatype === "number"){
            //     return castNumber(statement.data.value);
            // }
            // else if (statement.datatype === "boolean") {
            //     return castBoolean(statement.data.value);
            // }
            // else if (statement.datatype === "equation") {
            //     return evaluateEquation(state, getters, statement.data.value)
            // } 
            // console.log("value not found")
            // return -1;  // TODO
        }
    },
    mutations: {
        addStatement(state, payload) {
            // TODO
            // state.statements.push(payload);
            console.log("Adding statement " + payload);
            state.engine.rootEnv.createCell(payload["type"], payload["value"], payload["name"])
        },
        addRef(state, payload) {
            console.log('adding ereference ' + payload);
        },
        select(state, payload){
            console.log("Store selecting");
            // Based on mode, may need to clear state.
            // state.selectedCells.push(payload); // Vue doesn't pick this up.
            // Ideally, state.selected = a set, not an array.
            // Vue.set(state.selected, state.selected.length, payload.id)
            // state.selected.push(payload.id);
            state.selected = [payload.id]
        }
    },
    /* Asyncronous actions */
    actions: {
        newStatement(context, payload) {
            console.log("new statement");
            let field_name = context.getters.nextName;
            console.log("next name " + field_name);
            let new_field = {
                type: 'auto',
                name: field_name,
                data: 0
            }
            context.commit('addStatement', new_field);
        }, 
        newRef(context, payload){
            var refname = prompt("Reference name", "Hello");
            var value = context.getters.engine.rootEnv.findValue(refname);
            console.log("value " + value + " refname " + refname);
            if(value !== undefined){
                let id = value.id;
                console.log("adding ref to " + id);
                context.commit('addRef', id);
            }
        }

    }
})


import Statement from "./components/Statement.vue";

window.dashform = new Vue({
    el: "#app",
    store,
    computed: {
        ...mapState([
          // 'statements'
          'engine',
          'selected'
        ])
    },
    components: {
        Statement
    },
    methods: {
        addValue () {
            return store.dispatch('newStatement')
        },
        addRef() {
            return store.dispatch('newRef')
        }
    }
});
