import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import './book.css';

export default function Book() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const paymentsCollection = collection(db, 'payments');
      const paymentsSnapshot = await getDocs(paymentsCollection);
      const paymentData = paymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPayments(paymentData);
    } catch (error) {
      console.log('Error fetching payments:', error);
    }
  };

  const deletePayment = async (paymentId) => {
    try {
      const paymentDocRef = doc(db, 'payments', paymentId);
      await deleteDoc(paymentDocRef);
      console.log('Payment deleted successfully.');
      fetchPayments(); // Refresh the payments list
    } catch (error) {
      console.log('Error deleting payment:', error);
    }
  };

  const updatePayment = async (paymentId, updatedData) => {
    try {
      const paymentDocRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentDocRef, updatedData);
      console.log('Payment updated successfully.');
      fetchPayments(); // Refresh the payments list
    } catch (error) {
      console.log('Error updating payment:', error);
    }
  };

  const calculateTotalPrice = (checkInDate, checkOutDate, roomPrice) => {
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const numberOfNights = Math.round(Math.abs((startDate - endDate) / oneDay));
    const totalPrice = numberOfNights * roomPrice;
    return totalPrice;
  };

  const handleCheckInChange = (paymentId, event) => {
    const updatedCheckInDate = event.target.value;
    const updatedTotalPrice = calculateTotalPrice(
      updatedCheckInDate,
      payments.find((payment) => payment.id === paymentId).checkOutDate,
      payments.find((payment) => payment.id === paymentId).room.price
    );
    updatePayment(paymentId, { checkInDate: updatedCheckInDate, totalPrice: updatedTotalPrice });
  };

  const handleCheckOutChange = (paymentId, event) => {
    const updatedCheckOutDate = event.target.value;
    const updatedTotalPrice = calculateTotalPrice(
      payments.find((payment) => payment.id === paymentId).checkInDate,
      updatedCheckOutDate,
      payments.find((payment) => payment.id === paymentId).room.price
    );
    updatePayment(paymentId, { checkOutDate: updatedCheckOutDate, totalPrice: updatedTotalPrice });
  };

  return (
    <div className="book-container">
      <h1>Book</h1>
      <table className="payment-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Card Name</th>
            <th>Card Number</th>
            <th>CVV</th>
            <th>Expiry Date</th>
            <th>Room Name</th>
            <th>Room Type</th>
            <th>Check-in Date</th>
            <th>Check-out Date</th>
            <th>Total Price</th>
            <th>Room Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="13">No payments found.</td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.email}</td>
                <td>{payment.cardName}</td>
                <td>{payment.cardNumber}</td>
                <td>{payment.cvv}</td>
                <td>{payment.expiryDate}</td>
                <td>{payment.room.name}</td>
                <td>{payment.room.type}</td>
                <td>
                  <input
                    type="date"
                    value={payment.checkInDate}
                    onChange={(e) => handleCheckInChange(payment.id, e)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={payment.checkOutDate}
                    onChange={(e) => handleCheckOutChange(payment.id, e)}
                  />
                </td>
                <td>{payment.totalPrice}</td>
                <td>{payment.roomStatus}</td>
                <td>
                  <button onClick={() => deletePayment(payment.id)}>Delete</button>
                  <button onClick={() => updatePayment(payment.id, { roomStatus: 'Approved' })}>
                    Update
                  </button>
                  <button onClick={() => updatePayment(payment.id, { roomStatus: 'Decline' })}>
                    Decline
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
