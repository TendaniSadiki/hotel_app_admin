import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { FaPlus, FaTrashAlt, FaEdit } from 'react-icons/fa';
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import './Rooms.css';

const Rooms = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomImages, setRoomImages] = useState([]);
  const [roomPrice, setRoomPrice] = useState('');
  const [adults, setAdults] = useState('');
  const [children, setChildren] = useState('');
  const [rooms, setRooms] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomCollection = collection(db, 'rooms');
        const roomSnapshot = await getDocs(roomCollection);
        const roomData = roomSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setRooms(roomData);
      } catch (error) {
        console.log('Error fetching rooms:', error);
        setError('Error fetching rooms');
      }
    };

    fetchRooms();
  }, []);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRoomId(null);
    setRoomName('');
    setRoomType('');
    setRoomDescription('');
    setRoomImages([]);
    setRoomPrice('');
    setAdults('');
    setChildren('');
    setValidationError(null);
  };

  const validateForm = () => {
    if (
      roomName.trim() === '' ||
      roomType.trim() === '' ||
      roomDescription.trim() === '' ||
      roomImages.length === 0 ||
      roomPrice.trim() === '' ||
      adults.trim() === '' ||
      children.trim() === ''
    ) {
      setValidationError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const roomCollection = collection(db, 'rooms');
      const roomData = {
        name: roomName,
        type: roomType,
        description: roomDescription,
        images: roomImages,
        price: roomPrice,
        adults: adults,
        children: children
      };

      if (editingRoomId) {
        const roomRef = doc(db, 'rooms', editingRoomId);
        await updateDoc(roomRef, roomData);
        setEditingRoomId(null);
      } else {
        await addDoc(roomCollection, roomData);
      }

      setRoomName('');
      setRoomType('');
      setRoomDescription('');
      setRoomImages([]);
      setRoomPrice('');
      setAdults('');
      setChildren('');
      setIsModalOpen(false);
      setValidationError(null);
    } catch (error) {
      console.log('Error adding/updating room:', error);
      setError('Error adding/updating room');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const selectedImagesCount = roomImages.length + files.length;

    if (selectedImagesCount > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const imagePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then((base64Images) => {
        setRoomImages((prevImages) => [...prevImages, ...base64Images]);
        setError(null);
      })
      .catch((error) => {
        console.log('Error converting images:', error);
      });
  };


  const handleRoomDelete = async (roomId) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await deleteDoc(roomRef);
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
    } catch (error) {
      console.log('Error deleting room:', error);
    }
  };

  const handleRoomUpdate = async (roomId) => {
    try {
      const roomToEdit = rooms.find((room) => room.id === roomId);
      setEditingRoomId(roomId);
      setRoomName(roomToEdit.name);
      setRoomType(roomToEdit.type);
      setRoomDescription(roomToEdit.description);
      setRoomImages(roomToEdit.images);
      setRoomPrice(roomToEdit.price);
      setAdults(roomToEdit.adults);
      setChildren(roomToEdit.children);
      setIsModalOpen(true);
    } catch (error) {
      console.log('Error updating room:', error);
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <h2>Rooms</h2>
      <button onClick={handleModalOpen}>
        <FaPlus />
      </button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingRoomId ? 'Edit Room' : 'Add Room'}</h2>
            <form onSubmit={handleRoomSubmit}>
              <input
                type="text"
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Room Type"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              />
              <textarea
                placeholder="Room Description"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
              ></textarea>
              <div className="image-input">
                <label htmlFor="image-upload" className="image-upload-label">
                  <FaPlus className="plus-icon" /> Choose Images:
                </label>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
              </div>
              <input
                type="number"
                placeholder="Room Price"
                value={roomPrice}
                onChange={(e) => setRoomPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="Adults"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
              <input
                type="number"
                placeholder="Children"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
              <div className="selected-images">
                {roomImages.map((image, index) => (
                  <img key={index} src={image} alt={`Image ${index + 1}`} />
                ))}
              </div>
              <button type="submit">
                {editingRoomId ? 'Update Room' : 'Add Room'}
              </button>
              <button className="cancel" onClick={handleModalClose}>
                Cancel
              </button>

              {validationError && <p>{validationError}</p>}
            </form>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <p>No rooms found</p>
      ) : (
        <div className="room-container">
          <table className="room-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Price</th>
                <th>Adults</th>
                <th>Children</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    {room.id === editingRoomId ? (
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                      />
                    ) : (
                      room.name
                    )}
                  </td>
                  <td>
                    {room.id === editingRoomId ? (
                      <input
                        type="text"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                      />
                    ) : (
                      room.type
                    )}
                  </td>
                  <td>
                    {room.id === editingRoomId ? (
                      <textarea
                        value={roomDescription}
                        onChange={(e) => setRoomDescription(e.target.value)}
                      ></textarea>
                    ) : (
                      room.description
                    )}
                  </td>
                  <td>
                    {room.id === editingRoomId ? (
                      <input
                        type="number"
                        value={roomPrice}
                        onChange={(e) => setRoomPrice(e.target.value)}
                      />
                    ) : (
                      room.price
                    )}
                  </td>
                  <td>
                    {room.id === editingRoomId ? (
                      <input
                        type="number"
                        value={adults}
                        onChange={(e) => setAdults(e.target.value)}
                      />
                    ) : (
                      room.adults
                    )}
                  </td>
                  <td>
                    {room.id === editingRoomId ? (
                      <input
                        type="number"
                        value={children}
                        onChange={(e) => setChildren(e.target.value)}
                      />
                    ) : (
                      room.children
                    )}
                  </td>
                  <td>
                    <div className="room-images">
                      {room.images.map((image, imageIndex) => (
                        <img
                          key={imageIndex}
                          src={image}
                          alt={`Image ${imageIndex + 1}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      {room.id === editingRoomId ? (
                        <React.Fragment>
                          <button
                            onClick={() => handleRoomUpdate(room.id)}
                            className="edit-button"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRoomId(null);
                              setRoomName('');
                              setRoomType('');
                              setRoomDescription('');
                              setRoomImages([]);
                              setRoomPrice('');
                              setAdults('');
                              setChildren('');
                            }}
                            className="cancel-button"
                          >
                            Cancel
                          </button>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <button
                            onClick={() => handleRoomUpdate(room.id)}
                            className="edit-button"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleRoomDelete(room.id)}
                            className="delete-button"
                          >
                            <FaTrashAlt />
                          </button>
                        </React.Fragment>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Rooms;
