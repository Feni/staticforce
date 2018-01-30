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


        <v-select v-model="cellfunc.func" :options="available_functions"></v-select>

        <p>{{ func }}</p>

        <label class="DataLabel">Number</label>
        <input class="DataInput" placeholder="Number to square root"/>


        <Cell-List v-bind:cells="cellfunc.value"
            v-bind:selected="selected"
            v-bind:selecting="selecting"
            v-bind:isroot="false"></Cell-List>

        <div class="alert alert-danger CellError" role="alert" v-for="error in cellfunc.errors">
              <i class="fas fa-exclamation-triangle"></i> &nbsp; {{error}}
        </div>
    </li>
</template>

<script lang="ts">
import Vue from "vue";
import {CellFunction, Cell} from "../engine";
import {isEditMode } from "../utils";
import {BUILTIN_FUN } from "../expr";

export default Vue.component('CellFunc', {
    name: 'CellFunc',
    props: {
        'cellfunc': {type: CellFunction}, 
        'selected': {type: Array}, 
        'selecting': {type: Array},
        'index': {type: Number}
    },
    computed: {
        name: {
            get: function() : string {
                return this.cellfunc.name
            }, 
            set: function(newName: string) {
                this.cellfunc.rename(newName);
            }
        },
        classObject: function() : object {
            let realIndex = this.cellfunc.env.all_cells.indexOf(this.cellfunc);
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
            return this.cellfunc.env.all_cells.indexOf(this.cellfunc);
        },
        func: function() : object {
            return BUILTIN_FUN[this.cellfunc.func]
        },
        available_functions: function() {
            return Object.keys(BUILTIN_FUN)
            // return ["hello", "world"]
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
        destruct: function() {
            this.cellfunc.destruct();
        }
    },
    watch: {
      isEdit: function (val) {
         if(val) {
             let el = this.$el;
             // Wait till after element is added.
             /* 
             setTimeout(function() {
                let input = el.querySelector('input');
                if(input != undefined && input != null){
                    input.focus();
                }
             }, 100);
             */
         }
       }
    }   
});
</script>

<style>
</style>
