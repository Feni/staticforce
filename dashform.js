$('.ui.dropdown').dropdown();



var namespace = {
    'field1': {name: 'field1', expression: '$999', 'comment': 'First value'},
    'field2': {name: 'field2', expression: '50', 'comment': 'Second value'},
    'field3': {name: 'Average', expression: '= 1 + 1', 'comment': 'Average of the two values'},
}

function castNumber(value) {
    var num = Number(value);
    if(num === NaN) {return value}
    return num;
}

function evaluateExpression(expression){
    if(expression[0] == "="){
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
                // console.log("literal ")
                // console.log(node)
                return castNumber(node.value);
            } else {
                // Node.type == Identifier
                // Name lookup
                if(node.name in namespace){
                    // console.log("name found " + node.name)
                    // TODO: Cycle detection and termination
                    return evaluateExpression(namespace[node.name].expression)
                } else {
                    // console.log("unknown token ")
                    // console.log(node.name)
                }
                // console.log("else ")
                // console.log(node)
            }
        };
        return do_eval(jsep(expression.substring(1)));
    } else {
        return castNumber(expression);
    }    
}


Vue.component('statement-row', {
    template: `
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
`,
    props: ['statement', 'name', 'expression', 'comment'],
    computed: {
        value: function() {
            return evaluateExpression(this.statement.expression)
        }
    }
})


var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      statements: namespace
  }
})
