import React from 'react';
import './SkeletonFigure.css';
import SkeletonImg from '../assests/sq.jpg'
const SkeletonFigure = () => {
  
        return (
          <div className="skeleton-container">
            <h2>Analyse Corporelle</h2>
            <div className="skeleton-wrapper">
              <img src={SkeletonImg} alt="Analyse squelette" className="skeleton-img" />
              <div className="scan-line" />
            </div>
          </div>
        );
      };
      
      


export default SkeletonFigure;
