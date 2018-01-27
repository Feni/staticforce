<template>
    <div v-bind:class="classObject" @mousedown="select" data-id="cell.id">
        <template v-if="isEdit">
            <span class="DataLabel">
                <input v-model="name" placeholder="Name..."/>
            </span>
            <span class="DataValue">
                <template v-if="isLargeItem">
                    <textarea v-model="expression" class="DataInput"></textarea>
                </template>
                <template v-else>
                    <input type="text" v-model="expression" class="DataInput" autofocus/>
                    
                    <template v-if="valIsGroup">
                        <Cell-List v-bind:cells="this.value"
                            v-bind:parent="this.value[0].parent_group"></Cell-List>
                    </template>
                    <template v-else>
                        <p>{{ formattedValue }}</p> &nbsp;
                    </template>
                        
                </template>
            </span>
        </template>
        <template v-else>
            <label class="DataLabel">{{ cell.name }}&nbsp;</label>

            <span class="DataValue">
                <template v-if="cell.type == 'object'" class="ui stackable grid SubObject">
                    <Statement v-for="statement in cell.value" :key="statement.id"
                            v-bind:cell="statement.cell"></Statement>
                </template>
                <div v-else>
                    <!-- Auto-reflow to next line due to div -->
                    <template v-if="valIsGroup">
                        <Cell-List v-bind:cells="this.value"
                            v-bind:parent="this.value[0].parent_group"></Cell-List>

                    </template>
                    <template v-else>
                        {{ formattedValue }} &nbsp;
                    </template>
                    
                </div>
            </span>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Cell} from "../engine";
import { isBoolean, isBigNum, isFormula, isEditMode } from "../utils";

export default Vue.component('Statement', {
    name: 'Statement',
    props: {
        'cell': {type: Cell}, 
        'selected': {type: Array}, 
        'selecting': {type: Array}, 
        'index': {type: Number}
    },
    computed: {
        expression: {
            // Convert to and from IDs to names.
            get: function() {
                // TODO: Escaping and unescaping references.
                let raw = this.cell.value;
                // /\[.*\]/ - false match for [hello] [world] as one token
                // \[[^\]]*\] - any char except closing bracket
                let re = /\[[^\]]*\]/g;
                var match;
                return this.cell.value
            },
            set: function(newValue: string) {
                this.cell.value = newValue;
            }
        },
        name: {
            get: function() : string {
                return this.cell.name
            }, 
            set: function(newName: string) {
                this.cell.rename(newName);
            }
        },
        value: function() : string {
            console.log("Statement get value " + this.cell);
            // return this.$store.getters.getValue(this.cell.id);
            return this.cell.evaluate()
        },
        isLargeItem: function() : boolean {
            // TODO: Check if text is long or not
            if(this.cell.type === "object"){
                return true;
            } else if(this.cell.type === "text" && this.cell.value.length > 100){
                return true;
            }
            // return false;
            return this.cell.value.toString().length > 50;
        },
        isEdit: function() : boolean {
            return isEditMode(this.selected, this.orderIndex)
        },
        orderIndex: function() : number {
            return this.cell.env.all_cells.indexOf(this.cell);
        },
        classObject: function() : object {
            // var typeClass = "DataType--" + this.cell.type;
            var typeClass = "DataType--" + this.valueType
            var cellClass = "CellType--" + this.cell.class_name;
            // this.index is relative within a group.
            let classes: {[index: string]: any} =  {
                "DataRow--large": this.isLargeItem,
                "edit": this.isEdit,
                "list-group-item": true,
                'selectable': this.selected !== undefined && this.selecting !== undefined,
                "selected": this.selected != undefined ? this.selected[this.orderIndex] : false,
                "selecting": this.selecting != undefined ? this.selecting[this.orderIndex] : false
            }
            classes[typeClass] = true;
            classes[cellClass] = true;
            return classes;
        },
        formattedValue: function() {
            console.log("Value is ")
            console.log(this.value)
            let val = this.value
            if(val !== undefined){
                // console.log("result is " + result);
                if(val.constructor.name == "Big"){
                    return val.toString().replace('"', "")
                } else if(isBoolean(val)) {
                    return this.value.toString().toUpperCase()
                }
            }
            console.log("default case")
            return val;
        },
        valueType: function(){
            let val = this.value;
            if(val != undefined) {
                if(isBoolean(val)){
                    return "boolean"
                }
                if(isBigNum(val)){
                    return "bignum"
                }
                if(Array.isArray(val)){
                    return "array"
                }
            }
            return "undefined"
        },
        valIsGroup: function() {
            return this.value != undefined && Array.isArray(this.value);
        },
        rawIsFormula: function() : boolean {
            return isFormula(this.cell.value)
        }
    },
    methods: {
        select: function(event: Event) {
            // console.log("Statement select")
            // @ts-ignore:
            if(this.isEdit) {
                // Hide this mousedown event from selector so our input boxes can be edited.
                event.stopPropagation();
            }
            console.log("Select event in Statement ");
            console.log(event);
        }
    },
    watch: {
        isEdit: function (val) {
            if(val) {
                let el = this.$el;
                // Wait till after element is added.
                setTimeout(function() {
                    el.querySelector('.DataValue .DataInput').focus();
                }, 100);
                
            }
       }
    }
});
</script>

<style>
</style>