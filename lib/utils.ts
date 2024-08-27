import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";
import { type ClassValue, clsx } from "clsx"
import queryString from 'query-string';
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAndDivideNumber = (num: number | undefined): string => {
  if (num === undefined) {
    return ""; 
  } else if (num >= 1000000) {
    const formattedNum = (num / 1000000).toFixed(1);
    return `${formattedNum}M`;
  } else if (num >= 1000) {
    const formattedNum = (num / 1000).toFixed(1);
    return `${formattedNum}K`;
  } else {
    return num.toString();
  }
};

interface UrlQueryParams{
  params:string;
  key:string;
  value:string | null;
}

export const formUrlQuery = ({params, key, value}:UrlQueryParams) => {

  const currentUrl = queryString.parse(params);

  currentUrl[key] = value;

  return queryString.stringifyUrl({
    url:window.location.pathname,
    query:currentUrl,
  },
    {skipNull:true})

}

interface RemoveUrlQueryParams{
  params:string;
  keysToRemove:string[];
}

export const removeKeyFromQuery = ({params, keysToRemove}:RemoveUrlQueryParams) => {
  const currentUrl = queryString.parse(params);

  keysToRemove.forEach((key) => {
      delete currentUrl[key]
  })

  return queryString.stringifyUrl({
    url:window.location.pathname,
    query:currentUrl,
  },
    {skipNull:true})

}

interface BadgeParam {
  criteria:{
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[]
}

export const assignBadges = (params: BadgeParam) => {

  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  }
  const {criteria} = params;

  criteria.forEach((item) => {
    const {type, count} = item;
    const badgeLevels: any = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level: any) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1 ;
      }
    })

  })

  return badgeCounts;

}

export const cosineSimilarity = (text1: string, text2: string): number =>{
  const vector1 = textToVector(text1);
  const vector2 = textToVector(text2);

  const dotProduct = vector1.reduce((sum, _, i) => sum + vector1[i] * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

  if (magnitude1 && magnitude2) {
    return dotProduct / (magnitude1 * magnitude2);
  } else {
    return 0;
  }
}

function textToVector(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/);
  const wordCounts = words.reduce((map, word) => {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {} as Record<string, number>);

  return Object.values(wordCounts);
}


