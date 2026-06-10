'use client'
import EventPage from "@/components/home/event/eventPage";
import useEvents from "@/hooks/useEvent";

const page=async({params}:{params:Promise<{id:string}>})=>{
    const {id}=await params
    return <EventPage id={id}/>
}
export default page