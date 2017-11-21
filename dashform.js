var globalStatements = [
    {name: 'field1', expression: '999', 'comment': 'First value'},
    {name: 'field2', expression: '50', 'comment': 'Second value'},
    {name: 'Average', expression: '= field1 + field2 + 3', 'comment': 'Average of the two values'},
]

var namespace = {}

for(var i = 0; i < )


function castNumber(value) {
    var num = Number(value);
    if(num === NaN) {return value}
    return num;
}

// Need to be able to store type hints like numbers - could show as a visual icon next to the interpreted version - string (abc) or number (123)

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

var app = new Vue({
    el: '#app',
    data: {
      statements: globalStatements
    },
    methods: {
        addStatement: function() {
            console.log("Adding statement");
            var name_exists = function(name){
                return name in namespace;
            }
            
            var get_next_name = function(namespace) {
                // Find the first unique name. 
                // Construct incrementally and skip any that exists.
                var length = globalStatements.length;
                for(var i = length; i < length * 2; i++){
                    var name = "field" + i;
                    if(!name_exists(name)){
                        return name;
                    }
                }
            }
            console.log("namespace is " + namespace);
            console.log(namespace);
            var field_name = get_next_name(namespace);
            var new_field = {
                name: field_name, 
                expression: '', 
                comment: ''
            }
            console.log(field_name);
            console.log(new_field);
            // namespace[field_name] = new_field;
            // this.statements[field_name] = new_field;
            // this.statements = namespace;
            globalStatements.push(new_field);
            namespace[field_name] = new_field
            console.log(this.statements);
        }
    }
})
