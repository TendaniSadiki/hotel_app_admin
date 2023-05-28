import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import './Login.css'; // Import CSS file for styling
import Loader from '../Loader/Loader';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State variable for modal visibility

  const handleLogin = async () => {
    try {
      setIsLoading(true); // Set loading state to true
      const authInstance = getAuth(); // Get the auth instance
      // Sign in the user with the provided email and password
      await signInWithEmailAndPassword(authInstance, email, password);
      // Clear the form fields
      setEmail('');
      setPassword('');
      setError(null);
      setIsLoading(false); // Set loading state to false
      // Optionally, you can perform additional actions after successful login
      console.log('User logged in successfully!');
    } catch (error) {
      // Handle login errors
      setError(error.message);
      setIsLoading(false); // Set loading state to false
      console.log('Error logging in:', error);
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsLoading(true); // Set loading state to true
      const authInstance = getAuth(); // Get the auth instance
      // Send password reset email to the provided email address
      await sendPasswordResetEmail(authInstance, email);
      // Clear the form fields
      setEmail('');
      setPassword('');
      setError(null);
      setIsLoading(false); // Set loading state to false
      // Optionally, you can provide a success message to the user
      console.log('Password reset email sent successfully!');
    } catch (error) {
      // Handle password reset errors
      setError(error.message);
      setIsLoading(false); // Set loading state to false
      console.log('Error sending password reset email:', error);
    }
  };

  const handleModalOpen = () => {
    setIsModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {isLoading ? (
        <Loader /> // Show the loader when isLoading is true
      ) : (
        <>
          {error && <p className="error-message">{error}</p>}
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
          <button className="reset-password-button" onClick={handleModalOpen}>
            Forgot Password
          </button>
        </>
      )}

      {isModalOpen && ( // Render the modal when isModalOpen is true
        <div className="modal">
          <div className="modal-content">
            <h2>Reset Password</h2>
            <p>Enter your email address to reset your password:</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="reset-button" onClick={handleResetPassword}>
              Reset Password
            </button>
            <button className="close-button" onClick={handleModalClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
