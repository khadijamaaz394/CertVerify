import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WagmiProviders } from "./utils/wagmi-provider";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProviders>
      <App />
    </WagmiProviders>
  </React.StrictMode>
);
