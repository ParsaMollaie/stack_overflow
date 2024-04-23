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


