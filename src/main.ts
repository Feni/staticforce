// src/index.ts

import Vue from "vue";
import Vuex from 'vuex'
import { mapState } from 'vuex'


function castNumber(value: string) {
    var num = Number(value);
    if(num === NaN) {return value}
    return num;
}

function castBoolean(value: string) {
    if(value === 'true') return true;
    return false;
}

// Need to be able to store type hints like numbers - could show as a visual icon next to the interpreted version - string (abc) or number (123)

function evaluateEquation(state object, getters: object, expression: string){
    var namespace = getters.namespace;
    // Evaluate expression
    var binary_ops = {
        "+" : (a: number, b: number) => { return a + b; },
        "-" : (a: number, b: number) => { return a - b; },
        "*" : (a: number, b: number) => { return a * b; },
        "/" : (a: number, b: number) => { return a / b; },
        "%" : (a: number, b: number) => { return a % b; }
    };

    var unary_ops = {
        "-" : function(a: number) { return -a; },
        // "+" : function(a: number) { return -a; }
    };

    var do_eval = function(node) {
        if(node.type === "BinaryExpression") {
            return binary_ops[node.operator](do_eval(node.left), do_eval(node.right));
        } else if(node.type === "UnaryExpression") {
            return unary_ops[node.operator](do_eval(node.argument));
        } else if(node.type === "Literal") {
            // console.log("literal ")
            // console.log(node)
            return castNumber(node.value);
        } else {
            // Node.type == Identifier
            // Name lookup
            if(node.name in namespace){
                console.log("name found " + node.name)
                console.log(namespace)
                // TODO: Cycle detection and termination
                return getters.getValue(namespace[node.name].id)
            } else {
                console.log("unknown token ")
                console.log(node.name)
            }
            console.log("else ")
            console.log(node)
        }
    };
    return do_eval(jsep(expression.substring(1)));
}


class StatementType {
    id: number;
    datatype: string;
    meta: object;
    data: object;
}




Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        statements: [
            {id: 0, datatype: 'number', meta: {name: 'field1'}, data: {value: '999'}},
            {id: 1, datatype: 'number', meta: {name: 'field2'}, data: {value: '50'}},
            {id: 2, datatype: 'equation', meta:{name: 'Average'}, data: {value: '= field1 + field2 + 3'}},
            
            {id: 3, datatype: 'boolean', meta:{name: 'field4'}, data: {value: 'true'}},
            {id: 4, datatype: 'boolean', meta:{name: 'field5'}, data: {value: 'false'}},
            
            {id: 5, datatype: 'text', meta:{name: 'Short Text'}, data: {value: 'Hello World'}},
            
            {id: 6, datatype: 'text', meta:{name: 'Long Text'}, data: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}},
            
            {id: 7, datatype: 'object', meta:{name: 'Complex object'}, data: {
                value: [
                    {id: 8, datatype: 'text', meta: {name: 'First Name'}, data: {value: 'Feni'}},
                    {id: 9, datatype: 'number', meta: {name: 'Age'}, data: {value: '50'}}
                ]                                
            }}
        ],
    },
    getters: {
        namespace: (state) => {
            return state.statements.reduce(function(map, obj){
                map[obj.meta.name] = obj;
                return map;
            }, {});
        },
        nextName: (state, getters) => {
            // Find the first unique name. 
            // Construct incrementally and skip any that exists.
            let length: number = state.statements.length;
            for(let i = length + 1; i < length * 2; i++){
                let name = "field" + i;
                if(!(name in getters.namespace)){
                    return name;
                }
            }
            return ""
        },
        nextId: (state, getters) => {
            return state.statements.length;
        },
        getById: (state, getters) => (id: number) => {
            // Return a function to evaluate a particular statement. 
            return state.statements.find(stmt => stmt.id === id)
        },
        getValue: (state, getters) => (id: number) => {
            console.log("get value of " + id);
            var statement = getters.getById(id);
            if(statement.datatype === "number"){
                return castNumber(statement.data.value);
            }
            else if (statement.datatype === "boolean") {
                return castBoolean(statement.data.value);
            }
            else if (statement.datatype === "equation") {
                return evaluateEquation(state, getters, statement.data.value)
            } 
            console.log("value not found")
            return -1;  // TODO
        }
    },
    mutations: {
        addStatement(state, payload) {
            state.statements.push(payload);
        }
    },
    /* Asyncronous actions */
    actions: {
        newStatement(context, payload) {
            console.log("new statement");
            let field_name = context.getters.nextName;
            console.log("next name " + field_name);
            let new_field = {
                id: context.getters.nextId,
                datatype: 'number', 
                meta: {
                    name: field_name,
                },
                data: {value: 0}
            }
            context.commit('addStatement', new_field);
        }

    }
})


import Statement from "./components/Statement.vue";

window.dashform = new Vue({
    el: "#app",
    store,
    computed: {
        ...mapState([
          'statements'
        ])
    },
    components: {
        Statement
    },
    methods: {
        addValue () {
            return store.dispatch('newStatement')
        }
    }
});
