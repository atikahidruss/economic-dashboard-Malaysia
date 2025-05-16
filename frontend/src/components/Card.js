// components/Card.js
import React from "react";
import "./Card.css";

const Card = ({ title, value, percentage, description, color }) => {
  return (
    <div className={`card ${color}`}>
      <h4>{title}</h4>
      <h2>{value}</h2>
      <p className="percentage">{percentage}</p>
      <p className="desc">{description}</p>
    </div>
  );
};

export default Card;
