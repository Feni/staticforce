<template>
    <li class="list-group-item">
        <h5 class="mb-1">Group {{ cellgroup.name }}</h5>
        

        <ul class="list-group">
        <li class="list-group-item justify-content-between selectable">
            Cras justo odio
            <span class="badge badge-default badge-pill ">14</span>
        </li>
        <li class="list-group-item justify-content-between selectable">
            Dapibus ac facilisis in
            <span class="badge badge-default badge-pill">2</span>
        </li>
        <li class="list-group-item justify-content-between selectable">
            Morbi leo risus
            <span class="badge badge-default badge-pill">1</span>
        </li>

          <a href="#" class="list-group-item list-group-item-action list-group-item-success">Add Item</a>
        </ul>
        
        <Cell-List v-bind:cells="cellgroup.value"
            v-bind:onadd="addCell"
            v-bind:selected="selected"
            v-bind:selecting="selecting"
            ></Cell-List>


    </li>
</template>

<script lang="ts">
import Vue from "vue";
import {CellGroup} from "../engine";

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

        }
    }
});
</script>

<style>
</style>
