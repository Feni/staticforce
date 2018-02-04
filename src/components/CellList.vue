<template>
    <ul class="list-group">
        <template v-for="statement, index in cells">
            <template v-if="(isroot == true && statement.parent_group == undefined) || (isroot !== true)">
                <template v-if="statement.class_name == 'cellgroup'">
                    <Group :key="statement.id"
                    v-bind:cellgroup="statement"
                    v-bind:index="index"
                    v-bind:selected="selected"
                    v-bind:selecting="selecting"
                    ></Group>
                </template>
                <template v-else-if="statement.class_name == 'cellfunction'">
                    <CellFunc :key="statement.id"
                    v-bind:cellfunc="statement"
                    v-bind:index="index"
                    v-bind:selected="selected"
                    v-bind:selecting="selecting"
                    ></CellFunc>
                </template>
                <template v-else>
                    <Statement 
                        :key="statement.id"
                        v-bind:cell="statement"
                        v-bind:index="index"
                        v-bind:selected="selected"
                        v-bind:selecting="selecting"
                    ></Statement>
                    
                </template>
            </template>
        </template>
        <template v-if="onadd !== undefined">
            <a class="list-group-item list-group-item-action AddItem" @mousedown="addNewCell">
                <i class="fas fa-plus"></i>
                Add Item
                </a>
        </template>


    </ul>
</template>

<script lang="ts">
import Vue from "vue";
import Statement from "./components/Statement.vue";
import Group from "./components/Group.vue";


// import {CellGroup} from "../engine";

export default Vue.component('Cell-List', {
    name: 'Cell-List',
    props: {
        'cells': {type: Array}, 
        'onadd': {type: Function},
        'selected': {type: Array},
        'selecting': {type: Array},
        'isroot': {type: Boolean}
    },
    computed: {

    },
    methods: {
        addNewCell: function(event: Event) {
            console.log("Adding cell in cellist")
            this.onadd();
        }
    }
});
</script>

<style>
</style>
