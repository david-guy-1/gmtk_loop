import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './gamedata/App.tsx'
import './index.css'
import MuteButton from './MuteButton.tsx'
import { CANVAS_WIDTH } from './gamedata/constants.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <div>
    <App />
    <MuteButton x={CANVAS_WIDTH-40} y={0} />
    </div>
)
