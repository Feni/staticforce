<template>
    <div class="row DataRow">
        <div class="four wide column">
            <label class="DataLabel">{{ name }}</label>
        </div>
        
        <div class="eight wide column">
            <input type="text" v-model="statement.expression" class="DataInput"/>

            <div class="ui icon top left pointing dropdown button DataOptions" tabindex="0">
                <i class="wrench icon"></i>
                <div class="menu transition hidden" tabindex="-1">
                  <div class="item">Add Constraint</div>
                  <div class="ui divider"></div>
                  <div class="item">Delete</div>
                </div>
            </div>

            <p>{{ value }}</p>
        </div>

        <div class="four wide column">
            <p>{{ comment }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    props: ['statement', 'name', 'expression', 'comment'],
    computed: {
        value: function() {
            // return evaluateExpression(this.statement.expression)
            return this.statement.expression;
        }
    }
});
</script>

<style>
</style>
