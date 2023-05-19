import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import './Signup.css'; // Import the CSS file

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    try {
      const auth = getAuth(); // Get the auth instance
      // Create a new user with the provided email and password
      await createUserWithEmailAndPassword(auth, email, password);
      // Clear the form fields
      setEmail('');
      setPassword('');
      setError(null);
      // Optionally, you can perform additional actions after successful signup
      console.log('User signed up successfully!');
    } catch (error) {
      // Handle signup errors
      setError(error.message);
      console.log('Error signing up:', error);
    }
  };

  return (
    <div className="signup-container"> {/* Apply the container class */}
      <h2>Signup</h2>
      {error && <p className="error-message">{error}</p>} {/* Apply the error-message class */}
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
      <button className="signup-button" onClick={handleSignup}>Signup</button> {/* Apply the signup-button class */}
    </div>
  );
}
