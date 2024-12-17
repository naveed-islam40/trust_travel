import UserSchema from "../model/Baseuser.js";

class UserCRUD {
  createUser = async (query) => {
    console.log(query)
    return await UserSchema.create(query);
  };

  findByEmail = async(query) => {
    return await UserSchema.findOne({ email: query.email }).select("-__v ");
  }
  findUser = async (query) => {
    console.log(query)
    return await UserSchema.findOne({_id: query}).select("-__v  ");
  };

  findAll = async (query) => {
    return await UserSchema.find(query).select("-__v  ");
  };

  updateUser = async (query, data) => {
    return await UserSchema.findOneAndUpdate({_id: query}, data, { new: true }).select(
      "-__v -password -createdAt -updatedAt"
    );
  };

  forgotPasswordEmail = async (query) => {
     return await UserSchema.findOne({email: query})
  }

  resetPassword = async (query, data) => {
    console.log(query, data)
    return await UserSchema.findOneAndUpdate({_id: query}, data, { new: true });
  };

  deleteUser = async (query) => {
    return await UserSchema.findOneAndDelete(query);
  };
}
export default new UserCRUD();
