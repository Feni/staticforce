<template>
    <div class="row DataRow">
        <div class="four wide column">
            <label class="DataLabel">{{ meta.name }}</label>
        </div>
        
        <div class="eight wide column">
            <input type="text" v-model="data.value" class="DataInput"/>
            
            
            <p v-if="datatype == 'equation'">{{ value }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    props: ['id', 'meta', 'datatype', 'data'],
    computed: {
        value: function() {
            // The view should not have to worry about the data evaluation. 
            // That should be taken care of at the vuex layer.
            if(this.datatype == "equation"){
                return this.data.expression;
            }
            return this.data.value;
        }
    }
});
</script>

<style>
</style>
