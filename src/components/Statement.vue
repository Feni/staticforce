<template>
    <div v-bind:class="classObject" v-on:click="select">    
        <template v-if="isEdit">
            <span class="DataLabel">
                <input v-model="name"/>
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

            <label class="DataLabel">{{ cell.name }}</label>

            <span class="DataValue">

                <template v-if="cell.type == 'object'" class="ui stackable grid SubObject">
                    <Statement v-for="statement in cell.value" :key="statement.id"
                            v-bind:cell="statement.cell"></Statement>
                </template>
                <div v-else>
                    <!-- Auto-reflow to next line due to div -->
                    {{ value }}
                </div>
            </span>
        </template>
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
            set: function(newValue) {
                this.cell.value = newValue;
            }
        },
        name: {
            get: function() {
                return this.cell.name
            }, 
            set: function(newName: string) {
                this.cell.rename(newName);
            }
        },
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
            // return false;
            return this.cell.value.length > 50;
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
