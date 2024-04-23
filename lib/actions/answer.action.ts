"use server"

import Answer from "@/database/answer.model";
import { connectToDatabse } from "../mongoose";
import { AnswerVoteParams, CreateAnswerParams, DeleteAnswerParams, GetAnswersParams } from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";
import User from "@/database/user.model";

export async function createAnswer(params:CreateAnswerParams) {
    try {
        connectToDatabse();
        const {content, author, question, path} = params;
        const newAnswer = await Answer.create({content, author, question});

        //add the answer to a questions answer array
        const questionObject =  await Question.findByIdAndUpdate(question, {
            $push: {answers: newAnswer._id}
        })

        //create an interaction for answer a question
        await Interaction.create({
            user: author,
            action: "answer",
            question,
            answer: newAnswer._id,
            tags: questionObject.tags,
        })

        //increase reputation when answer a question 
        await User.findByIdAndUpdate(author, {$inc: {reputation: 10}});

        revalidatePath(path);

        
    } catch (error) {
        console.log(error);
        throw error; 
    }   
}

export async function getAnswers(params:GetAnswersParams) {
    try {
        connectToDatabse();
        const {questionId, sortBy, page = 1, pageSize = 10} = params;

        //calculate the number of question cards that should ne skip
        const skipAmount = (page - 1) * pageSize;
        
        let sortOptions = {};

        switch (sortBy) {
            case "highestUpvotes":
                sortOptions = {upvotes: -1};
                break;
            case "lowestUpvotes":
                sortOptions = {upvotes: 1};
                break;
            case "recent":
                sortOptions = {createdAt: -1};
                break;
            case "old":
                sortOptions = {createdAt: 1};
                break;
            default:
                break;
        }
        const answers = await Answer.find({question: questionId}).populate("author", "_id clerkId name picture")
        .skip(skipAmount)
        .limit(pageSize)
        .sort(sortOptions);

        const totalnswers = await Answer.countDocuments({question: questionId});

        const isNext = totalnswers > skipAmount + answers.length;


        return {answers , isNext}
        
    } catch (error) {
        console.log(error);
        throw error; 
    }   
}

export async function upvoteAnswer(params:AnswerVoteParams) {
    try {
        connectToDatabse();

        const {answerId, userId, hasupVoted, hasdownVoted, path} = params;

        let updateQuery = {};

        if(hasupVoted){
            updateQuery = {$pull: {upvotes: userId}};

        }else if(hasdownVoted){
            updateQuery = {$pull: {downvotes: userId}, $push:{upvotes: userId}
        };

        }else{
            updateQuery = { $addToSet: {upvotes:userId}}

        }

        const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {new:true});

        if(!answer){
            throw new Error("Answer not found!")
        }

         //increase reputation for upvote an answer 
         await User.findByIdAndUpdate(userId, {$inc: {reputation: hasupVoted ? -2 : 2}});

         //increase reputation for recieve an upvote for an answer 
         await User.findByIdAndUpdate(answer.author, {$inc: {reputation: hasupVoted ? -10 : 10}});

        revalidatePath(path);

       
    } catch (error) {
        console.log(error);
        throw error; 
    } 
}


export async function downvoteAnswer(params:AnswerVoteParams) {
    try {
        connectToDatabse();

        const {answerId, userId, hasupVoted, hasdownVoted, path} = params;

        let updateQuery = {};

        if(hasdownVoted){
            updateQuery = {$pull: {downvotes: userId}};

        }else if(hasupVoted){
            updateQuery = {$pull: {upvotes: userId}, $push:{downvotes: userId}
        };

        }else{
            updateQuery = { $addToSet: {downvotes:userId}}

        }

        const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {new:true});

        if(!answer){
            throw new Error("Answer not found!")
        }

        
         //increase reputation for downvote an answer 
         await User.findByIdAndUpdate(userId, {$inc: {reputation: hasdownVoted ? -2 : 2}});

         //increase reputation for recieve an downvote for an answer 
         await User.findByIdAndUpdate(answer.author, {$inc: {reputation: hasdownVoted ? -10 : 10}});

        revalidatePath(path);

       
    } catch (error) {
        console.log(error);
        throw error; 
    } 
}

export async function deleteAnswer(params:DeleteAnswerParams) {
    try {
        connectToDatabse();

        const {answerId, path} = params;

        const answer = await Answer.findById(answerId);

        if(!answer){
            throw new Error('Answer nor found');
        }

        await answer.deleteOne({_id: answerId});
        await Question.updateMany({_id: answer.question}, {$pull: {answer: answerId}});
        await Interaction.deleteMany({answer: answerId});

        revalidatePath(path);
       
    } catch (error) {
        console.log(error);
        throw error; 
    } 
}