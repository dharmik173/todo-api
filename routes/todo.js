const express = require("express")
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const Todo = require("../models/todo")
const userInfoFromJWT = require("../helpers/userInfoFromJWT")


const todoRoute = express.Router()


todoRoute.post('/create',userInfoFromJWT,async(req,res)=>{
    try {
        const todoTitle = req.body.todoTitle
        const userDataFromToken = req.userDataFromToken
        
        const todoObj = {
            todoTitle,
            completed:false,
            userId:userDataFromToken.user._id
        }
        const insertTodo = await Todo(todoObj)
        await insertTodo.save()
        res.json({message:"Todo created successfully",newAddedTodoData:insertTodo})
    } catch (error) {
        res.status(400).send("something went wrong : "+error.message);
    }
})

todoRoute.get('/viewAll',userInfoFromJWT,async(req,res)=>{
    try {
        const userDataFromToken =req.userDataFromToken 

        const findAllTodos = await Todo.find({userId:userDataFromToken.user._id}).sort({ createdAt: -1 })

        res.json({message:"fetched successfully",todoList:findAllTodos})
    } catch (error) {
        res.status(400).send("something went wrong : "+error.message);
    }
})

todoRoute.put('/edit/:id',userInfoFromJWT,async(req,res)=>{

    try {
        const todoId = req.params.id

        const { newTitle } = req.body;

        if (!mongoose.Types.ObjectId.isValid(todoId)) {
            return res.status(400).json({message:"Invalid ID format"});
        }

    const updatedTodo = await Todo.findByIdAndUpdate(
        todoId,
        { todoTitle:newTitle },
    );
    if(!updatedTodo){
        throw new Error("please pass valid todo id")
    }
    res.json({"message":"Todo Updates Successfully",data:updatedTodo})
    } catch (error) {
        res.status(400).send("something went wrong : "+error.message); 
    }
})

todoRoute.delete('/delete/:id',userInfoFromJWT,async(req,res)=>{
    try {
        const todoId = req.params.id

        const removeTodo = await Todo.findByIdAndDelete(todoId)

        res.json({message:"Todo deleted SuccessFully"})
    } catch (error) {
        res.status(400).json({message:"error while deleting Todo",error}); 
        
    }
})

todoRoute.put('/markComplete/:id',userInfoFromJWT,async(req,res)=>{

    try {
        const todoId = req.params.id
        const todo = await Todo.findById(todoId);

    const markCompleteTodo = await Todo.findByIdAndUpdate(
        todoId,
        { completed:!todo.completed }
    );
    // console.log(markCompleteTodo,'markCompleteTodo');
    if(!markCompleteTodo){
        throw new Error("unable to mark as complete")
    }
    const message = markCompleteTodo.completed
    ? "Todo marked as completed successfully"
    : "Todo marked as incomplete successfully";

res.json({ message, markCompleteTodo });
    } catch (error) {
        res.status(400).send("something went wrong : "+error.message); 
    }
})

module.exports = todoRoute