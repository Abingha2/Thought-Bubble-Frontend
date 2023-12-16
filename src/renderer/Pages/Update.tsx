import { useParams, useNavigate} from "react-router-dom";
import { useState,useEffect } from "react";
import { ThoughtContainer } from "../Components";

export default function Update(){

    let { ID } = useParams();

    const navigate = useNavigate()

    const [thoughtBody, setThoughtBody]= useState("")

    const [thoughtTitle, setThoughtTitle]= useState("")

    const loadThoughts = async () => {
        window.electron.ipcRenderer.sendMessage('thought',ID)
        window.electron.ipcRenderer.on('thought', (data:any) => {
            console.log(data);
            setThoughtBody(data.body)
            setThoughtTitle(data.title)
        })
        console.log("thoughts loaded")
    }

    const doUpdate = () => {
        console.log("We will update!")
        const title = (document.querySelector("#title") as HTMLInputElement).value
        const body = (document.querySelector("#body") as HTMLInputElement).value
        window.electron.ipcRenderer.sendMessage('update',{id: ID, title, body})
        window.electron.ipcRenderer.once('update-done', (result:boolean) => {
            console.log(result);
            navigate(`/thought/${ID}`)
        })
    }
 useEffect(()=>{ 
    loadThoughts();
 }, [loadThoughts])

 return (
    <div>
        <ThoughtContainer className="thought">
        <div className="titlebar">Edit Thought</div>
            <div className="nodrag">
            <div id="content">
                <input id="title" className="editable" defaultValue={thoughtTitle} />
                <input id="body" className="editable" type="textarea" defaultValue={thoughtBody}/>
                <button className="editable" onClick={doUpdate}>Update</button>
            </div>
        </div>
        </ThoughtContainer>
    </div>
        )
}