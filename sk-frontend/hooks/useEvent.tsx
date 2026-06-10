import { handleAddProductToEvent, handleCreateEvent, handleGetEventById, handleGetEvents, handleGetEventsForUser, handleUpdateEvent } from "@/server/event"
import { useMutation, useQuery } from "@tanstack/react-query"

const useEvents=()=>{
const createEvent=useMutation({mutationFn:handleCreateEvent})
const getEvents=()=>useQuery({queryKey:['events'],queryFn:handleGetEvents})
const getEventsDashboard=()=>useQuery({queryKey:['events'],queryFn:handleGetEventsForUser})
const getEventsById=(id:string)=>useQuery({queryKey:['event'],queryFn:()=>handleGetEventById(id)})
const updateEvent=useMutation({mutationFn:handleUpdateEvent})
const addProductToEvent=useMutation({mutationFn:handleAddProductToEvent})
return {createEvent,getEvents,getEventsDashboard,addProductToEvent,updateEvent,getEventsById}
}
export default useEvents