import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './Store/store.jsx'
import OfflineDetector from './Pages/OfflineDetector.jsx'

createRoot(document.getElementById('root')).render(
    <OfflineDetector>
    <BrowserRouter>
    <Provider store={store}>
    <App />
    </Provider>
    </BrowserRouter>
    </OfflineDetector>
)
