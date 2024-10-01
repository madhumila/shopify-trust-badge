import React, { useState } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer'; // Import the Buffer from 'buffer' package
import './BadgeCard.css'; // Import CSS for styling
import { useTranslation, Trans } from "react-i18next";


const BadgeCard = ({ badge }) => {

    const { t } = useTranslation();

  // Local state for the checkbox
  const [isEnabled, setIsEnabled] = useState(badge.isEnabled);

  // Convert buffer to base64
  const base64String = Buffer.from(badge.badgeIcon.data).toString('base64');

  // Function to handle checkbox toggle
  const handleCheckboxChange = () => {
    // Toggle isEnabled
    const updatedIsEnabled = !isEnabled;
    setIsEnabled(updatedIsEnabled);

    fetch(`/api/badges/${badge._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isEnabled: updatedIsEnabled }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(`Badge ${badge.badgeName} updated: isEnabled = ${data.isEnabled}`);
      })
      .catch(error => {
        console.error("Failed to update the badge", error);
        setIsEnabled(isEnabled);
      });
  };

  return (
    <div className="card">
      <img 
        src={`data:image/png;base64,${base64String}`} 
        alt={badge.badgeName} 
        className="badge-image" 
      />
      <div className="card-body">
        <div className="checkbox-container">
          <label>
            <input 
              type="checkbox" 
              checked={isEnabled} 
              onChange={handleCheckboxChange}
            /> 
          </label>
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;