//Extract by id from todo.html

var todoInput = document.getElementById("input");
var todoAddButton = document.getElementById("add");
var todoList = document.getElementById("todoList");

//Add event listener to button
todoAddButton.addEventListener("click",function(){

    //Get the value from input
    var data = todoInput.value;
    var completed = false;
    //Generate Random Id
     var id = Date.now().toString()
     let task={data,id,completed};
    if(data===""||data===null||data===undefined){
        alert("Please enter a task");
        return;
    }
    // todo={data}
    fetch("/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      }).then(function (response) {
        if (response.status === 200) {
            showYourTodo(task);
          // display todo in UI
      alert("Successfull");
       
        } 
        else if(response.status===401){
            window.location.href = "/login";
        }
        else {
          alert("something weird happened");
        }
      });
    });
    fetch("/onRefreshSavedTodoData").then(
        function(response){
            if(response.status===200){
               return response.json()
            }
            else{
                alert("something weird happened");
            }
            })
            .then(function (todos) {
                console.log(todos)
                todos.forEach(function (todo) {
                    showYourTodo(todo);
                    }
                );
            });


function showYourTodo(task){

    var todoItem = document.createElement("li");
    //Add delete button
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.marginLeft = "10px";
    checkbox.style.marginRight = "10px";
    checkbox.style.cursor = "pointer";
    checkbox.style.fontSize = "15px";
    checkbox.style.fontWeight = "bold";
    checkbox.style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,0.75)";
    

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.style.backgroundColor = "red";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "5px";
    deleteButton.style.borderRadius = "5px";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.marginLeft = "10px";
    deleteButton.style.marginRight = "10px";
    deleteButton.style.fontSize = "15px";
    deleteButton.style.fontWeight = "bold";
    deleteButton.style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,0.75)";

    var todoSpan = document.createElement("span");
    // Task added to the html
    todoSpan.innerText ="Task: "+task.data;

    //do some styling
    todoItem.style.display = "flex";
    todoItem.style.justifyContent = "space-between";
   
    todoItem.style.border = "1px solid black";
    todoItem.style.padding = "10px";
    todoItem.style.width = "300px";
    todoItem.style.borderRadius = "5px";
    todoItem.style.alignItems = "center";
    todoItem.style.fontSize = "20px";
    todoItem.style.fontWeight = "bold";
    todoItem.style.color = "black";
    todoItem.style.backgroundColor = "white";
    todoItem.style.boxShadow = "0px 0px 10px 0px rgba(0,0,0,0.75)";
    todoItem.style.textTransform = "capitalize";
    todoItem.style.fontFamily = "sans-serif";
    todoItem.style.position = "relative";
    todoItem.style.overflow = "hidden";
    todoItem.style.cursor = "pointer";
    todoItem.style.transition = "all 0.5s ease-in-out";
    todoItem.style.wordBreak = "break-all";
    todoItem.style.wordWrap = "break-word";
    todoItem.style.whiteSpace = "pre-wrap";
    todoItem.style.textAlign = "center";
    todoItem.style.textDecoration = "none";
    todoItem.style.textDecorationColor = "black";
    todoItem.style.textDecorationThickness = "3px";
    todoItem.style.textDecorationStyle = "solid";
    todoItem.style.textDecorationLine = "none";
    todoItem.style.textDecorationSkipInk = "none";
    todoItem.style.textEmphasis = "none";
    todoItem.style.textEmphasisColor = "black";
    todoItem.style.textEmphasisStyle = "none";
    todoItem.style.textEmphasisPosition = "none";
    todoItem.style.textIndent = "0px";
    todoItem.style.textOrientation = "mixed";
    todoItem.style.textOverflow = "clip";
    todoItem.style.textRendering = "auto";
    todoItem.style.textShadow = "none";
    todoItem.style.textSizeAdjust = "auto";
    todoItem.style.textUnderlinePosition = "auto";
//create div element for todo List
   
   todoItem.appendChild(todoSpan);
   todoItem.appendChild(checkbox)
   todoItem.appendChild(deleteButton);
    todoList.appendChild(todoItem);
    todoInput.value = "";

    //Add event listener to delete button
    deleteButton.addEventListener("click", function () {
        console.log("Hey",task.id);
        todoItem.remove();
        deleteElementByIdOnServer(task.id);
    });
    //Add event listener to checkbox
    checkbox.addEventListener("change",function(){
        todoSpan.style.textDecorationLine="line-through";
        if(checkbox.checked){
            updateTaskCompletionOnServer(task.id,true);
            checkbox.disabled=true;
            checkbox.style.cursor="not-allowed";
            
        }

    })
    if(task.completed===true){
        todoSpan.style.textDecorationLine="line-through";
        checkbox.disabled=true;
        checkbox.style.cursor="not-allowed";
        checkbox.checked=true;
    }

}
function updateTaskCompletionOnServer(taskId,completed){ 
    fetch(`/updateTaskCompletion/${taskId}`, {
        method:"PATCH",
        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({completed}),
    })
    .then(function(response){

        if(response.status===200){
            return response.json()
        }
        else if(response.status===401){
            window.location.href = "/login";
        }
        else{
            alert("something weird happened");
        }
    })

}                                                                                                   

function deleteElementByIdOnServer(taskId){

    fetch(`/todoDelete/${taskId}`, {
        method:"DELETE",
       
       
    }).then(
        function(response){
            if(response.status===200){
               return response.json()
            }
            else if(response.status===401){
                window.location.href = "/login";
            }
            else{
                alert("something weird happened");
            }
            })
        }
           
//Add event listener to delete button
// var todoDeleteButton = document.getElementById("deletetask");
// var deleteTask=document.getElementById("delete");
// todoDeleteButton.addEventListener("click",function(){
// var todoDeleteTaskValue=deleteTask.value;
// var todoDeleteTaskValue1={todoDeleteTaskValue};
// if(todoDeleteTaskValue===""||todoDeleteTaskValue===null||todoDeleteTaskValue===undefined){
//     alert("Please enter a task number");
//     return;
// }
// console.log(todoDeleteTaskValue1);

// fetch("/todoDelete", {  
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     body: JSON.stringify(todoDeleteTaskValue1),
// }).then(
//     function(response){
//         if(response.status===200){
//            return response.json()
//         }
//         else if(response.status===401){
//             window.location.href = "/login";
//         }
//         else{
//             alert("something weird happened");
//         }
//         })
//         .then(function (todos) {
//             console.log(todos)
//             todoList.innerHTML = '';
//             todos.forEach(function (todo) {
//                 showYourTodo(todo.data);
//                 }
//             );
//           });

// })
            