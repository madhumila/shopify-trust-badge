import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const BadgeWidget = ({ productId }) => {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    // Fetch badges for the product from the Node backend
    fetch("/api/badges")
      .then((res) => res.json())
      .then((data) => setBadges(data.badges))
      .catch((error) => console.error("Error fetching badges:", error));
  }, []);

  return (
    <div className="badge-widget">
      {badges.length > 0 ? (
        badges.map((badge) => <div key={badge.id} className="badge">{badge.name}</div>)
      ) : (
        <p>No trust badges available for this product.</p>
      )}
    </div>
  );
};

export default BadgeWidget;
