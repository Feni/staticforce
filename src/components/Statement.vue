<template>
    <div class="ui flexible grid">
    <div class="row DataRow" v-on:click="select">
        <template v-if="isLargeItem">
            <div class="eleven wide column">
                <label class="DataLabel">{{ cell.name }}</label>
                
                <div v-if="cell.type == 'object'" class="ui stackable grid SubObject">

                    <Statement v-for="statement in cell.value" :key="statement.id"
                           v-bind:cell="statement.cell"></Statement>


                    </div>
                    <div v-else>
                        {{ cell.value }}
                    </div>
            </div>
        </template>
        <template v-else>
            <div class="three wide column">
                <label class="DataLabel">{{ cell.name }}</label>
            </div>

            <div class="eight wide column">
                <!-- TODO: Align right on numbers. Dynamic input type -->
                <div class="edit" v-if="isEdit">
                    <input type="text" v-model="cell.value" class="DataInput"/>
                    <p v-if="cell.type == 'equation'">{{ value }}</p>
                </div>
                <div class="view" v-else>
                    {{ cell.value }}
                </div>
            </div>
        </template>
    </div>

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
            return this.$store.getters.getValue(this.cell.id)
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
