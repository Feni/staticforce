function castNumber(value: string) {
    var num = Number(value);
    if(num === NaN) {return value}
    return num;
}

function castBoolean(value: string) {
    if(value === 'true') return true;
    return false;
}

function generate_random_id(){
    // Source: S/O 105034 - Broofa
    // TODO: Replace with a more rigorous UID
    return 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}