import { createRoot } from "react-dom/client";
import "./assets/styles/globals.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import store from "./app/Store";
import { Provider } from 'react-redux';

createRoot(document.getElementById("root")).render(
 <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
 </BrowserRouter>
);
