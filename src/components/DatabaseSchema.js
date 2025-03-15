import React, { useState } from 'react';
import { useTheme } from "../ThemeContext"; // Import Theme Context


const DatabaseSchema = () => {
  const {theme} = useTheme();
  
  const usersTable = [
    { id: 1, name: "john doe", email: "john@example.com", age: 30 },
    { id: 2, name: "jane smith", email: "jane@example.com", age: 25 },
    { id: 3, name: "alice johnson", email: "alice@example.com", age: 35 },
  ];
    
  const ordersTable = [
    { order_id: 1, user_id: 1, product: "laptop", amount: 900, order_date: "2024-03-01" },
    { order_id: 2, user_id: 2, product: "smartphone", amount: 600, order_date: "2024-03-05" },
    { order_id: 3, user_id: 3, product: "tablet", amount: 300, order_date: "2024-03-10" },
    { order_id: 4, user_id: 1, product: "headphones", amount: 100, order_date: "2024-03-15" },
  ];
  
 
  
  // Theme-based classes
  const containerClass = `container mt-4 p-4 ${theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark'}`;
  const tableClass = `table table-hover table-bordered ${theme === 'dark' ? 'table-dark' : ''}`;
  const usersTheadClass = `${theme === 'dark' ? 'bg-primary text-white' : 'table-primary'}`;
  const ordersTheadClass = `${theme === 'dark' ? 'bg-success text-white' : 'table-success'}`;
  
  return (
    <div className={containerClass}>
      <div className="d-flex justify-content-between align-items-center mb-4">
      <h1 className={`${theme === 'dark' ? 'text-light' : 'text-primary'} fw-bold fs-4`}>Database : Algomitra</h1>
      </div>
      
      <div className="mb-5">
        <div className="d-flex align-items-center mb-3">
          <span className="badge bg-primary me-2"></span>
          <h2 className={`mb-0 ${theme === 'dark' ? 'text-info' : 'text-primary'}`}>Users Table</h2>
        </div>
        <div className="table-responsive">
          <table className={tableClass}>
            <thead className={usersTheadClass}>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Age</th>
              </tr>
            </thead>
            <tbody>
              {usersTable.map((user) => (
                <tr key={user.id}>
                  <td className="fw-bold">{user.id}</td>
                  <td className="text-capitalize">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <div className="d-flex align-items-center mb-3">
          <span className="badge bg-success me-2"></span>
          <h2 className={`mb-0 ${theme === 'dark' ? 'text-success' : 'text-success'}`}>Orders Table</h2>
        </div>
        <div className="table-responsive">
          <table className={tableClass}>
            <thead className={ordersTheadClass}>
              <tr>
                <th scope="col">Order ID</th>
                <th scope="col">User ID</th>
                <th scope="col">Product</th>
                <th scope="col">Amount ($)</th>
                <th scope="col">Order Date</th>
              </tr>
            </thead>
            <tbody>
              {ordersTable.map((order) => (
                <tr key={order.order_id}>
                  <td className="fw-bold">{order.order_id}</td>
                  <td>{order.user_id}</td>
                  <td className="text-capitalize">{order.product}</td>
                  <td>${order.amount.toLocaleString()}</td>
                  <td>{order.order_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchema;