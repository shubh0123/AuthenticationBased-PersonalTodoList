const express=require("express");
const app=express();
const fs=require("fs");
const path=require("path");
var session = require('express-session')//session is used to store the data of the user in the server side and session id is stored in the cookie of the browser



app.use(session({
    secret: 'radhikaNatu',
    resave: false,
    saveUninitialized: true,
  }))
app.set('views', path.join(__dirname, 'views'));//setting views directory for ejs files 
app.set('view engine', 'ejs');//setting view engine as ejs
app.use(express.json());//middleware to parse json data from request body to req.body object
app.use(express.urlencoded(//middleware to parse url encoded data from request body to req.body object 
    {extended:true}//extended:true is used to parse nested objects 
    ));
app.get("/script",(req,res)=>{
    
    res.sendFile(__dirname+"/public/script/script.js");
});

    app.get("/",(req,res)=>{
        if(req.session.isLoggedIn){
            res.render("index",{user:req.session.user});
        }
        else{
            res.render("index",{user:null});
        }
    });
    app.get("/login",(req,res)=>{

        if(req.session.isLoggedIn){

            res.redirect("/todo");
            return;
        }
        res.render("login",{error:null});
    })
    app.get("/signup",(req,res)=>{
        if(req.session.isLoggedIn){
            res.redirect("/todo");
            return;
        }
        res.render("signup",{error:null});
    })

    app.post("/signup",(req,res)=>{
        if(req.session.isLoggedIn){
            res.redirect("/todo");
            return;
        }
        console.log(req.body);
        const email=req.body.email;
        const password=req.body.password;
        const name=req.body.name;
        const user= {email,password,name};
        saveDetails(user,(err)=>{
            if(err){
                console.log(err);
                res.render("signup",{error:err});
               
            }
            else{
                res.status(200);
                res.redirect("/login");
            }
        });
    })
    app.post("/login",(req,res)=>{
    if(req.session.isLoggedIn){
        res.redirect("/todo");
        return;
    }

        const email=req.body.email;
        const password=req.body.password;

        authenticateUser(email,password,(err,data)=>{
            if(err){
                console.log(err);
                res.render("login",{error:err});
            }
            else{
                req.session.isLoggedIn=true;
                req.session.user=data;
                req.status=200;
                res.redirect("/todo");
            }
        })
    })
    // Authenticate User
    function authenticateUser(email,password,callback){
        readDataFromFile((err,data)=>{
         
            if(err){
                callback(err);
                return;
            }
            else{
                console.log(data);
                console.log(email,password)
                for(let i=0;i<data.length;i++){
                    if(data[i].email==email && data[i].password==password){
                        callback(null,data[i]);
                        return;
                    }
                }
                callback("Invalid Credentials");
            }
        });
    }
    // save details in file
    function saveDetails(user,callback){
        readDataFromFile((err,data)=>{
         
            if(err){
                callback(err);
                return;
            }
            else{
                for(let i=0;i<data.length;i++){
                    if(data[i].email==user.email){
                        callback("Email already exists");
                        return;
                    }
                }
                data.push(user);
                fs.writeFile("userData.txt",JSON.stringify(data),(err)=>{
                    if(err){
                        callback(err);
                        return;
                    }
                    callback(null);
                })

            }
        })
    }

    function readDataFromFile(callback){
        fs.readFile('userData.txt',(err,data)=>{
            if(err){
               callback(err);
            }
           
                if(data.length==0){
                    data="[]"
                }
                try{
                    data=JSON.parse(data);// convert string to object
                    callback(null,data);
                }
                catch(err){
                    callback(err);
                }
        });
    }
/*----------------------todo code---------------------------------------------- */
app.get('/todo',(req,res)=>{
    if(!req.session.isLoggedIn){
        res.redirect("/login")
        return;
    }
    const user=req.session.user;
    res.render("todo",{user:user});//rendering todo.ejs file
});
app.post('/todo',(req,res)=>{
    if(!req.session.isLoggedIn){
        res.status(401).send("Unauthorized")
        return;
    }
    const email=req.session.user.email;
    saveTaskInFile(req.body,email,function(err){
        if(err){
            res.status(500).send("Error");
            return;
        }
      
            res.status(200).send("Success");

    });  
});
app.get('/onRefreshSavedTodoData',(req,res)=>{
   
    if(!req.session.isLoggedIn){
        res.status(401).send("Unauthorized")
        return;
    }
    const email=req.session.user.email;

    readtaskFromFile(function(err,data){
        if(err){
            res.status(500).send("Error");
            return;
        }
        console.log(data[email]);
        res.status(200).json(data[email]);
    });
})
app.delete('/todoDelete/:id',(req,res)=>{

    if(!req.session.isLoggedIn){
        res.status(401).send("Unauthorized")
        return;
    }

    let id=req.params.id;
    readtaskFromFile(function(err,data){
        if(err){
            res.status(500).send("Error");
            return;
        }
        const updatedTodos = data[req.session.user.email].filter((todo) => todo.id !== id);
        data[req.session.user.email]=updatedTodos;
        fs.writeFile('task.txt',JSON.stringify(data),function(err){
            if(err){
                res.status(500).send("Error");
                return;
            }
          
        })
        res.status(200).json(updatedTodos);
    }
    )

})
app.patch('/updateTaskCompletion/:id',(req,res)=>{

    if(!req.session.isLoggedIn){
        res.status(401).send("Unauthorized")
        return;
    }

    let id=req.params.id;
    console.log(req.body,id);
    const email=req.session.user.email;
    readtaskFromFile(function(err,data){
        if(err){
            res.status(500).send("Error");
            return;
        }
        console.log(data);
        let updatedTodos = data[req.session.user.email].map((todo) => {
            if (todo.id === id) {
              todo.completed = req.body.completed;
            }
            return todo;
          });
          data[email]=updatedTodos;
        fs.writeFile('task.txt',JSON.stringify(data),function(err){
            if(err){
                res.status(500).send("Error");
                return;
            }
          
        })
        res.status(200).send("Success");
    }
    )
});
app.get('/logout',(req,res)=>{
    req.session.isLoggedIn=false;
    req.session.destroy();
    res.redirect("/login");
})

// app.post('/todoDelete',(req,res)=>{
//     if(!req.session.isLoggedIn){
//         res.status(401).send("Unauthorized")
//         return;
//     }

//     let task=parseInt(req.body.todoDeleteTaskValue);//convert string to number
//     console.log("delete");
//     console.log(req.body);
//     readtaskFromFile(function(err,data){
//         if(err){
//             res.status(500).send("Error");
//             return;
//         }
//     //    for(let i=0;i<task;i++){
//     //     data.shift();//remove first element
//     //    }
//     data.splice(task-1,1);
//        console.log(data);
//         fs.writeFile('task.txt',JSON.stringify(data),function(err){
//             if(err){
//                 console.log("hey error");
//                 res.status(500).send("Error");
//                 return;
//             }
//             console.log("hey success");
            
//         })
    

//         res.status(200).json(data);
//     });
// })

app.get('/todo.js',(req,res)=>{

    res.sendFile(__dirname+'/public/script/todo.js');
})
// read task from file
function readtaskFromFile(callback){
    fs.readFile('task.txt',(err,data)=>{
        if(err){
           callback(err);
        }
       
            if(data.length==0){
               
                data="{}"
            }
            try{
                data=JSON.parse(data);// convert string to object
                callback(null,data);
            }
            catch(err){
                callback(err);
            }
    });

}
    // Save Todo in file
    function saveTaskInFile(todoData,email,callback){
        readtaskFromFile(function(err,data){
            if(err){
                callback(err);
            }
           
            if(data[email]==undefined){
                data[email]=[];
            }
            data[email].push(todoData);
            
            fs.writeFile('task.txt',JSON.stringify(data),function(err){
                if(err){
                    callback(err);
                    return;
                }
                callback(null);
            })
        });
    }
app.listen(
    3000,()=>{
        console.log("Server Started at port 3000");
    }
)