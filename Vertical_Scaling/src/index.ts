import express from "express";
import cluster from "cluster";
import os from "os";

const totalCPUs = os.cpus().length;

const port = 3000;

if(cluster.isPrimary){
    console.log(`Number of CPUs: ${totalCPUs}`);
    console.log(`Primary ${process.pid} is running.`)

    for(let i=0;i<totalCPUs;i++){
        cluster.fork();
    }

    cluster.on("exit",(worker, code, signal)=>{
        console.log(`worker ${worker.process.pid} has died`)
        console.log("Time to fork another worker as the CPU is free")
        cluster.fork();
    })
} else {
    const app = express();
    console.log(`Worker ${process.pid} started`);

    app.get("/",(req,res)=>{
        res.json({message: "Hello World, API Working"});
    })

    app.get("/api/:n", (req,res)=>{
        let n = parseInt(req.params.n);
        let count = 0;

        if(n>5000000000) n = 5000000000;

        for(let i=0;i<n;i++){
            count += i;
        }

        res.send(`Final count is ${count} ${process.pid}`);
    });

    app.listen(port, ()=>{
        console.log(`Listening on port: ${port}`);
    })
}