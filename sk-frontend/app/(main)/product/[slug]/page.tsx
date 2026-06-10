import ProductPage from "@/components/home/productDetails"

const page=async({params}:{params:Promise<{slug:string}>})=>{
  const {slug}=await params
    return <ProductPage slug={slug}/>
}
export default page