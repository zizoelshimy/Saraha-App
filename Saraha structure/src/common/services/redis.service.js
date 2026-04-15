import { redisCLIENT } from "../../DB/index.js";

export const set=   async ({
    key,
    value,
    ttl
}={})=>{
    try {
        let data =typeof value==='string'?value:JSON.stringify(value); 
        return ttl? await redisCLIENT.set(key,value,{EX:ttl}): await redisCLIENT.set(key,value);
    }   catch (error) {
        logger.error(`field in Redis set operations ${error}`);
    }

}

export const update=   async ({
    key,
    value,
    ttl
}={})=>{
    try {
        if(!await redisCLIENT.exists(key)) {
            return 0;
        }
        await redisCLIENT.set({key,value,ttl});
    }   catch (error) {
        logger.error(`field in Redis update operations ${error}`);
    }

}

export const get=   async (key)=>{
    try {
        try {
            return JSON.parse(await redisCLIENT.get(key));
        } catch (error) {
             return await redisCLIENT.get(key);
        }
    }   catch (error) {
        logger.error(`field in Redis get   operations ${error}`);
    }
}

export const deleteKey=   async (key)=>{
    try {
        if(!key.length) return 0;
        return await redisCLIENT.del(key);
    }   catch (error) {
        logger.error(`field in Redis delete operations ${error}`);
    }
}

export const ttl=   async (key)=>{
    try {
        return await redisCLIENT.ttl(key);
    }   catch (error) {
        logger.error(`field in Redis ttl   operations ${error}`);
    }
}

export const exists=   async (key)=>{
    try {
        return await redisCLIENT.exists(key);
    }   catch (error) {
        logger.error(`field in Redis exists   operations ${error}`);
    }
}

export const expire=   async ({key, ttl}={})=>{
    try {
        return await redisCLIENT.expire(key, ttl);
    }   catch (error) {
        logger.error(`field in Redis add-expire   operations ${error}`);
    }
}

export const mGet=   async (keys=[])=>{
    try {
        if(!keys.length) return 0;
          
        return await redisCLIENT.mget(keys);
    }   catch (error) {
        logger.error(`field in Redis mget  operations ${error}`);
    }
}

export const keys=   async (prefix)=>{
 try {      
        return await redisCLIENT.keys(`${prefix}*`);
    }   catch (error) {
        logger.error(`field in Redis keys  operations ${error}`);
    }
}

export const revokeTokenKey=  ({userId, jti})=>{
return `${baseRevokeTokenKey({userId})}:${jti}`
}

export const baseRevokeTokenKey=  ({userId})=>{
return `RevokedToken:${userId}`
}

export const otpKey=  (email)=>{
return `OTP::User::${email}`
}