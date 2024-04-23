"use server"
import { FilterQuery } from "mongoose";
import User from "@/database/user.model";
import { connectToDatabse } from "../mongoose"
import { CreateUserParams, DeleteUserParams, GetAllUsersParams, GetSavedQuestionsParams, GetUserByIdParams, GetUserStatsParams, ToggleSaveQuestionParams, UpdateUserParams } from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";
import { BadgeCriteriaType } from "@/types";
import { assignBadges } from "../utils";

export async function getUserById(params: GetUserByIdParams) {
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

export async function getAllUsers(params:GetAllUsersParams) {
    try {
        connectToDatabse();

        const {page=1, pageSize = 20, filter, searchQuery} = params;

         //calculate the number of question cards that should ne skip
         const skipAmount = (page - 1) * pageSize;

        const query: FilterQuery<typeof User> = {};

        if(searchQuery){
            query.$or = [
                {name : {$regex: new RegExp(searchQuery, 'i')}},
                {username : {$regex: new RegExp(searchQuery, 'i')}},
            ]
        }

        let sortOptions = {};

        switch (filter) {
            case "new_users":
                sortOptions = {joinedAt: -1};
                break;
            case "old_users":
                sortOptions = {joinedAt: 1};
                break;
            case "top_contributors":
                sortOptions = {reputation: -1};
                break;
            default:
                break;
        }

        const users = await User.find(query).skip(skipAmount)
        .limit(pageSize).sort(sortOptions)

        const totalUsers = await User.countDocuments(query);

        const isNext = totalUsers > skipAmount + users.length;

        return {users, isNext};
        
    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}


export async function toggleSaveQuestion(params:ToggleSaveQuestionParams) {
    try {
        connectToDatabse();
        const {userId, questionId, path} = params;

        const user = await User.findById(userId);

        if(!user){
            throw new Error('User not Found!');
        }

        const isQuestionSaved = user.saved.includes(questionId);
        if (isQuestionSaved) {
            //remove question from saved
            await User.findByIdAndUpdate(userId, 
                {$pull: {saved: questionId}},
                {new: true}
            )
        }else{
            //add question to saved
            await User.findByIdAndUpdate(userId, 
                {$addToSet: {saved: questionId}},
                {new: true}
            )
        }
        revalidatePath(path);
    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}

export async function getSavedQuestion(params:GetSavedQuestionsParams) {
    try {
        connectToDatabse();

        const {clerkId, page=1, pageSize =2, filter, searchQuery} = params;

        //calculate the number of question cards that should ne skip
        const skipAmount = (page - 1) * pageSize;

        const query: FilterQuery<typeof Question> = searchQuery 
             ? {title: {$regex : new RegExp(searchQuery, 'i')}}
             : {};

        let sortOptions = {};

        switch (filter) {
            case "most_recent":
                sortOptions = {createdAt: -1};
                break;
            case "oldest":
                sortOptions = {createdAt: 1};
                break;
            case "most_voted":
                sortOptions = {upvotes: -1};
                break;
            case "most_viewed":
                sortOptions = {views: -1};
                break;
            case "most_answered":
                sortOptions = {answers: -1};
                break;
            default:
                break;
            }

        const user = await User.findOne({clerkId}).populate({
            path:'saved',
            match: query,
            options:{
                sort:sortOptions,
                skip: skipAmount,
                limit: pageSize + 1,
            },
            populate:[
                {path: 'tags', model: Tag, select: '_id name'},
                {path: 'author', model: User, select: '_id clerkId name picture'}
            ]
        })
        const isNext = user.saved.length > pageSize;


        if(!user){
            throw new Error('User not Found!')
        }


        const savedQuestion = user.saved;
        return { questions: savedQuestion, isNext};

    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}

export async function getUserInfo(params:GetUserByIdParams) {
    try {
        connectToDatabse();

        const {userId} = params;

        const user = await User.findOne({clerkId: userId});

        if(!user){
            throw new Error("User not found")
        }

        const totalQuestions = await Question.countDocuments({author: user._id});
        const totalAnswers = await Answer.countDocuments({author: user._id});

        const [questionUpvotes] = await Question.aggregate([
            {$match: {author: user._id}},
            {$project: {_id: 0, upvotes: {$size: "$upvotes"}}},
            {$group: {_id: null, totalUpvotes: {$sum: "$upvotes"}}},
        ]);

        const [answerUpvotes] = await Answer.aggregate([
            {$match: {author: user._id}},
            {$project: {_id: 0, upvotes: {$size: "$upvotes"}}},
            {$group: {_id: null, totalUpvotes: {$sum: "$upvotes"}}},
        ]);

        const [questionViews] = await Question.aggregate([
            {$match: {author: user._id}},
            {$group: {_id: null, totalViews: {$sum: "$views"}}},
        ]);

        const criteria = [
            {type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions},
            {type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers},
            {type: 'QUESTION_UPVOTES' as BadgeCriteriaType, count: questionUpvotes?.totalUpvotes || 0},
            {type: 'ANSWER_UPVOTES' as BadgeCriteriaType, count: answerUpvotes?.totalUpvotes || 0},
            {type: 'TOTAL_VIEWS' as BadgeCriteriaType, count: questionViews?.totalViews || 0},

        ]
        const badgeCounts = assignBadges({criteria});

        return{
            user,
            totalQuestions,
            totalAnswers,
            badgeCounts,
            reputation: user.reputation,
        }

        
    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}


export async function getUserQuestions(params:GetUserStatsParams) {
    try {
        connectToDatabse();

        const {userId, page=1, pageSize=10} = params;

        //calculate the number of question cards that should ne skip
        const skipAmount = (page - 1) * pageSize;


        const totalQuestions = await Question.countDocuments({author: userId});

        const userQuestions = await Question.find({author: userId})
            .sort({createdAt: -1, views: -1, upvotes: -1})
            .skip(skipAmount)
            .limit(pageSize)
            .populate('tags', '_id name')
            .populate('author', '_id clerkId name picture')

            const isNextQuestions = totalQuestions > skipAmount + userQuestions.length;


            return{
                totalQuestions,
                questions:userQuestions,
                isNextQuestions
            }
        
    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}

export async function getUserAnswers(params:GetUserStatsParams) {
    try {
        connectToDatabse();

        const {userId, page=1, pageSize=10} = params;

        //calculate the number of question cards that should ne skip
        const skipAmount = (page - 1) * pageSize;

        const totalAnswers = await Answer.countDocuments({author: userId});

        const userAnswers = await Answer.find({author: userId})
            .sort({ createdAt: -1, upvotes: -1})
            .skip(skipAmount)
            .limit(pageSize)
            .populate('question', '_id title')
            .populate('author', '_id clerkId name picture')

            const isNextAnswer= totalAnswers > skipAmount + userAnswers.length;

            return{
                totalAnswers,
                answers:userAnswers,
                isNextAnswer
            }
        
    } catch (error) {
        console.log(error);
        throw error;
        
    }
}
   

   