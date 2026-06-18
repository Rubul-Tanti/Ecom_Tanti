import api from "@/lib/axios"
import { GetProductResponse, GetProductsResponse, ProductFormData, VariantFormData } from "./types"

export const handleCreateProduct=async(data:FormData)=>{
    const res=await api.post('/api/product/create',data)
    return res.data
}
export const handleGetProducts=async({limit,categoryName,page,search,isActive}:{limit:number,categoryName:string,page:number,search:string,isActive:boolean|'All'})=>{
    const query=new URLSearchParams()
    if(isActive!=='All'){query.append('isActive',JSON.stringify(isActive))}
    if(search){query.append("productslug",search)}
    if(limit){query.append("limit",limit.toString())}
    if(page){query.append("page",page.toString())}
    if(categoryName){query.append("categoryName",categoryName)}
    const res=await api.get(`/api/product?${query}`)
return res.data as GetProductsResponse
}
export const handleGetProductsDashboard=async({limit,categoryName,page,search,isActive}:{limit:number,categoryName:string,page:number,search:string,isActive:boolean|'All'})=>{
    const query=new URLSearchParams()
    if(isActive!=='All'){query.append('isActive',JSON.stringify(isActive))}
    if(search){query.append("productslug",search)}
    if(limit){query.append("limit",limit.toString())}
    if(page){query.append("page",page.toString())}
    if(categoryName){query.append("categoryName",categoryName)}
    const res=await api.get(`/api/product/new-arival-dashboard?${query}`)
return res.data as GetProductsResponse
}
export const handleGetProductById=async(id:string)=>{
    const res=await api.get(`/api/product/${id}`)
    return res.data as GetProductResponse
}
export const handleAddProductImage=async({image,productId,productVariantId,altText,sortOrder,isPrimary}:{image:File,productId:string,productVariantId:string,altText:string,sortOrder:number,isPrimary:boolean})=>{
  const formData=new FormData;
    formData.append("productId", productId)
  formData.append("productVariantId", productVariantId)
  formData.append("altText", altText)
  formData.append("sortOrder", String(sortOrder))
  formData.append("isPrimary", String(isPrimary))
  formData.append("image",image)
    const res=await api.post("/api/product/variant-image",formData)
return res.data
}

export const handleDeleteVariantProductImage=async(id:string)=>{
    const res=await api.delete(`/api/product/variant-image/${id}`)
return res.data
}
export const handleUpdateProduct=async({id,data}:{id:string,data:ProductFormData})=>{
    const res=await api.put(`/api/product/${id}`,data)
    return res.data
}
export const handleUpdateProductVariant=async({id,data}:{id:string,data:VariantFormData})=>{
    const res=await api.put(`/api/product/variant/${id}`,data)
    return res.data
}
export const handleAddProductVariant=async({productId,data}:{productId:string,data:FormData})=>{
    const res=await api.post(`/api/product/${productId}/variant`,data)
    return res.data
}
export const handleDeleteProduct=async(id:string)=>{
    const res=await api.delete(`/api/product/${id}`)
    return res.data
}
export const handleDeleteProductVariant=async(id:string)=>{
    const res=await api.delete(`/api/product/variant/${id}`)
    return res.data
}
export const handleGetMostPopular=async({limit,categoryName,page}:{limit:number,categoryName?:string,page:number})=>{
    const query=new URLSearchParams()
    if(limit){query.append("limit",limit.toString())}
    if(page){query.append("page",page.toString())}
    if(categoryName){query.append("categoryName",categoryName)}
    const res=await api.get(`/api/product/most-popular?${query}`)
    return res.data as GetProductsResponse
}
export const handleGetMostPopularDashboard=async({limit,categoryName,page}:{limit:number,categoryName?:string,page:number})=>{
    const query=new URLSearchParams()
    if(limit){query.append("limit",limit.toString())}
    if(page){query.append("page",page.toString())}
    if(categoryName){query.append("categoryName",categoryName)}
    const res=await api.get(`/api/product/most-popular-dashboard?${query}`)
    return res.data as GetProductsResponse
}