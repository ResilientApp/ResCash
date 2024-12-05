import React, { useEffect, useRef, useState } from "react";
import ResVaultSDK from "resvault-sdk";
import "../App.css";
import resvaultLogo from "../assets/images/resilientdb.svg";
import NotificationModal from "./NotificationModal";
import lottie from "lottie-web";
import animation from "../assets/images/animation.json";

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const sdkRef = useRef<ResVaultSDK | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");

  if (!sdkRef.current) {
    sdkRef.current = new ResVaultSDK();
  }

  const animationContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animationContainer.current) {
      const instance = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: animation,
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            instance.play();
          } else {
            instance.pause();
          }
        });
      });

      observer.observe(animationContainer.current);

      return () => {
        instance.destroy();
        observer.disconnect();
      };
    } else {
      console.error("Animation container is not defined");
    }
  }, []);

  // Function to fetch the public key using the Transaction ID
  const fetchPublicKey = async (
    transactionID: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `http://localhost:8099/api/transactions/publicKey/${transactionID}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch public key");
      }
      const data = await response.json();
      console.log("Public Key:", data.publicKey);
      return data.publicKey; // Return the fetched public key
    } catch (error) {
      console.error("Error fetching public key:", error);
      return null; // Return null in case of an error
    }
  };

  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const messageHandler = async (event: MessageEvent) => {
      const message = event.data;
      if (message && message.type === "FROM_CONTENT_SCRIPT") {
        if (message.data && message.data.success !== undefined) {
          if (message.data.success) {
            const transactionID = message.data.data.postTransaction.id; // Extract Transaction ID
            if (transactionID) {
              console.log("Transaction ID:", transactionID);
              sessionStorage.setItem("transactionID", transactionID); // Store Transaction ID in sessionStorage

              // Fetch public key using the Transaction ID
              const publicKey = await fetchPublicKey(transactionID);
              if (publicKey) {
                sessionStorage.setItem("publicKey", publicKey);
                // Send public key to backend login endpoint
                const response = await fetch(
                  "http://localhost:8099/api/transactions/login",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ publicKey }),
                  }
                );
                const data = await response.json();
                if (data.token) {
                  // Use the token returned by the backend
                  sessionStorage.setItem("token", data.token);
                  onLogin(data.token);
                } else {
                  console.error("Failed to retrieve token from backend");
                }
              } else {
                console.error("Public key not retrieved successfully");
              }
            } else {
              console.error(
                "Transaction ID not found in authentication response"
              );
            }
          }
        }
      }
    };

    sdk.addMessageListener(messageHandler);

    return () => {
      sdk.removeMessageListener(messageHandler);
    };
  }, [onLogin]);

  const handleAuthentication = () => {
    if (sdkRef.current) {
      sdkRef.current.sendMessage({
        type: "login",
        direction: "login",
      });
    } else {
      setModalTitle("Error");
      setModalMessage("SDK is not initialized.");
      setShowModal(true);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <div className="page-container">
        <div className="form-container">
          <h2 className="heading">ResCash</h2>

          <div ref={animationContainer} className="animation-container"></div>

          <div className="form-group text-center mb-4">
            <label className="signin-label">Sign In Via</label>
            <button
              type="button"
              className="btn btn-secondary oauth-button"
              onClick={handleAuthentication}
            >
              <div className="logoBox">
                <img src={resvaultLogo} alt="ResVault" className="oauth-logo" />
              </div>
              <span className="oauth-text">ResVault</span>
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Login;