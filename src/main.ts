// src/index.ts

import Vue from "vue";
import Vuex from 'vuex'
import { mapState } from 'vuex'


Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        statements: [
            {id: 1, datatype: 'number', meta: {name: 'field1'}, data: {value: '999'}},
            {id: 2, datatype: 'number', meta: {name: 'field2'}, data: {value: '50'}},
            {id: 3, datatype: 'equation', meta:{name: 'Average'}, data: {value: '', expression: '= field1 + field2 + 3'}}
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
            for(let i = length; i < length * 2; i++){
                let name = "field" + i;
                if(!(name in getters.namespace)){
                    return name;
                }
            }
            return ""
        },
        nextId: (state, getters) => {
            return state.statements.length;
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

let v = new Vue({
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
