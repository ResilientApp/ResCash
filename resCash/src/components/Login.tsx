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

  // Initialize SDK if not already initialized
  if (!sdkRef.current) {
    sdkRef.current = new ResVaultSDK("*");
    console.log("SDK initialized:", sdkRef.current);
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
      console.log("DEBUG: Fetching public key for transactionID:", transactionID);
      const response = await fetch(
        `http://localhost:8099/api/transactions/publicKey/${transactionID}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch public key");
      }
      const data = await response.json();
      console.log("DEBUG: Received public key:", data.publicKey);
      return data.publicKey; // Return the fetched public key
    } catch (error) {
      console.error("DEBUG: Error fetching public key:", error);
      return null; // Return null in case of an error
    }
  };

  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const messageHandler = async (event: MessageEvent) => {
      console.log("DEBUG: Message received from SDK:", event.data);
      const message = event.data;
      if (message && message.type === "FROM_CONTENT_SCRIPT") {
        if (message.data && message.data.success !== undefined) {
          if (message.data.success) {
            const transactionID = message.data.data?.postTransaction?.id; // Extract Transaction ID
            if (transactionID) {
              console.log("DEBUG: Transaction ID received:", transactionID);
              sessionStorage.setItem("transactionID", transactionID); // Store Transaction ID in sessionStorage

              // Fetch public key using the Transaction ID
              const publicKey = await fetchPublicKey(transactionID);
              if (publicKey) {
                sessionStorage.setItem("publicKey", publicKey);
                console.log("DEBUG: Sending publicKey to backend for login:", publicKey);
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
                console.log("DEBUG: Login response from backend:", data);
                if (data.token) {
                  // Use the token returned by the backend
                  sessionStorage.setItem("token", data.token);
                  onLogin(data.token);
                } else {
                  console.error("DEBUG: Failed to retrieve token from backend");
                }
              } else {
                console.error("DEBUG: Public key not retrieved successfully");
              }
            } else {
              console.error("DEBUG: Transaction ID not found in auth response");
            }
          } else {
            console.error("DEBUG: Received failure message from SDK:", message);
          }
        } else {
          console.warn("DEBUG: Received message with unexpected format:", message);
        }
      }
    };

    console.log("DEBUG: Adding SDK message listener");
    sdk.addMessageListener(messageHandler);

    return () => {
      console.log("DEBUG: Removing SDK message listener");
      sdk.removeMessageListener(messageHandler);
    };
  }, [onLogin]);

  // Test if message listener is working by sending a test message to the SDK
  useEffect(() => {
    console.log("DEBUG: Testing SDK message listener");
    const testMessage = () => {
      console.log("DEBUG: Sending test message to SDK");
      if (sdkRef.current) {
        sdkRef.current.sendMessage({ type: "test" });
      } else {
        console.error("DEBUG: SDK reference is null during test message");
      }
    };
    // Send a test message after a short delay
    const timer = setTimeout(testMessage, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle authentication button click: send login message to SDK
  const handleAuthentication = () => {
    console.log("DEBUG: Login button clicked, sending login message to SDK");
    if (sdkRef.current) {
      console.log("DEBUG: SDK reference exists, sending message:", {
        type: "login",
        direction: "login",
      });
      sdkRef.current.sendMessage({ type: "login", direction: "login" });
      console.log("DEBUG: Login message sent to SDK");
    } else {
      console.error("DEBUG: SDK reference does not exist");
      setModalTitle("Error");
      setModalMessage("SDK is not initialized.");
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem("currentPage", "home");
  };

  return (
    <>
      <div className="page-container">
        <div className="form-container-login">
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
