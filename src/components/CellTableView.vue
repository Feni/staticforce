<template>
    <li v-bind:class="classObject" @mousedown="select" >
        <template v-if="isEdit">
            <button type="button" class="close" aria-label="Close" v-on:click="destruct">
                <span aria-hidden="true">&times;</span>
            </button>


            <input maxlength="20" class="DataLabel" v-model="name" placeholder="Name..."/>
        </template>
        <template v-else>
            <label class="DataLabel">{{ name }}&nbsp;</label>
        </template>




        <table class="table">
        <thead>
            <tr>
                <th>#</th>
                <th scope="col" v-for="column in cell.value" :key="column.id">{{ column.name }}</th>
            </tr>
        </thead>
        <tbody>

            <tr v-for="(row, rowindex) in cell.getRows()">
                <th scope="row">{{ rowindex + 1 }} </th>
                <td v-for="rowcell in row">
                    <template v-if="rowcell === undefined">
                        &nbsp;
                    </template>
                    <template v-else>
                        {{ rowcell.value }}
                    </template>
                </td>
            </tr>
        </tbody>
        </table>




        <Cell-List v-bind:cells="cell.value"
            v-bind:onadd="addRow"
            v-bind:selected="selected"
            v-bind:selecting="selecting"
            v-bind:isroot="false"></Cell-List>


        <div class="alert alert-danger CellError" role="alert" v-for="error in cell.errors">
              <i class="fas fa-exclamation-triangle"></i> &nbsp; {{error}}
        </div>

    </li>
</template>

<script lang="ts">
import Vue from "vue";
import {CellTable, Cell} from "../engine";
import {isEditMode } from "../utils";

export default Vue.component('CellTableView', {
    name: 'CellTableView',
    props: {
        'cell': {type: CellTable}, 
        'selected': {type: Array}, 
        'selecting': {type: Array},
        'index': {type: Number}
    },
    computed: {
        name: {
            get: function() : string {
                return this.cell.name
            }, 
            set: function(newName: string) {
                this.cell.rename(newName);
            }
        },
        classObject: function() : object {
            let realIndex = this.orderIndex;
            let classes: {[index: string]: any} =  {
                "list-group-item": true,
                "selectable": this.selected !== undefined && this.selecting !== undefined,
                "selected": this.selected ? this.selected[realIndex] : false,
                "selecting": this.selecting ? this.selecting[realIndex] : false,
                "DataGroup": true
            }
            return classes;
        }, 
        isEdit: function() : boolean {
            return isEditMode(this.selected, this.orderIndex)
        },
        orderIndex: function() : number {
            return this.cell.env.all_cells.indexOf(this.cell);
        }
    },
    methods: {
        select: function(event: Event) {
            // @ts-ignore:
            if(this.isEdit) {
                // Hide this mousedown event from selector so our input boxes can be edited.
                event.stopPropagation();
            }
        },
        addRow: function(event: Event) {

        },
        addColumn: function(event: Event) {

        },
        destruct: function() {
            this.cell.destruct();
        }
    },
    watch: {
      isEdit: function (val) {
         if(val) {
             let el = this.$el;
             // Wait till after element is added.
             setTimeout(function() {
                let input = el.querySelector('input');
                if(input != undefined && input != null){
                    input.focus();
                }
             }, 100);
             
         }
       }
    }   
});
</script>

<style>
</style>
