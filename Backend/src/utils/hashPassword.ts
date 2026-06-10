import bcrypt from 'bcrypt'
export  const hashPassword=async(password:string)=>{
const salt=await bcrypt.genSalt(12)
return await bcrypt.hash(password,salt)
}
export const comparePassword=async(password:string,hashedPassword:string|null)=>{
   hashedPassword=hashedPassword||''
   return bcrypt.compareSync(password,hashedPassword)
}