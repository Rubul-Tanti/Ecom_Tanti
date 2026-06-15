import express from 'express'
import { asyncError } from '../middleware/errorHandler'
import { emailverification } from '../controlers/authentication/email_verification'
import registerUser from '../controlers/authentication/registerUser'
import LoginUser from '../controlers/authentication/loginUser'
import  authorizationMiddleware  from '../middleware/authentication'
import { refreshUser } from '../controlers/authentication/refresh'
import requestPasswordChange from '../controlers/authentication/requestPasswordChange'
import resetPassword from '../controlers/authentication/resetPassword'
import { asignUser, getUser, updateUser } from '../controlers/User/updateuser'
import { registerWithGoogle } from '../controlers/authentication/google_auth'
import { logout } from '../controlers/authentication/logout'
// import { deleteUser } from '../controlers/authentication/deleteUser'
const router=express.Router()
router.post('/email-verification',asyncError(emailverification))
router.post('/login',authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(LoginUser))
router.get("/",authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(getUser))
router.post('/register',asyncError(registerUser))
router.post('/register-with-google',asyncError(registerWithGoogle))
router.post('/update',authorizationMiddleware(['ADMIN','MODERATOR','USER']),asyncError(updateUser))
router.get('/refresh',asyncError(refreshUser))
router.put('/request-reset-password',asyncError(requestPasswordChange))
router.put('/reset-password',asyncError(resetPassword))
router.get('/logout',asyncError(logout))
// router.delete('/delete',asyncError(deleteUser))
router.put("/asign-role/:id",asyncError(asignUser))
export default router