<template>
    <div v-bind:class="classObject" @mousedown="select">
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
                    <p>{{ value }}</p>
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
                    {{ value }} &nbsp;
                </div>
            </span>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Cell} from "../engine";

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
                // window.test_re = re;
                // window.test_raw = raw; 
                // console.log(window.test_result);
                // console.log("m1 " + re.exec(raw));
                // console.log("m2 " + re.exec(raw));
                /*
                do {
                    match = re.exec(raw);
                    if (match) {
                        console.log(match)
                        console.log(match[1], match[2]);
                    }
                 } while (match); */
                
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
            return this.$store.getters.getValue(this.cell.id);
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
            // Not in edit mode when multiple items are selected.
            // Micro optimization - terminate early without all count.
            return this.selected[this.index] == true && this.selected.filter(t => t == true).length == 1
        },
        classObject: function() : object {
            var typeClass = "DataType--" + this.cell.type;
            var cellClass = "CellType--" + this.cell.class_name;
            let classes: {[index: string]: any} =  {
                "DataRow--large": this.isLargeItem,
                "edit": this.isEdit,
                "list-group-item": true,
                'selectable': true,
                "selected": this.selected[this.index],
                "selecting": this.selecting[this.index]
            }
            classes[typeClass] = true;
            classes[cellClass] = true;
            return classes;
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
    }
});
</script>

<style>
</style>
