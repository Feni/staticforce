// src/index.ts

import Vue from "vue";
import Vuex from 'vuex'
import { mapState } from 'vuex'
import {groupSelectionPolicy} from './utils'
import {Engine} from './engine'

var vueSelectable = require('vue-selectable');

let long_text = 'Hello {{ First_Name }} {{ Last_Name }}, this is Arevel, a modern programming language for the web. By running in the browser, we reduce the barrier to entry and increase adoption, creating a network effect that can leapfrog traditional languages.'

let ENGINE = new Engine();
ENGINE.rootEnv.createCell("expression", "Feni", "First_Name")
ENGINE.rootEnv.createCell("expression", "Varughese", "Last_Name")
ENGINE.rootEnv.createCell("text", long_text, "Introduction")


let t = ENGINE.rootEnv.createTable()
t.rename("Plan")
let tier = ENGINE.rootEnv.createGroup("Tier")
tier.addChild(ENGINE.rootEnv.createCell("", "Basic", "basic"))
tier.addChild(ENGINE.rootEnv.createCell("", "Medium", "medium"))
t.addChild(tier)

let expense = ENGINE.rootEnv.createGroup("Expense");
expense.addChild(ENGINE.rootEnv.createCell("", "5", "basic"))
expense.addChild(ENGINE.rootEnv.createCell("", "10", "basic"))
t.addChild(expense)
t.addChild(ENGINE.rootEnv.createCell("Income", "=expense * 2", "income"))
t.addChild(ENGINE.rootEnv.createGroup("Profit"))


ENGINE.rootEnv.createCell("text", "You can program like you would Excel. Start a cell with = to evaluate it.", "Basics")
ENGINE.rootEnv.createCell("", "= (1 + 1) * 2.5 ", "Arithmetic")

ENGINE.rootEnv.createCell("text", "Math operations are arbitrary precision without floating point errors (js or python would normally return 1.5000000000000002 rather than {{ PRECISE_MATH }}) .", "Precise")
ENGINE.rootEnv.createCell("", "= (0.1 + 0.2) * Arithmetic ", "Precise_Math")
ENGINE.rootEnv.createCell("expression", "=true or false", "Boolean_Ops")

ENGINE.rootEnv.createCell("text", "You can also operate directly on arrays. Suppose we have an array of pricing tiers.", "")

let prices = ENGINE.rootEnv.createGroup();
prices.rename("prices")
prices.addChild(ENGINE.rootEnv.createCell("text", "0", "Free"))
prices.addChild(ENGINE.rootEnv.createCell("text", "30", "Basic"))
prices.addChild(ENGINE.rootEnv.createCell("text", "99", "Professional"))
prices.addChild(ENGINE.rootEnv.createCell("text", "450", "Small_Business"))
ENGINE.rootEnv.createCell("expression", "=prices * 1.05", "With_Taxes")

ENGINE.rootEnv.createCell("expression", "=1000, 100, 10, 1", "customers")

ENGINE.rootEnv.createCell("expression", "=With_Taxes * customers * 12", "Yearly_Revenue")
ENGINE.rootEnv.createCell("text", "Which array cells have more than 10k in yearly revenue", "")
ENGINE.rootEnv.createCell("expression", "=Yearly_Revenue > 10000", "Revenue_check")
ENGINE.rootEnv.createCell("expression", "=With_Taxes < 100", "Price_check")
ENGINE.rootEnv.createCell("text", "You can also filter by that", "")
ENGINE.rootEnv.createCell("expression", "=YEARLY_REVENUE where REVENUE_CHECK and PRICE_CHECK", "Best_Tier")




let names = ENGINE.rootEnv.createGroup();
names.rename("names")
names.addChild(ENGINE.rootEnv.createCell("text", "Aravor", ""))
names.addChild(ENGINE.rootEnv.createCell("text", "Arrety", ""))
names.addChild(ENGINE.rootEnv.createCell("text", "Protopus", ""))
names.addChild(ENGINE.rootEnv.createCell("text", "Senety", ""))
names.addChild(ENGINE.rootEnv.createCell("text", "Statary", ""))
names.addChild(ENGINE.rootEnv.createCell("text", "Topiate", ""))
names.addChild(ENGINE.rootEnv.createCell("text", "Topiicon", ""))

ENGINE.rootEnv.createCell("expression", "Some potential names for this: {{ names }}. ", "Generated_names")


let todo = ENGINE.rootEnv.createGroup();
todo.rename("TODO")
todo.addChild(ENGINE.rootEnv.createCell("text", "Common Functions", ""))
todo.addChild(ENGINE.rootEnv.createCell("text", "Pattern matching system for conditionals", ""))
todo.addChild(ENGINE.rootEnv.createCell("text", "Tables & queries", ""))
todo.addChild(ENGINE.rootEnv.createCell("text", "Declarative UI Componenets", ""))
todo.addChild(ENGINE.rootEnv.createCell("text", "Import/Export", ""))
todo.addChild(ENGINE.rootEnv.createCell("text", "Ability to call APIs", ""))
todo.addChild(ENGINE.rootEnv.createCell("text", "Entire backend", ""))
todo.addChild(ENGINE.rootEnv.createCell("text", "So much more!", ""))




// ENGINE.rootEnv.createCell("text", "You can also operate directly on arrays. Consider the following generated names for this language.", "")
// ENGINE.rootEnv.createCell("expression", "=grp > 25", "boolean")
// ENGINE.rootEnv.createCell("expression", "false", "main")

// let other = ENGINE.rootEnv.createGroup();
// other.rename("other")
// other.addChild(ENGINE.rootEnv.createCell("text", "1", ""))
// other.addChild(ENGINE.rootEnv.createCell("text", "2", ""))

// let f = ENGINE.rootEnv.createFunction();



Vue.use(Vuex)

window.evalDepth = 0;

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
            return result
        }
    },
    mutations: {
        addStatement(state, payload) {
            let c = state.engine.rootEnv.createCell(payload["type"], payload["value"], payload["name"])
            window.lastAddedIndex = state.engine.rootEnv.all_cells.indexOf(c);
        },
        addRef(state, payload) {
            console.log('adding ereference ' + payload);
        },
        addGroup(state, payload) {
            state.engine.rootEnv.createGroup();
        },
        select(state, payload){
            // state.selected = payload
            state.selected = groupSelectionPolicy(payload, state.engine.rootEnv.all_cells);
        },
        selecting(state, payload){
            // state.selecting = payload
            state.selecting = groupSelectionPolicy(payload, state.engine.rootEnv.all_cells);
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
                name: "",
                value: ""
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
import Group from "./components/Group.vue";
import CellList from "./components/CellList.vue";
import CellFunc from "./components/CellFunc.vue";
import CellTableView from "./components/CellTableView.vue";


import vSelect from 'vue-select'
Vue.component('v-select', vSelect)


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
        Statement, 
        Group,
        CellList,
        CellFunc,
        CellTableView
    },
    directives: { 
        selectable: vueSelectable.default
    },
    methods: {
        addValue () {
            console.log("Adding value method");
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
                // console.log("Refreshing selectable");
                this.$nextTick(() => {
                    vueSelectable.setSelectableItems(this.$refs.app)
                    // .querySelector('.DataValue .DataInput').focus();
                    if(window.lastAddedIndex != undefined) {
                        window.dashform.selected[window.lastAddedIndex] = true;
                    }
                    
                });
            },
            deep: true
        }
    }
});
