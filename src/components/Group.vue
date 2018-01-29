<template>
    <li v-bind:class="classObject" @mousedown="select" >
        <template v-if="isEdit">
            <button type="button" class="close" aria-label="Close" v-on:click="destruct">
                <span aria-hidden="true">&times;</span>
            </button>


            <input class="DataLabel" v-model="name" placeholder="Name..."/>
        </template>
        <template v-else>
            <label class="DataLabel">{{ name }}&nbsp;</label>
        </template>

        <Cell-List v-bind:cells="cellgroup.value"
            v-bind:onadd="addCell"
            v-bind:selected="selected"
            v-bind:selecting="selecting"
            v-bind:isroot="false"></Cell-List>
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
        name: {
            get: function() : string {
                return this.cellgroup.name
            }, 
            set: function(newName: string) {
                this.cellgroup.rename(newName);
            }
        },
        classObject: function() : object {
            let realIndex = this.cellgroup.env.all_cells.indexOf(this.cellgroup);
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
            return this.cellgroup.env.all_cells.indexOf(this.cellgroup);
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
        addCell: function(event: Event) {
            // todo: Vuex this
            // let c = new Cell("", "test", this.cellgroup.env, "hello");
            let c = this.cellgroup.env.createCell("", "", "")
            this.cellgroup.addChild(c);
            window.lastAddedIndex = this.cellgroup.env.all_cells.indexOf(c);
        },
        destruct: function() {
            this.cellgroup.destruct();
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
