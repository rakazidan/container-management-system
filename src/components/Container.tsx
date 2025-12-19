import React, { useState } from 'react';
import type { Container as ContainerType } from '../types/container';
import './Container.css';

interface ContainerProps {
  container: ContainerType;
  zoneName: string;
  isSearchActive?: boolean;
  isSearchedContainer?: boolean;
}

const Container: React.FC<ContainerProps> = ({ 
  container,
  zoneName,
  isSearchActive = false,
  isSearchedContainer = false 
}) => {
  const [showModal, setShowModal] = useState(false);

  const getStackClass = (count: number) => {
    return `stack-${count}`;
  };

  const handleClick = () => {
    if (container.stackCount > 0 && (!isSearchActive || isSearchedContainer)) {
      setShowModal(true);
    }
  };

  const isDisabled = isSearchActive && !isSearchedContainer;

  return (
    <>
      <div 
        className={`container-box ${getStackClass(container.stackCount)} ${isDisabled ? 'disabled' : ''} ${isSearchedContainer ? 'searched' : ''}`}
        onClick={handleClick}
      >
        <div className="container-id">{zoneName}{container.id}</div>
        <div className="stack-count">{container.stackCount}</div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Zone</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-info-row">
                <div className="modal-info-item">
                  <span className="modal-info-label">Zone</span>
                  <span className="modal-info-value">{zoneName}{container.id}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Total Stack</span>
                  <span className="modal-info-value">{container.stackCount}/4</span>
                </div>
              </div>
              {container.containerInfos.length > 0 ? (
                <table className="container-table-compact">
                  <thead>
                    <tr>
                      <th>Stack</th>
                      <th>Shipping Agent</th>
                      <th>Container Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {container.containerInfos.map((info) => (
                      <tr key={info.stackPosition}>
                        <td>{info.stackPosition}</td>
                        <td>{info.shippingAgent}</td>
                        <td className="container-number">{info.containerNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">No containers in this position</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Container;
