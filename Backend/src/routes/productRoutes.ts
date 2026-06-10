import {Router} from 'express'
import { uploadMiddleware } from '../middleware/multer'
import { createImageVariant, createProduct } from '../controlers/product/createProducts'
import { asyncError, multerErrorHandler } from '../middleware/errorHandler'
import { addVariant, deleteProduct, deleteProductVariant, deleteVariantImage, getProduct, updateProduct, updateVariant } from '../controlers/product/updateProduct'
import authorizationMiddleware from '../middleware/authentication'
import { getAllProduct } from '../controlers/product/getAllProduct'

 const productRouter=Router()
productRouter.post('/create',authorizationMiddleware(['ADMIN']),uploadMiddleware.any(),asyncError(createProduct))
productRouter.post('/:productId/variant',authorizationMiddleware(['ADMIN']),uploadMiddleware.any(),asyncError(addVariant))
productRouter.put('/:id',authorizationMiddleware(['ADMIN']),asyncError(updateProduct))
productRouter.put('/variant/:id',authorizationMiddleware(['ADMIN']),asyncError(updateVariant))
productRouter.get('/',authorizationMiddleware([]),asyncError(getAllProduct))
productRouter.get('/:id',authorizationMiddleware([]),asyncError(getProduct))
productRouter.post("/variant-image",authorizationMiddleware(['ADMIN']),uploadMiddleware.single('image'),asyncError(createImageVariant))
productRouter.delete("/variant-image/:id",authorizationMiddleware(['ADMIN']),asyncError(deleteVariantImage))
productRouter.delete('/:id',authorizationMiddleware(['ADMIN']),asyncError(deleteProduct))
productRouter.delete('/variant/:id',authorizationMiddleware(['ADMIN']),asyncError(deleteProductVariant))

productRouter.use(multerErrorHandler)
export default productRouter