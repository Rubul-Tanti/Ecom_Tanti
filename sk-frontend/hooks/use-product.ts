import { handleAddProductImage, handleAddProductVariant, handleCreateProduct, handleDeleteProduct, handleDeleteProductVariant, handleDeleteVariantProductImage, handleGetProductById, handleGetProducts, handleUpdateProduct, handleUpdateProductVariant, handleGetMostPopular, handleGetMostPopularDashboard, handleGetProductsDashboard } from "@/server/product"
import { useMutation, useQuery } from "@tanstack/react-query"

const useProduct=()=>{
    const createProduct=useMutation({mutationFn:handleCreateProduct})
    const getProducts=(limit:number,categoryName:string,page:number,search:string,isActive:boolean|'All')=>useQuery({queryKey:['products'],queryFn:()=>handleGetProducts({limit,categoryName,page,search,isActive})})
    const getNewArivalDashboard=(limit:number,categoryName:string,page:number,search:string,isActive:boolean|'All')=>useQuery({queryKey:['products'],queryFn:()=>handleGetProductsDashboard({limit,categoryName,page,search,isActive})})
    const getProductById=(id:string)=>useQuery({queryKey:['get-product',id],queryFn:()=>handleGetProductById(id)})
    const AddProductImage=useMutation({mutationFn:handleAddProductImage})
    const deleteProductImage=useMutation({mutationFn:handleDeleteVariantProductImage})
    const updateProduct=useMutation({mutationFn:handleUpdateProduct})
    const updateProductVariant=useMutation({mutationFn:handleUpdateProductVariant})
    const addProductVariant=useMutation({mutationFn:handleAddProductVariant})
    const deleteProductVariant=useMutation({mutationFn:handleDeleteProductVariant})
    const deleteProduct=useMutation({mutationFn:handleDeleteProduct})
    const getPopularProduct=(limit:number,categoryName:string,page:number)=>useQuery({queryKey:['most-popular-products',limit,categoryName,page],queryFn:()=>handleGetMostPopular({limit,categoryName,page})})
    const getPopularProductDashboard=(limit:number,categoryName:string,page:number)=>useQuery({queryKey:['most-popular-products-dashboard',limit,categoryName,page],queryFn:()=>handleGetMostPopularDashboard({limit,categoryName,page})})
    return {deleteProductVariant,deleteProductImage,createProduct,getProducts,getProductById,AddProductImage,deleteProduct,updateProduct,updateProductVariant,addProductVariant,getPopularProduct,getPopularProductDashboard,getNewArivalDashboard}

}
export default useProduct