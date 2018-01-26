<template>
    <li v-bind:class="classObject">
        <h5 class="mb-1">Group {{ cellgroup.name }}</h5>

        <Cell-List v-bind:cells="cellgroup.value"
            v-bind:onadd="addCell"
            v-bind:selected="selected"
            v-bind:selecting="selecting"
            v-bind:parent="cellgroup"
            ></Cell-List>


    </li>
</template>

<script lang="ts">
import Vue from "vue";
import {CellGroup, Cell} from "../engine";

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
        }
    },
    methods: {
        addCell: function(event: Event) {
            // todo: Vuex this
            // let c = new Cell("", "test", this.cellgroup.env, "hello");
            let c = this.cellgroup.env.createCell("", "test", "hello")
            this.cellgroup.addChild(c);
        }
    }
});
</script>

<style>
</style>
