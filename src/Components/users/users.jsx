import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import {  FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import './users.css';
import Loader from '../Loader/Loader';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateUser = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, user);
      // Update the user in the state
      const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
      setUsers(updatedUsers);
      setEditMode(false);
      setEditedUser(null);
    } catch (error) {
      console.log('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.id);
      await deleteDoc(userDocRef);
      // Remove the user from the state
      const updatedUsers = users.filter((u) => u.id !== user.id);
      setUsers(updatedUsers);
    } catch (error) {
      console.log('Error deleting user:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditMode(true);
    setEditedUser(user);
  };

  const handleSaveUser = () => {
    if (editedUser) {
      handleUpdateUser(editedUser);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedUser(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        setEditedUser({ ...editedUser, image: base64Image });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profiles</h2>

      {loading ? (
        <p><Loader/></p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Profile Image</th>
              <th>Username</th>
              <th>Surname</th>
              <th>Address</th>
              <th>Contact Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  {editMode && editedUser && editedUser.id === user.id ? (
                    <div>
                      <input type="file" accept="image/*" onChange={handleImageChange} />
                      {editedUser.image && <img src={editedUser.image} alt="Profile" className="profile-image" />}
                    </div>
                  ) : (
                    <img src={user.image} alt="Profile" className="profile-image" />
                  )}
                </td>
                <td>
                  {editMode && editedUser && editedUser.id === user.id ? (
                    <input
                      type="text"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editMode && editedUser && editedUser.id === user.id ? (
                    <input
                      type="text"
                      value={editedUser.surname}
                      onChange={(e) => setEditedUser({ ...editedUser, surname: e.target.value })}
                    />
                  ) : (
                    user.surname
                  )}
                </td>
                <td>
                  {editMode && editedUser && editedUser.id === user.id ? (
                    <input
                      type="text"
                      value={editedUser.address}
                      onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                    />
                  ) : (
                    user.address
                  )}
                </td>
                <td>
                  {editMode && editedUser && editedUser.id === user.id ? (
                    <input
                      type="text"
                      value={editedUser.contactNumber}
                      onChange={(e) => setEditedUser({ ...editedUser, contactNumber: e.target.value })}
                    />
                  ) : (
                    user.contactNumber
                  )}
                </td>
                <td>
                  {editMode && editedUser && editedUser.id === user.id ? (
                    <div>
                      <button onClick={handleSaveUser}>
                        <FaSave />
                      </button>
                      <button onClick={handleCancelEdit}>
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEditUser(user)}>
                      <FaEdit />
                    </button>
                  )}
                  {!editMode && (
                    <button onClick={() => handleDeleteUser(user)}>
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
