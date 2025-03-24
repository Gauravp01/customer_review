// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const statsResponse = await axios.get(
          "http://localhost:5000/api/admin/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(statsResponse.data);

        const usersResponse = await axios.get(
          "http://localhost:5000/api/admin/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(usersResponse.data.users);

        const storesResponse = await axios.get(
          "http://localhost:5000/api/stores",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStores(storesResponse.data);
      } catch (error) {
        console.error("Error loading admin data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "admin") fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") return <div>Access Denied</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Total Users: {stats.users}</p>
      <p>Total Stores: {stats.stores}</p>
      <p>Total Ratings: {stats.ratings}</p>
      <h2>Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.email} - {u.role}
          </li>
        ))}
      </ul>
      <h2>Stores</h2>
      <ul>
        {stores.map((s) => (
          <li key={s.id}>
            {s.name} - {s.address} - Rating: {s.rating}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
