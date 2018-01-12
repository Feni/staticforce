<template>
    <div v-bind:class="classObject" v-on:click="select">
            <label class="DataLabel">{{ cell.name }}</label>
            
            <span class="DataValue">
                <template v-if="isEdit">
                    <input type="text" v-model="cell.value" class="DataInput"/>
                    <p>{{ value }}</p>

                </template>
                <template v-else>
                    <template v-if="cell.type == 'object'" class="ui stackable grid SubObject">
                        <Statement v-for="statement in cell.value" :key="statement.id"
                                v-bind:cell="statement.cell"></Statement>
                    </template>
                    <div v-else>
                        <!-- Auto-reflow to next line due to div -->
                        {{ cell.value }}
                    </div>
                </template>

            </span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: 'Statement',
    props: ['cell', 'selected'],
    data: function() {
        return {
            edit: false
        }
    },
    computed: {
        value: function() {
            return this.$store.getters.getValue(this.cell.id);
        }, 
        isLargeItem: function() {
            // TODO: Check if text is long or not
            if(this.cell.type === "object"){
                return true;
            } else if(this.cell.type === "text" && this.cell.value.length > 100){
                return true;
            }
            return false;
        },
        isEdit: function(){
            return this.selected.indexOf(this.cell.id) !== -1;
        },
        classObject: function() {
            var typeClass = "DataType--" + this.cell.type;
            return {
                "DataRow--large": this.isLargeItem,
                "edit": this.isEdit,
                typeClass: true
            }
        }
    },
    methods: {
        select: function(event: Event) {
            console.log("Selecting item")
            console.log(event);

            this.$store.commit('select', this.cell);

            /*
            console.log("Clicked on row");
            console.log(this.id)
            console.log(this.edit);
            this.edit = true;
            window.dashform.$emit('clear-row-edit');
            let row = this;
            let clearCallback = function(e){
                console.log("Clearing row");
                console.log(e);
                row.edit = false;
                // Remove this handler
                window.dashform.removeEventListener('clear-row-edit', clearCallback);
            }
            window.dashform.$on('clear-row-edit', clearCallback)
            */
        }
        
    }
});
</script>

<style>
</style>
