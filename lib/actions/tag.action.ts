"use server"

import User from "@/database/user.model";
import { connectToDatabse } from "../mongoose";
import { GetAllTagsParams, GetQuestionsByTagIdParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Question from "@/database/question.model";
import Interaction from '@/database/interaction.model';

export async function getTopInteractedTags(
    params: GetTopInteractedTagsParams
  ) {
    try {
      connectToDatabse();
  
      const { userId, limit = 2 } = params;
  
      const user = await User.findById(userId);
  
      if (!user) {
        throw new Error('❌🔍 User not found 🔍❌');
      }
  
      /**
       * Find interactions for the user and group by tags
       *
       */
      const tagMap = await Interaction.aggregate([
        { $match: { user: user._id, tags: { $exists: true, $ne: [] } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);
  
      const topTags = tagMap.map((tag) => tag._id);
  
      // Find the tag documents for the top tags
      const topTagDocuments = await Tag.find({ _id: { $in: topTags } });
  
      return topTagDocuments;
    } catch (error) {
      console.error(`❌ ${error} ❌`);
      throw error;
    }
  }

export async function getAllTags(params:GetAllTagsParams) {
    try {
        connectToDatabse();
        const {searchQuery, filter, page = 1, pageSize = 20} = params;

        //calculate the number of question cards that should ne skip
        const skipAmount = (page - 1) * pageSize;

        const query: FilterQuery<typeof Tag> = {};

        if(searchQuery){
            query.$or = [
                {name : {$regex: new RegExp(searchQuery, 'i')}},
            ]
        }
        let sortOptions = {};

        switch (filter) {
            case "popular":
                sortOptions = {questions: -1};
                break;
            case "recent":
                sortOptions = {createdOn: -1};
                break;
            case "name":
                sortOptions = {name: 1};
                break;
            case "old":
                sortOptions = {createdOn: 1};
                break;
            default:
                break;
        }

        const tags = await Tag.find(query).skip(skipAmount).limit(pageSize).sort(sortOptions);

        const totalTags = await Tag.countDocuments(query);
        const isNext = totalTags > skipAmount + tags.length;

        return {tags , isNext};
    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}


export async function getQuestionByTagId(params:GetQuestionsByTagIdParams) {
    try {
        connectToDatabse();

        const {tagId, page=1, pageSize = 10, searchQuery} = params;

        //calculate the number of question cards that should ne skip
        const skipAmount = (page - 1) * pageSize;

        const tagFilter: FilterQuery<ITag> = {_id: tagId}

        const tag = await Tag.findOne(tagFilter).populate({
            path:'questions',
            model: Question,
            match: searchQuery
                ? {title : {$regex: searchQuery, $options: 'i'}}
                : {},
            options:{
                sort:{createdOn: -1},
                skip: skipAmount,
                limit: pageSize + 1
            },
            populate:[
                {path: 'tags', model: Tag, select: '_id name'},
                {path: 'author', model: User, select: '_id clerkId name picture'}
            ]
        })

        if(!tag){
            throw new Error('Tag not Found!')
        }

        const isNext = tag.questions.length > pageSize;

        const questions = tag.questions;
        return {tagTitle: tag.name, questions , isNext};
       
    } catch (error) {
        console.log(error);
        throw error;
        
    }
    
}

export async function getTopPopularTags() {
    try {
        connectToDatabse();
        const popularTags = await Tag.aggregate([
            {$project: {name:1, numberOfQuestions: {$size: '$questions'}}},
            { $sort : {numberOfQuestions: -1}},
            {$limit: 5}
        ])

       return popularTags;
    } catch (error) {
        console.log(error);
        throw error; 
    } 
}