<template>
    <li class="list-group-item">
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

    },
    methods: {
        addCell: function(event: Event) {
            // todo: Vuex this
            // let c = new Cell("", "test", this.cellgroup.env, "hello");
            let c = this.cellgroup.env.createCell("", "test", "hello")
            c.parent_group = this.cellgroup;
            this.cellgroup.value.push(c);

        }
    }
});
</script>

<style>
</style>
