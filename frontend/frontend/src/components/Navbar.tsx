// src/components/Navbar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();

  const metamaskConnector = connectors.find((c) => c.id === "injected");

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  return (
    <header className="navbar">
      <nav className="navbar-inner">
        <div className="nav-left">
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            Register
          </NavLink>
          <NavLink
            to="/verify"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            Verify
          </NavLink>
        </div>

        <div className="nav-right">
          {isConnected ? (
            <button
              className="btn-secondary"
              type="button"
              onClick={() => disconnect()}
            >
              {shortAddress} · Disconnect
            </button>
          ) : (
            <button
              className="btn-secondary"
              type="button"
              disabled={!metamaskConnector || status === "pending"}
              onClick={() =>
                metamaskConnector && connect({ connector: metamaskConnector })
              }
            >
              {status === "pending" ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
