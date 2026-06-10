import {Router} from 'express'
import { asyncError} from '../middleware/errorHandler'
import authorizationMiddleware from '../middleware/authentication'
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from '../controlers/category/categories'
import { uploadMiddleware } from '../middleware/multer'

 export const categoryRouter=Router()

    categoryRouter.post('/create',authorizationMiddleware([]),uploadMiddleware.single('image'),asyncError(createCategory))
    categoryRouter.get('/get-categories',authorizationMiddleware([]),asyncError(getCategories))
    categoryRouter.delete('/delete/:id',authorizationMiddleware,asyncError(deleteCategory))
    categoryRouter.put('/update/:id',authorizationMiddleware,uploadMiddleware.single('image'),asyncError(updateCategory))
    categoryRouter.get('/get/:id',authorizationMiddleware,asyncError(getCategoryById))