<template>
    <div class="row DataRow" v-on:click="select">
        <div class="two wide column">
            <label class="DataLabel">{{ meta.name }}</label>
        </div>
        
        <div class="eight wide column">
            <!-- TODO: Align right on numbers. Dynamic input type -->
            <div class="edit" v-if="edit">
                
                <input type="text" v-model="data.value" class="DataInput"/>
                <p v-if="datatype == 'equation'">{{ value }}</p>
                
            </div>
            <div class="view" v-else>
            
                <div v-if="datatype == 'object'">
                    
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
        </div>
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
