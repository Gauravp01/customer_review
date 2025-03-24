// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset errors before fetching data

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication error: No token found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Correct API endpoints
        const [statsResponse, usersResponse, storesResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/api/dashboard", { headers }), // Fetch dashboard stats
            axios.get("http://localhost:5000/api/admin/users", { headers }), // Fetch users
            axios.get("http://localhost:5000/api/admin/stores", { headers }), // Fetch stores
          ]);

        setStats({
          users: statsResponse.data?.totalUsers || 0,
          stores: statsResponse.data?.totalStores || 0,
          ratings: statsResponse.data?.totalRatings || 0,
        });

        setUsers(usersResponse.data?.users || []);
        setStores(storesResponse.data?.stores || []);
      } catch (error) {
        setError(
          `Error loading dashboard data: ${
            error.response?.data?.message || error.message
          }`
        );
        console.error("Dashboard API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 font-semibold">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 rounded-lg">
          Total Users: {stats.users}
        </div>
        <div className="p-4 bg-green-100 rounded-lg">
          Total Stores: {stats.stores}
        </div>
        <div className="p-4 bg-yellow-100 rounded-lg">
          Total Ratings: {stats.ratings}
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Users</h3>
      <ul className="border rounded-lg p-4">
        {users.length > 0 ? (
          users.map((u) => (
            <li key={u.id} className="p-2 border-b">
              {u.name} - {u.email} - {u.role}
            </li>
          ))
        ) : (
          <li>No users found.</li>
        )}
      </ul>

      <h3 className="text-lg font-semibold mt-6">Stores</h3>
      <ul className="border rounded-lg p-4">
        {stores.length > 0 ? (
          stores.map((s) => (
            <li key={s.id} className="p-2 border-b">
              {s.name} - {s.address} - Rating: {s.rating}
            </li>
          ))
        ) : (
          <li>No stores available.</li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
