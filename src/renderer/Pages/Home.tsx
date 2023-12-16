export default function Home () {

  const openWindow = () => {
    window.electron.ipcRenderer.sendMessage('note', ['ping']);

  }
  const handleLogin = async () => {
    const email = (document.querySelector("#email") as HTMLInputElement)?.value
    const password = (document.querySelector("#password") as HTMLInputElement)?.value
    window.electron.ipcRenderer.sendMessage('login',[email,password])
    }
    return (
    <div> 
      <h1>Thought Bubble</h1>
      <div className="Hello">
        <div>
      <input id="email" type="email" />
      <input id="password" type="password" />
      </div>
          <button type="button" onClick={openWindow}>
            <span role="img" aria-label="books">
              📚
            </span>
            Open Window
          </button>
          <button type="button" onClick={handleLogin}>
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Login
          </button>
      </div>
    </div>
    )
}