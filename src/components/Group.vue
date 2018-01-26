<template>
    <li v-bind:class="classObject">

        <template v-if="isEdit">
            <input class="mb-1" v-model="cellgroup.name" placeholder="Name..."/>
        </template>
        <template v-else>
            <h5 class="mb-1">{{ cellgroup.name }}</h5>
        </template>

        <Cell-List v-bind:cells="cellgroup.value"
            v-bind:onadd="addCell"
            v-bind:selected="selected"
            v-bind:selecting="selecting"
            v-bind:parent="cellgroup"></Cell-List>
    </li>
</template>

<script lang="ts">
import Vue from "vue";
import {CellGroup, Cell} from "../engine";
import {isEditMode } from "../utils";

export default Vue.component('Group', {
    name: 'Group',
    props: {
        'cellgroup': {type: CellGroup}, 
        'selected': {type: Array}, 
        'selecting': {type: Array},
        'index': {type: Number}
    },
    computed: {
        classObject: function() : object {
            let realIndex = this.cellgroup.env.all_cells.indexOf(this.cellgroup);
            let classes: {[index: string]: any} =  {
                "list-group-item": true,
                'selectable': true,
                "selected": this.selected[realIndex],
                "selecting": this.selecting[realIndex]
            }
            console.log("group class")
            return classes;
        }, 
        isEdit: function() : boolean {
            return isEditMode(this.selected, this.orderIndex)
        },
        orderIndex: function() : number {
            return this.cellgroup.env.all_cells.indexOf(this.cellgroup);
        }
    },
    methods: {
        addCell: function(event: Event) {
            // todo: Vuex this
            // let c = new Cell("", "test", this.cellgroup.env, "hello");
            let c = this.cellgroup.env.createCell("", "", "")
            this.cellgroup.addChild(c);
        }
    },
    watch: {
      isEdit: function (val) {
         if(val) {
             let el = this.$el;
             // Wait till after element is added.
             setTimeout(function() {
                el.querySelector('input').focus();
             }, 100);
             
         }
       }
    }   
});
</script>

<style>
</style>
