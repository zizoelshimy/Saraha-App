import {UserModel, users} from '../../DB/model/index.js'
export const profile   = async (id)=>{
    const user = await UserModel.findById(id)
    return user
}
export const updateProfile   = async (id, inputs)=>{
const {DOB,gender} = inputs
const user =await UserModel.updateOne(
    {
        _id:id
    }, 
    {
        $set:{gender},
        $unset:{DOB}
    },
    {
        timestamps: false, // to prevent the update operation from updating the timestamps of the document
        runValidators: true, // to ensure that the validators defined in the schema are run during the update operation
        $inc:{__v:1} // to increment the version key of the document by 1 during the update operation to keep track of the changes made to the document
    }
);
return user
}
export const deleteProfile   = async (id)=>{
const user =await UserModel.deleteOne(
    {
        _id:id
    }
);
return user
}