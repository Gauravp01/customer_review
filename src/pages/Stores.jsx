import React, { useEffect, useState } from "react";
import axios from "axios";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/stores");
        setStores(response.data || []); // Ensure stores is always an array
      } catch (err) {
        setError("Failed to load store data.");
        console.error("Error fetching store data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Stores</h2>
      <input
        type="text"
        placeholder="Search by name or address"
        className="w-full px-4 py-2 border rounded-md mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filteredStores.length === 0 ? (
        <div className="text-gray-500">No stores found.</div>
      ) : (
        <table className="w-full bg-white rounded-md shadow">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Store Name</th>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map((store) => (
              <tr key={store.id} className="border-b">
                <td className="p-2">{store.name}</td>
                <td className="p-2">{store.address}</td>
                <td className="p-2">{store.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Stores;
