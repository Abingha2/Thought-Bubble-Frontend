import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";
import { ThoughtBody, ThoughtContainer, Title } from "../Components";

export default function Thought () {

    let { ID } = useParams();
    // Make states for: thoughtData, thoughtDate
const [thoughtBody, setThoughtBody]= useState("")

const [thoughtDate, setThoughtDate]= useState("")

const [thoughtTitle, setThoughtTitle]= useState("")
    // Make useEffect ( () => {}) that we can use to grab information from Electron backend
    const loadThoughts = async () => {
        window.electron.ipcRenderer.sendMessage('thought',ID)
        // We'll make a type for this later
        window.electron.ipcRenderer.on('thought', (data:any) => {
            console.log(data);
            // We know that data.body is the thought body, so we set it to the thought body (renamed your function to make it clearer)
            setThoughtBody(data.body)
            // Next, let's set the date and title the same way we did the body...
            setThoughtDate(data.date)
            setThoughtTitle(data.title)
        })
        console.log("thoughts loaded")
    }
 useEffect(()=>{ 
    loadThoughts();
 }, [loadThoughts])

    
      return (
  <div>
            <ThoughtContainer>
                <div>Welp</div>
            <Title>{thoughtTitle}</Title>
            <h3>{thoughtDate}</h3>
            <ThoughtBody>{thoughtBody}</ThoughtBody>
            <a href={`/update/${ID}`}>edit</a>
            </ThoughtContainer>
          <div>
        
        </div>
            
      </div>
      )
  }