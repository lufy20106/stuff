alert('Wel coems')
function add() {
    var num1 = parseFloat(document.getElementById("num1").value)
    var num2 = parseFloat(document.getElementById("num2").value)
    var result= num1 + num2
    document.getElementById("result").innerHTML = "Result: " + result
}
function subtract() {
    var num1 = parseFloat(document.getElementById("num1").value)
    var num2 = parseFloat(document.getElementById("num2").value)
    var result= num1 - num2
    document.getElementById("result").innerHTML = "Result: " + result
}
function multiply() {
    var num1 = parseFloat(document.getElementById("num1").value)
    var num2 = parseFloat(document.getElementById("num2").value)
    var result= num1 * num2
    document.getElementById("result").innerHTML = "Result: " + result
}
function divide() {
    var num1 = parseFloat(document.getElementById("num1").value)
    var num2 = parseFloat(document.getElementById("num2").value)
    if (num2 === 0) {
        document.getElementById("result").innerHTML = "Why 0"
    } else {
        var result = num1 / num2;
        document.getElementById("result").innerHTML = "Result: " + result
    }
}