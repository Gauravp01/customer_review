import React, { useState, useEffect } from "react";

const StoreOwner = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const data = await new Promise((resolve) =>
          setTimeout(() => resolve({ name: "Tech Store", rating: 4.5 }), 1000)
        );
        setStoreData(data);
      } catch (err) {
        setError("Failed to load store data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Store Owner Dashboard</h2>
      <p className="mb-4">Manage your store ratings and details here.</p>
      {storeData && (
        <div className="bg-white p-4 rounded-md shadow-md">
          <h3 className="text-xl font-semibold mb-2">{storeData.name}</h3>
          <p>Rating: {storeData.rating}</p>
        </div>
      )}
    </div>
  );
};

export default StoreOwner;
