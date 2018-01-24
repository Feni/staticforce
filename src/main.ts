// src/index.ts

import Vue from "vue";
import Vuex from 'vuex'
import { mapState } from 'vuex'
import {castNumber, castBoolean} from './utils'
import {Engine} from './engine'

var vueSelectable = require('vue-selectable');

let long_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

let ENGINE = new Engine();
ENGINE.rootEnv.createCell("expression", "=2 + 2", "Hello")
ENGINE.rootEnv.createCell("text", long_text, "Exposition")
ENGINE.rootEnv.createCell("expression", "=true or false", "three")
ENGINE.rootEnv.createCell("expression", "true", "boolean")
ENGINE.rootEnv.createCell("expression", "false", "boolean")
ENGINE.rootEnv.createCell("text", "Hello world", "")

// ENGINE.rootEnv.createGroup()

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        engine: ENGINE,
        selected: [],
        selecting: []
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
        getById: (state, getters) => (id: string) => {
            // Return a function to evaluate a particular statement. 
            return state.engine.rootEnv.id_cell_map[id]
        },
        getValue: (state, getters) => (id: string) => {
            var cell = getters.getById(id);
            var result = cell.evaluate();
            if(result !== undefined){
                // console.log("result is " + result);
                if(result.constructor.name == "Big"){
                    return result.toString().replace('"', "")
                } else if(result === true || result === false) {
                    
                    return result.toString().toUpperCase()
                }
            }
            return result
        }
    },
    mutations: {
        addStatement(state, payload) {
            state.engine.rootEnv.createCell(payload["type"], payload["value"], payload["name"])
        },
        addRef(state, payload) {
            console.log('adding ereference ' + payload);
        },
        addGroup(state, payload) {
            state.engine.rootEnv.createGroup();
        },
        select(state, payload){
            state.selected = payload
        },
        selecting(state, payload){
            state.selecting = payload
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
                value: "test"
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
          'selected',
          'selecting'
        ])
    },
    components: {
        Statement
    },
    directives: { 
        selectable: vueSelectable.default
    },
    methods: {
        addValue () {
            return store.dispatch('newStatement')
        },
        addRef() {
            return store.dispatch('newRef')
        },
        addGroup() {
            console.log("Adding grouping around " + store.getters.selected);
            store.commit('addGroup');
        },
        selectedGetter() { return store.selected; },
        selectedSetter(v) { store.commit('select', v); },
        selectingSetter(v) { store.commit('selecting', v); }
    },
    watch: {
        // 'engine.rootEnv.all_cells
        'engine.rootEnv.all_cells.length': {
            handler() {
                this.$nextTick(() => vueSelectable.setSelectableItems(this.$refs.app));
            },
            deep: true
        }
    }
});
