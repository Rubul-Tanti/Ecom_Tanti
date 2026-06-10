import EditEventPage from "@/components/admin/event/editEventPage"

const page=async({params}:{params:Promise<{id:string}>})=>{
    const {id} =await params
    console.log(id)
return <EditEventPage id={id}/>
}
export default page