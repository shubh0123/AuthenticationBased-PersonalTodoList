window.addEventListener("beforeunload", function (event) {
    this.document.getElementById("error").innerHTML = "";
});