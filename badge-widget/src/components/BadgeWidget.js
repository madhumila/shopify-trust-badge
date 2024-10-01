import { h, render } from 'preact';
import { useEffect, useState } from 'react';

const BadgeWidget = () => {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetch("https://keyboards-insurance-colleague-human.trycloudflare.com/api/badges")
      .then(response => response.json())
      .then(data => setBadges(data))
      .catch(error => console.log('Error fetching badges:', error));
  }, []);

  return (
    <div className="badge-container">
      {badges.map(badge => (
        <div className="badge" key={badge.id}>
          {badge.badgeName}
        </div>
      ))}
    </div>
  );
};

export default BadgeWidget;