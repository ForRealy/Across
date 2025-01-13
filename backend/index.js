//importar dependencias
import express from "express"
import mysql, { createConnection } from "mysql"

//iniciar express
const app = express()

//conexion con base de datos (ni idea si va ngl)
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"test",
    database: "test"
})

//Muestra un mensaje en la pagina
app.get("/", (req,res)=>{
    res.json("esto es el backend")
})

//pillar los juegos de la base de datos y los muetras en "/juegos"
app.get("/juegos", (req,res)=>{
    const q = "SELECT * FROM juegos"
    
    //aqui haces la llamada y un sistema de error
    db.query(q,(err,data)=>{
        if(err) return res.json(err+ " Algo aqui no va preciosa, a leer")
        return res.json(data)
    })
})

//crea el proyecto en el puerto 8000
//en oakage.json le decimos que inicie con el proyecto (start)
app.listen(8000, ()=>{
    console.log("Backend listo")
})