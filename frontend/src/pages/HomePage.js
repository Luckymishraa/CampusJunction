import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'CampusJunction';

    const fetchMessage = async () => {
      try {
        const response = await axios.get('http://localhost:5000/');
        setMessage(response.data.message);
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };

    fetchMessage();
  }, []);

  return (
    <div>
      <h2>Home Page</h2>
      <p>{message}</p>
    </div>
  );
}

export default HomePage;