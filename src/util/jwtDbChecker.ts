import UserModel from "../models/users";

export default async (id: string, token: string): Promise<boolean> =>{
    const user = await UserModel.find({_id: id, tokens: {$all: [token]}}).exec();
    // console.log(`user is ${JSON.stringify(user)}`);
    if(user.length==0) return false;
    return true;
}