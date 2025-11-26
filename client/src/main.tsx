import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {TransactionsProvider} from './context/TransactionContext.jsx'

createRoot(document.getElementById('root')!).render(
  <TransactionsProvider>
    <StrictMode>
      <App />
    </StrictMode>,
  </TransactionsProvider>
)
