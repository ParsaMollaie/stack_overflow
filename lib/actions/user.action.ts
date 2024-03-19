"use server"

import User from "@/database/user.model";
import { connectToDatabse } from "../mongoose"
import { CreateUserParams, DeleteUserParams, UpdateUserParams } from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function getUserById(params: any) {
    try {
        connectToDatabse();

        const {userId} = params;
        const user = await User.findOne({clerkId : userId});
        return user;
        
    } catch (error) {
        console.log(error);
        throw error;
    }
    
}

export async function createUser(userData:CreateUserParams) {
    try {
        connectToDatabse();
        const newUser = await User.create(userData);
        return newUser;

    } catch (error) {
        console.log(error);
        throw error; 
    }
    
}

export async function updateUser(params:UpdateUserParams) {
    try {
        connectToDatabse();
        const {clerkId, updateData, path} = params;

        await User.findOneAndUpdate({clerkId}, updateData, {
            new: true
        });
        revalidatePath(path);
    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}

export async function deleteUser(params:DeleteUserParams) {
    try {
        connectToDatabse();
        const {clerkId} = params;
        const user = await User.findOneAndDelete({clerkId});
        if(!user){
            throw new Error('User not found');
        }

        //delete user from databse also have to delete question, tags answer and etc about user
        const userQuestionIds = await Question.find({author: user._id}).distinct('_id');

        //delete user question
        await Question.deleteMany({author: user._id});

        const deleteUser = await User.findByIdAndDelete(user.id);
        return deleteUser;

    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}