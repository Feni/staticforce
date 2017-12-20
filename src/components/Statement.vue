<template>
    <div class="row DataRow" v-on:click="select">
        
        <template v-if="isLargeItem">
            <div class="eleven wide column">
                <label class="DataLabel">{{ meta.name }}</label>
                
                
                <div v-if="datatype == 'object'" class="ui stackable grid SubObject">

                    <Statement v-for="statement in data.value" :key="statement.id"
                           v-bind:id="statement.id"
                           v-bind:meta="statement.meta"
                           v-bind:datatype="statement.datatype"
                           v-bind:data="statement.data"></Statement>


                    </div>
                    <div v-else>
                        {{ data.value }}
                    </div>
            </div>
        </template>
        <template v-else>
            <div class="three wide column">
                <label class="DataLabel">{{ meta.name }}</label>
            </div>

            <div class="eight wide column">
                <!-- TODO: Align right on numbers. Dynamic input type -->
                <div class="edit" v-if="edit">

                    <input type="text" v-model="data.value" class="DataInput"/>
                    <p v-if="datatype == 'equation'">{{ value }}</p>
                </div>
                <div class="view" v-else>
                    {{ data.value }}
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: 'Statement',
    props: ['id', 'meta', 'datatype', 'data'],
    data: function() {
        return {
            edit: false
        }
    },
    computed: {
        value: function() {
            return this.$store.getters.getValue(this.id)
        }, 
        isLargeItem: function() {
            // TODO: Check if text is long or not
            if(this.datatype === "object"){
                return true;
            } else if(this.datatype === "text" && this.data.value.length > 100){
                return true;
            }
            return false;
        }
    },
    methods: {
        select: function(event) {
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
