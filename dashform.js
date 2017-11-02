$('.ui.dropdown').dropdown();


Vue.component('statement-row', {
    template: `
    <div class="row DataRow">
        <div class="four wide column">
            <label class="DataLabel">{{ name }}</label>
        </div>
        
        <div class="eight wide column">
            <input type="text" v-model="expression" class="DataInput"/>

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
`,
    props: ['name', 'expression', 'comment'],
    computed: {
        value: function() {
            
            if(this.expression[0] == "="){
                // Evaluate expression
                
                // Source : https://github.com/soney/jsep/blob/master/test/tests.js 
                var binops = {
                    "+" : function(a, b) { return a + b; },
                    "-" : function(a, b) { return a - b; },
                    "*" : function(a, b) { return a * b; },
                    "/" : function(a, b) { return a / b; },
                    "%" : function(a, b) { return a % b; }
                };
                var unops = {
                    "-" : function(a) { return -a; },
                    "+" : function(a) { return -a; }
                };

                var do_eval = function(node) {
                    if(node.type === "BinaryExpression") {
                        return binops[node.operator](do_eval(node.left), do_eval(node.right));
                    } else if(node.type === "UnaryExpression") {
                        return unops[node.operator](do_eval(node.argument));
                    } else if(node.type === "Literal") {
                        return node.value;
                    }
                };
                return do_eval(jsep(this.expression.substring(1)));
                
            } else {
                return this.expression;
            }

        }
    }
})


var app = new Vue({
    el: '#app',
    data: {
    message: 'Hello Vue!',
      statements: [
          {name: 'field1', expression: '$999', 'comment': 'First value'},
          {name: 'field2', expression: '50', 'comment': 'Second value'},
          {name: 'Average', expression: '= 1 + 1', 'comment': 'Average of the two values'},
      ]
  }
})
