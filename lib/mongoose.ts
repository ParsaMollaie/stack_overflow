import mongoos from "mongoose";

let isConnected: boolean = false;

export const connectToDatabse = async() => {
    mongoos.set('strictQuery', true);

    if(!process.env.MONGODB_URL) {
        return console.log("missing mondodb_url")
    }

    if(isConnected){
        return;
        // console.log("Mongodb is alredy connected")
    }

    try {
        await mongoos.connect(process.env.MONGODB_URL, {
            dbName:'devflow'
        })
        isConnected = true;
        console.log('Mongodb is connected');
    } catch (error) {
        console.log('mongodb connection failed', error);
    }
}