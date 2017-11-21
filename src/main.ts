// src/index.ts

import Vue from "vue";
import Vuex from 'vuex'
import { mapState } from 'vuex'


Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        statements: [
            {name: 'field1', expression: '999', 'comment': 'First value'},
            {name: 'field2', expression: '50', 'comment': 'Second value'},
            {name: 'Average', expression: '= field1 + field2 + 3', 'comment': 'Average of the two values'},            
        ],
    },
    getters: {
        namespace: (state) => {
            return state.statements.reduce(function(map, obj){
                map[obj.name] = obj;
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
                name: field_name, 
                expression: '',
                comment: ''
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
    }
});
