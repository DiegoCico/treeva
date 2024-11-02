import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [additionalInfoNeeded, setAdditionalInfoNeeded] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().workspaceCode) {
          navigate(`/home/${user.uid}/${userDoc.data().workspaceCode}`);
        } else {
          setAdditionalInfoNeeded(true); 
        }
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup successful! You can now log in.");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCreateWorkspace = async () => {
    if (workspaceCode.length !== 6 || isNaN(workspaceCode)) {
      setError("Workspace code must be a unique 6-digit number.");
      return;
    }

    try {
      // Check if the workspace code is unique
      const workspaceQuery = query(collection(db, 'workspace'), where('__name__', '==', workspaceCode));
      const querySnapshot = await getDocs(workspaceQuery);

      if (!querySnapshot.empty) {
        setError("Workspace code already exists. Please use a different 6-digit code.");
        return;
      }

      const user = auth.currentUser;
      await setDoc(doc(db, 'workspace', workspaceCode), {
        ownerId: user.uid,
        name,
        role,
        members: [user.uid], // Add user as a member
      });
      // Add user details to 'users' collection
      await setDoc(doc(db, 'users', user.uid), {
        name,
        role,
        workspaceCode,
        email: user.email,
      });
      alert("Workspace created successfully!");
      navigate(`/home/${user.uid}/${workspaceCode}`);
    } catch (err) {
      setError("Error creating workspace: " + err.message);
    }
  };

  const handleJoinWorkspace = async () => {
    try {
      const workspaceDoc = await getDoc(doc(db, 'workspace', workspaceCode));
      if (workspaceDoc.exists()) {
        const user = auth.currentUser;
        // Add user details to 'users' collection
        await setDoc(doc(db, 'users', user.uid), {
          name,
          role,
          workspaceCode,
          email: user.email,
        });
        alert("Successfully joined the workspace!");
        // Redirect to the formatted URL
        navigate(`/home/${user.uid}/${workspaceCode}`);
      } else {
        setError("Workspace not found.");
      }
    } catch (err) {
      setError("Error joining workspace: " + err.message);
    }
  };

  const toggleLoginSignup = () => {
    setIsLogin(!isLogin);
    setAdditionalInfoNeeded(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      </div>
      <div className="auth-form-wrapper">
        <div className={`auth-form ${isLogin ? 'slide-in-left' : 'slide-in-right'}`}>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {additionalInfoNeeded && (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="6-Digit Workspace Code"
                  value={workspaceCode}
                  onChange={(e) => setWorkspaceCode(e.target.value)}
                  required
                />
                <button type="button" onClick={handleCreateWorkspace}>
                  Create Workspace
                </button>
                <button type="button" onClick={handleJoinWorkspace}>
                  Join Workspace
                </button>
              </>
            )}
            {!additionalInfoNeeded && (
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
              </button>
            )}
          </form>
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span onClick={toggleLoginSignup}>
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
