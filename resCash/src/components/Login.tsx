import React, { useEffect, useRef, useState } from 'react';
import ResVaultSDK from 'resvault-sdk';
import '../App.css';
import resvaultLogo from '../assets/images/resilientdb.svg';
import NotificationModal from './NotificationModal';
import { v4 as uuidv4 } from 'uuid';
import lottie from 'lottie-web';
import animation from '../assets/images/animation.json';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const sdkRef = useRef<ResVaultSDK | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');

  if (!sdkRef.current) {
    sdkRef.current = new ResVaultSDK();
  }

  const animationContainer = useRef<HTMLDivElement>(null);

  // Initialize the Lottie animation
  useEffect(() => {
    if (animationContainer.current) {
      const instance = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
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
      console.error('Animation container is not defined');
    }
  }, []);

  // Fetch the public key using the backend API
  const fetchPublicKey = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8099/api/transactions/publicKey', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('publicKey', result.publicKey);
        console.log('Public key retrieved and stored:', result.publicKey);
      } else {
        console.error('Failed to fetch public key:', response.statusText);
        setModalTitle('Error');
        setModalMessage('Failed to retrieve public key. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching public key:', error);
      setModalTitle('Error');
      setModalMessage('An error occurred while fetching public key.');
      setShowModal(true);
    }
  };

  // Handle messages from ResVault
  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const messageHandler = async (event: MessageEvent) => {
      const message = event.data;
      console.log('Received message:', message);

      if (message && message.type === 'FROM_CONTENT_SCRIPT' && message.data && message.data.success !== undefined) {
        if (message.data.success) {
          console.log('Authentication success:', message.data);

          // Generate a token and store it
          const token = uuidv4();
          sessionStorage.setItem('token', token);
          onLogin(token);

          // Fetch the public key using the token
          await fetchPublicKey(token);
        } else {
          setModalTitle('Authentication Failed');
          setModalMessage('Please connect ResVault to this ResilientApp and try again.');
          setShowModal(true);
        }
      } else if (message && message.type === 'FROM_CONTENT_SCRIPT' && message.data === 'error') {
        setModalTitle('Authentication Failed');
        setModalMessage('Please connect ResVault to this ResilientApp and try again.');
        setShowModal(true);
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
        type: 'login',
        direction: 'login',
      });
    } else {
      setModalTitle('Error');
      setModalMessage('SDK is not initialized.');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <div className="page-container">
        <div className="form-container">
          <h2 className="heading">Resilient App</h2>

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
